import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Escrow } from '../entities/escrow.entity';
import { GigMilestone } from '../entities/milestone.entity';
import { 
  FundEscrowDto,
  ReleaseMilestoneDto,
  UpdateMilestoneDto,
} from '../dto/gig.dto';
import {
  EscrowStatus,
  MilestoneStatus,
} from '../../shared/types/gig.types';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

interface CreateEscrowParams {
  gigId: string;
  applicationId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  currency?: string;
}

@Injectable()
export class EscrowService {
  constructor(
    @InjectRepository(Escrow)
    private escrowRepository: Repository<Escrow>,
    @InjectRepository(GigMilestone)
    private milestonesRepository: Repository<GigMilestone>,
  ) {}

  /**
   * Create a new escrow account for a gig
   */
  async create(params: CreateEscrowParams): Promise<Escrow> {
    const { gigId, applicationId, payerId, payeeId, amount, currency = 'USD' } = params;

    // Check if escrow already exists for this application
    const existingEscrow = await this.escrowRepository.findOne({
      where: { applicationId },
    });

    if (existingEscrow) {
      throw new BadRequestException('Escrow already exists for this application');
    }

    const escrow = this.escrowRepository.create({
      gigId,
      applicationId,
      payerId,
      payeeId,
      amount,
      currency,
      status: EscrowStatus.CREATED,
    });

    return await this.escrowRepository.save(escrow);
  }

