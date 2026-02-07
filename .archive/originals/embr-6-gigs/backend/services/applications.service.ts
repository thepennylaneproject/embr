import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../entities/application.entity';
import { GigMilestone } from '../entities/milestone.entity';
import { 
  CreateApplicationDto,
  UpdateApplicationStatusDto,
} from '../dto/gig.dto';
import {
  ApplicationStatus,
  GigStatus,
  PaginatedApplications,
  ApplicationWithDetails,
} from '../../shared/types/gig.types';
import { GigsService } from './gigs.service';
import { EscrowService } from './escrow.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(GigMilestone)
    private milestonesRepository: Repository<GigMilestone>,
    private gigsService: GigsService,
    private escrowService: EscrowService,
  ) {}

  /**
   * Create a new application for a gig
   */
  async create(applicantId: string, createApplicationDto: CreateApplicationDto): Promise<Application> {
    const { gigId, milestones, ...applicationData } = createApplicationDto;

    // Validate gig exists and is open
    const gig = await this.gigsService.findOne(gigId);
    
    if (gig.status !== GigStatus.OPEN) {
      throw new BadRequestException('This gig is not accepting applications');
    }

    if (gig.creatorId === applicantId) {
      throw new BadRequestException('Cannot apply to your own gig');
    }

    // Check if user already applied
    const existingApplication = await this.applicationsRepository.findOne({
      where: { gigId, applicantId },
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied to this gig');
    }

    // Validate milestone amounts sum to proposed budget
    if (milestones && milestones.length > 0) {
      const totalMilestoneAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
      if (Math.abs(totalMilestoneAmount - applicationData.proposedBudget) > 0.01) {
        throw new BadRequestException('Milestone amounts must sum to proposed budget');
      }
    }

    const application = this.applicationsRepository.create({
      ...applicationData,
      gigId,
      applicantId,
      status: ApplicationStatus.PENDING,
    });

    const savedApplication = await this.applicationsRepository.save(application);

    // Increment application count on gig
    await this.gigsService.incrementApplications(gigId);

    return savedApplication;
  }

  /**
   * Find all applications for a gig (for gig creator)
   */
  async findByGig(gigId: string, creatorId: string, page = 1, limit = 20): Promise<PaginatedApplications> {
    // Verify user is the gig creator
    const gig = await this.gigsService.findOne(gigId);
    if (gig.creatorId !== creatorId) {
      throw new ForbiddenException('You can only view applications for your own gigs');
    }

    const skip = (page - 1) * limit;
    
    const [applications, total] = await this.applicationsRepository.findAndCount({
      where: { gigId },
      relations: ['applicant', 'gig'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find all applications submitted by a user
   */
  async findByApplicant(applicantId: string, page = 1, limit = 20): Promise<PaginatedApplications> {
    const skip = (page - 1) * limit;
    
    const [applications, total] = await this.applicationsRepository.findAndCount({
      where: { applicantId },
      relations: ['applicant', 'gig', 'gig.creator'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one application with full details
   */
  async findOne(id: string): Promise<ApplicationWithDetails> {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['applicant', 'gig', 'gig.creator', 'escrow', 'milestones'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application as ApplicationWithDetails;
  }

  /**
   * Accept an application (gig creator action)
   */
  async accept(id: string, creatorId: string): Promise<Application> {
    const application = await this.findOne(id);
    const gig = application.gig;

    // Verify user is the gig creator
    if (gig.creatorId !== creatorId) {
      throw new ForbiddenException('Only the gig creator can accept applications');
    }

    if (gig.status !== GigStatus.OPEN) {
      throw new BadRequestException('This gig is not accepting applications');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Only pending applications can be accepted');
    }

    // Reject all other pending applications
    await this.applicationsRepository.update(
      { gigId: gig.id, status: ApplicationStatus.PENDING },
      { status: ApplicationStatus.REJECTED }
    );

    // Accept this application
    application.status = ApplicationStatus.ACCEPTED;
    const savedApplication = await this.applicationsRepository.save(application);

    // Update gig status to in progress
    await this.gigsService.markInProgress(gig.id);

    // Create escrow if milestones were proposed
    if (application.milestones && application.milestones.length > 0) {
      await this.escrowService.create({
        gigId: gig.id,
        applicationId: application.id,
        payerId: gig.creatorId,
        payeeId: application.applicantId,
        amount: application.proposedBudget,
      });

      // Create milestone records from proposals
      for (let i = 0; i < application.milestones.length; i++) {
        const proposal = application.milestones[i];
        await this.milestonesRepository.save({
          gigId: gig.id,
          applicationId: application.id,
          title: proposal.title,
          description: proposal.description,
          amount: proposal.amount,
          dueDate: new Date(Date.now() + proposal.estimatedDays * 24 * 60 * 60 * 1000),
          order: i,
          status: 'PENDING',
        });
      }
    }

    return savedApplication;
  }

  /**
   * Reject an application (gig creator action)
   */
  async reject(id: string, creatorId: string): Promise<Application> {
    const application = await this.findOne(id);
    const gig = application.gig;

    if (gig.creatorId !== creatorId) {
      throw new ForbiddenException('Only the gig creator can reject applications');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Only pending applications can be rejected');
    }

    application.status = ApplicationStatus.REJECTED;
    return await this.applicationsRepository.save(application);
  }

  /**
   * Withdraw an application (applicant action)
   */
  async withdraw(id: string, applicantId: string): Promise<Application> {
    const application = await this.findOne(id);

    if (application.applicantId !== applicantId) {
      throw new ForbiddenException('You can only withdraw your own applications');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Only pending applications can be withdrawn');
    }

    application.status = ApplicationStatus.WITHDRAWN;
    return await this.applicationsRepository.save(application);
  }

  /**
   * Update application status (internal use)
   */
  async updateStatus(id: string, status: ApplicationStatus): Promise<Application> {
    const application = await this.findOne(id);
    application.status = status;
    return await this.applicationsRepository.save(application);
  }

  /**
   * Get application statistics for a user
   */
  async getApplicantStats(applicantId: string) {
    const applications = await this.applicationsRepository.find({
      where: { applicantId },
    });

    return {
      totalApplications: applications.length,
      pending: applications.filter(a => a.status === ApplicationStatus.PENDING).length,
      accepted: applications.filter(a => a.status === ApplicationStatus.ACCEPTED).length,
      rejected: applications.filter(a => a.status === ApplicationStatus.REJECTED).length,
      withdrawn: applications.filter(a => a.status === ApplicationStatus.WITHDRAWN).length,
    };
  }
}
