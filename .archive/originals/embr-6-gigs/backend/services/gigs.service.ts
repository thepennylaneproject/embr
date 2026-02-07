import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike, Between, In } from 'typeorm';
import { Gig } from '../entities/gig.entity';
import { 
  CreateGigDto, 
  UpdateGigDto, 
  GigSearchDto 
} from '../dto/gig.dto';
import {
  GigStatus,
  PaginatedGigs,
  GigWithDetails,
  GigStats,
} from '../../shared/types/gig.types';

@Injectable()
export class GigsService {
  constructor(
    @InjectRepository(Gig)
    private gigsRepository: Repository<Gig>,
  ) {}

  /**
   * Create a new gig posting
   */
  async create(creatorId: string, createGigDto: CreateGigDto): Promise<Gig> {
    // Validate budget range
    if (createGigDto.budgetMin > createGigDto.budgetMax) {
      throw new BadRequestException('Budget minimum cannot exceed maximum');
    }

    // Validate expiration date
    if (createGigDto.expiresAt && createGigDto.expiresAt < new Date()) {
      throw new BadRequestException('Expiration date cannot be in the past');
    }

    const gig = this.gigsRepository.create({
      ...createGigDto,
      creatorId,
      status: GigStatus.DRAFT,
      applicationsCount: 0,
      viewsCount: 0,
    });

    return await this.gigsRepository.save(gig);
  }

  /**
   * Publish a draft gig (make it visible to others)
   */
  async publish(gigId: string, creatorId: string): Promise<Gig> {
    const gig = await this.findOne(gigId);
    
    if (gig.creatorId !== creatorId) {
      throw new ForbiddenException('Only the creator can publish this gig');
    }

    if (gig.status !== GigStatus.DRAFT) {
      throw new BadRequestException('Only draft gigs can be published');
    }

    gig.status = GigStatus.OPEN;
    return await this.gigsRepository.save(gig);
  }