  /**
   * Fund the escrow using Stripe PaymentIntent
   */
  async fund(escrowId: string, payerId: string, fundEscrowDto: FundEscrowDto): Promise<Escrow> {
    const escrow = await this.findOne(escrowId);

    if (escrow.payerId !== payerId) {
      throw new ForbiddenException('Only the payer can fund this escrow');
    }

    if (escrow.status !== EscrowStatus.CREATED) {
      throw new BadRequestException('Escrow has already been funded or is in an invalid state');
    }

    try {
      // Create Stripe PaymentIntent to hold the funds
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(escrow.amount * 100), // Convert to cents
        currency: escrow.currency.toLowerCase(),
        payment_method: fundEscrowDto.stripePaymentMethodId,
        confirm: true,
        capture_method: 'manual', // Hold the funds, don't capture yet
        metadata: {
          escrowId: escrow.id,
          gigId: escrow.gigId,
          applicationId: escrow.applicationId,
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });

      if (paymentIntent.status === 'requires_capture') {
        escrow.status = EscrowStatus.FUNDED;
        escrow.stripePaymentIntentId = paymentIntent.id;
        escrow.stripeFundingMethod = fundEscrowDto.stripePaymentMethodId;
        escrow.fundedAt = new Date();

        return await this.escrowRepository.save(escrow);
      } else {
        throw new BadRequestException(`Payment failed with status: ${paymentIntent.status}`);
      }
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new BadRequestException(`Stripe error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Release payment for a specific milestone
   */
  async releaseMilestone(
    escrowId: string, 
    payerId: string, 
    releaseMilestoneDto: ReleaseMilestoneDto
  ): Promise<{ escrow: Escrow; milestone: GigMilestone }> {
    const escrow = await this.findOne(escrowId);
    const milestone = await this.milestonesRepository.findOne({
      where: { id: releaseMilestoneDto.milestoneId },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (escrow.payerId !== payerId) {
      throw new ForbiddenException('Only the payer can release milestone payments');
    }

    if (escrow.status !== EscrowStatus.FUNDED) {
      throw new BadRequestException('Escrow must be funded before releasing payments');
    }

    if (milestone.status !== MilestoneStatus.SUBMITTED) {
      throw new BadRequestException('Milestone must be submitted before payment can be released');
    }

    try {
      // Calculate the amount to transfer (milestone amount)
      const transferAmount = Math.round(milestone.amount * 100); // Convert to cents

      // Create a transfer to the payee (freelancer)
      // In production, you'd need the payee's Stripe Connected Account ID
      // For now, we'll use direct charge capture
      
      // Capture the funds from the PaymentIntent
      await stripe.paymentIntents.capture(escrow.stripePaymentIntentId!, {
        amount_to_capture: transferAmount,
      });

      // In production, create a transfer to the connected account:
      // await stripe.transfers.create({
      //   amount: transferAmount,
      //   currency: escrow.currency.toLowerCase(),
      //   destination: payeeStripeAccountId,
      //   metadata: {
      //     escrowId: escrow.id,
      //     milestoneId: milestone.id,
      //   },
      // });

      // Update milestone status
      milestone.status = MilestoneStatus.APPROVED;
      milestone.approvedAt = new Date();
      await this.milestonesRepository.save(milestone);

      // Check if all milestones are completed
      const allMilestones = await this.milestonesRepository.find({
        where: { applicationId: escrow.applicationId },
      });

      const allApproved = allMilestones.every(m => m.status === MilestoneStatus.APPROVED);

      if (allApproved) {
        escrow.status = EscrowStatus.RELEASED;
        escrow.releasedAt = new Date();
      }

      await this.escrowRepository.save(escrow);

      return { escrow, milestone };
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new BadRequestException(`Stripe error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Refund the entire escrow (in case of cancellation or dispute resolution)
   */
  async refund(escrowId: string, adminId: string, reason: string): Promise<Escrow> {
    const escrow = await this.findOne(escrowId);

    if (![EscrowStatus.FUNDED, EscrowStatus.DISPUTED].includes(escrow.status)) {
      throw new BadRequestException('Can only refund funded or disputed escrows');
    }

    try {
      // Cancel the PaymentIntent to release the hold
      await stripe.paymentIntents.cancel(escrow.stripePaymentIntentId!);

      escrow.status = EscrowStatus.REFUNDED;
      escrow.refundedAt = new Date();

      return await this.escrowRepository.save(escrow);
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new BadRequestException(`Stripe error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Mark escrow as disputed
   */
  async markDisputed(escrowId: string): Promise<Escrow> {
    const escrow = await this.findOne(escrowId);

    if (escrow.status !== EscrowStatus.FUNDED) {
      throw new BadRequestException('Only funded escrows can be disputed');
    }

    escrow.status = EscrowStatus.DISPUTED;
    return await this.escrowRepository.save(escrow);
  }

  /**
   * Get escrow details
   */
  async findOne(id: string): Promise<Escrow> {
    const escrow = await this.escrowRepository.findOne({
      where: { id },
      relations: ['gig', 'application', 'payer', 'payee'],
    });

    if (!escrow) {
      throw new NotFoundException('Escrow not found');
    }

    return escrow;
  }

  /**
   * Get escrow by application ID
   */
  async findByApplication(applicationId: string): Promise<Escrow | null> {
    return await this.escrowRepository.findOne({
      where: { applicationId },
      relations: ['gig', 'application', 'payer', 'payee'],
    });
  }

  /**
   * Get all milestones for an application
   */
  async getMilestones(applicationId: string): Promise<GigMilestone[]> {
    return await this.milestonesRepository.find({
      where: { applicationId },
      order: { order: 'ASC' },
    });
  }

  /**
   * Submit a milestone for review (freelancer action)
   */
  async submitMilestone(milestoneId: string, freelancerId: string): Promise<GigMilestone> {
    const milestone = await this.milestonesRepository.findOne({
      where: { id: milestoneId },
      relations: ['application'],
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (milestone.application.applicantId !== freelancerId) {
      throw new ForbiddenException('Only the assigned freelancer can submit milestones');
    }

    if (milestone.status !== MilestoneStatus.PENDING && milestone.status !== MilestoneStatus.REJECTED) {
      throw new BadRequestException('Only pending or rejected milestones can be submitted');
    }

    milestone.status = MilestoneStatus.SUBMITTED;
    milestone.submittedAt = new Date();

    return await this.milestonesRepository.save(milestone);
  }

  /**
   * Approve a milestone (client action)
   */
  async approveMilestone(milestoneId: string, clientId: string, feedback?: string): Promise<GigMilestone> {
    const milestone = await this.milestonesRepository.findOne({
      where: { id: milestoneId },
      relations: ['application', 'gig'],
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (milestone.gig.creatorId !== clientId) {
      throw new ForbiddenException('Only the gig creator can approve milestones');
    }

    if (milestone.status !== MilestoneStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted milestones can be approved');
    }

    milestone.status = MilestoneStatus.APPROVED;
    milestone.approvedAt = new Date();
    if (feedback) {
      milestone.feedback = feedback;
    }

    return await this.milestonesRepository.save(milestone);
  }

  /**
   * Reject a milestone (client action)
   */
  async rejectMilestone(milestoneId: string, clientId: string, feedback: string): Promise<GigMilestone> {
    const milestone = await this.milestonesRepository.findOne({
      where: { id: milestoneId },
      relations: ['application', 'gig'],
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (milestone.gig.creatorId !== clientId) {
      throw new ForbiddenException('Only the gig creator can reject milestones');
    }

    if (milestone.status !== MilestoneStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted milestones can be rejected');
    }

    if (!feedback) {
      throw new BadRequestException('Feedback is required when rejecting a milestone');
    }

    milestone.status = MilestoneStatus.REJECTED;
    milestone.rejectedAt = new Date();
    milestone.feedback = feedback;

    return await this.milestonesRepository.save(milestone);
  }

  /**
   * Calculate total amount released from escrow
   */
  async getReleasedAmount(escrowId: string): Promise<number> {
    const escrow = await this.findOne(escrowId);
    const milestones = await this.getMilestones(escrow.applicationId);
    
    return milestones
      .filter(m => m.status === MilestoneStatus.APPROVED)
      .reduce((sum, m) => sum + m.amount, 0);
  }
}