  /**
   * Find all gigs with advanced search and filtering
   */
  async findAll(searchDto: GigSearchDto): Promise<PaginatedGigs> {
    const { query, category, budgetMin, budgetMax, budgetType, experienceLevel, skills, sortBy, page = 1, limit = 20 } = searchDto;

    const queryBuilder = this.gigsRepository
      .createQueryBuilder('gig')
      .leftJoinAndSelect('gig.creator', 'creator')
      .where('gig.status = :status', { status: GigStatus.OPEN });

    // Text search
    if (query) {
      queryBuilder.andWhere(
        '(gig.title ILIKE :query OR gig.description ILIKE :query OR :query = ANY(gig.skills))',
        { query: `%${query}%` }
      );
    }

    // Category filter
    if (category) {
      queryBuilder.andWhere('gig.category = :category', { category });
    }

    // Budget filters
    if (budgetMin !== undefined) {
      queryBuilder.andWhere('gig.budgetMax >= :budgetMin', { budgetMin });
    }
    if (budgetMax !== undefined) {
      queryBuilder.andWhere('gig.budgetMin <= :budgetMax', { budgetMax });
    }

    // Budget type filter
    if (budgetType) {
      queryBuilder.andWhere('gig.budgetType = :budgetType', { budgetType });
    }

    // Experience level filter
    if (experienceLevel) {
      queryBuilder.andWhere('gig.experienceLevel = :experienceLevel', { experienceLevel });
    }

    // Skills filter (matches any skill)
    if (skills && skills.length > 0) {
      queryBuilder.andWhere('gig.skills && :skills', { skills });
    }

    // Sorting
    switch (sortBy) {
      case 'budget_high':
        queryBuilder.orderBy('gig.budgetMax', 'DESC');
        break;
      case 'budget_low':
        queryBuilder.orderBy('gig.budgetMin', 'ASC');
        break;
      case 'deadline':
        queryBuilder.orderBy('gig.expiresAt', 'ASC', 'NULLS LAST');
        break;
      case 'recent':
      default:
        queryBuilder.orderBy('gig.createdAt', 'DESC');
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [gigs, total] = await queryBuilder.getManyAndCount();

    return {
      gigs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one gig by ID with details
   */
  async findOne(id: string): Promise<GigWithDetails> {
    const gig = await this.gigsRepository.findOne({
      where: { id },
      relations: ['creator', 'acceptedApplication', 'acceptedApplication.applicant', 'milestones', 'escrow'],
    });

    if (!gig) {
      throw new NotFoundException('Gig not found');
    }

    return gig as GigWithDetails;
  }

  /**
   * Find gigs created by a specific user
   */
  async findByCreator(creatorId: string, page = 1, limit = 20): Promise<PaginatedGigs> {
    const skip = (page - 1) * limit;
    
    const [gigs, total] = await this.gigsRepository.findAndCount({
      where: { creatorId },
      relations: ['creator'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      gigs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update a gig
   */
  async update(id: string, creatorId: string, updateGigDto: UpdateGigDto): Promise<Gig> {
    const gig = await this.findOne(id);

    if (gig.creatorId !== creatorId) {
      throw new ForbiddenException('Only the creator can update this gig');
    }

    // Don't allow editing gigs that are in progress or completed
    if ([GigStatus.IN_PROGRESS, GigStatus.COMPLETED].includes(gig.status)) {
      throw new BadRequestException('Cannot edit gigs that are in progress or completed');
    }

    // Validate budget range if both are provided
    const newBudgetMin = updateGigDto.budgetMin ?? gig.budgetMin;
    const newBudgetMax = updateGigDto.budgetMax ?? gig.budgetMax;
    if (newBudgetMin > newBudgetMax) {
      throw new BadRequestException('Budget minimum cannot exceed maximum');
    }

    Object.assign(gig, updateGigDto);
    return await this.gigsRepository.save(gig);
  }

  /**
   * Cancel a gig
   */
  async cancel(id: string, creatorId: string): Promise<Gig> {
    const gig = await this.findOne(id);

    if (gig.creatorId !== creatorId) {
      throw new ForbiddenException('Only the creator can cancel this gig');
    }

    if (gig.status === GigStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed gig');
    }

    if (gig.status === GigStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot cancel a gig in progress. Please raise a dispute instead.');
    }

    gig.status = GigStatus.CANCELLED;
    return await this.gigsRepository.save(gig);
  }

  /**
   * Mark gig as in progress (when application is accepted)
   */
  async markInProgress(id: string): Promise<Gig> {
    const gig = await this.findOne(id);
    gig.status = GigStatus.IN_PROGRESS;
    return await this.gigsRepository.save(gig);
  }

  /**
   * Mark gig as completed
   */
  async markCompleted(id: string, userId: string): Promise<Gig> {
    const gig = await this.findOne(id);

    // Only creator can mark as completed
    if (gig.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can mark this gig as completed');
    }

    if (gig.status !== GigStatus.IN_PROGRESS) {
      throw new BadRequestException('Only gigs in progress can be marked as completed');
    }

    gig.status = GigStatus.COMPLETED;
    return await this.gigsRepository.save(gig);
  }

  /**
   * Increment view count
   */
  async incrementViews(id: string): Promise<void> {
    await this.gigsRepository.increment({ id }, 'viewsCount', 1);
  }

  /**
   * Increment application count
   */
  async incrementApplications(id: string): Promise<void> {
    await this.gigsRepository.increment({ id }, 'applicationsCount', 1);
  }

  /**
   * Get statistics for a creator
   */
  async getCreatorStats(creatorId: string): Promise<GigStats> {
    const gigs = await this.gigsRepository.find({
      where: { creatorId },
    });

    const totalGigs = gigs.length;
    const activeGigs = gigs.filter(g => g.status === GigStatus.OPEN || g.status === GigStatus.IN_PROGRESS).length;
    const completedGigs = gigs.filter(g => g.status === GigStatus.COMPLETED).length;

    // These would come from actual payment/review records in production
    const totalSpent = 0; // Sum of all payments made for completed gigs
    const totalEarned = 0; // Sum of all payments received for completed work
    const averageRating = 0;
    const reviewsCount = 0;

    return {
      totalGigs,
      activeGigs,
      completedGigs,
      totalEarned,
      totalSpent,
      averageRating,
      reviewsCount,
    };
  }

  /**
   * Get recommended gigs for a user based on their skills/interests
   */
  async getRecommendedGigs(userId: string, limit = 10): Promise<Gig[]> {
    // In production, this would use user's profile, past applications, skills, etc.
    // For now, return recent popular gigs
    return await this.gigsRepository.find({
      where: { status: GigStatus.OPEN },
      order: { 
        viewsCount: 'DESC',
        applicationsCount: 'DESC',
        createdAt: 'DESC',
      },
      take: limit,
      relations: ['creator'],
    });
  }

  /**
   * Soft delete a gig
   */
  async remove(id: string, creatorId: string): Promise<void> {
    const gig = await this.findOne(id);

    if (gig.creatorId !== creatorId) {
      throw new ForbiddenException('Only the creator can delete this gig');
    }

    if (gig.status === GigStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot delete a gig in progress');
    }

    await this.gigsRepository.softDelete(id);
  }
}
