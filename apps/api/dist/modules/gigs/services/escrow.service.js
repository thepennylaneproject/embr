"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const gig_types_1 = require("../../../shared/types/gig.types");
const stripe_1 = require("stripe");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});
let EscrowService = class EscrowService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(params) {
        const { gigId, applicationId, payerId, payeeId, amount, currency = 'USD' } = params;
        const existingEscrow = await this.prisma.escrow.findUnique({
            where: { applicationId },
        });
        if (existingEscrow) {
            throw new common_1.BadRequestException('Escrow already exists for this application');
        }
        return await this.prisma.escrow.create({
            data: {
                gigId,
                applicationId,
                payerId,
                payeeId,
                amount,
                currency,
                status: gig_types_1.EscrowStatus.CREATED,
            },
        });
    }
    async fund(escrowId, payerId, fundEscrowDto) {
        const escrow = await this.findOne(escrowId);
        if (escrow.payerId !== payerId) {
            throw new common_1.ForbiddenException('Only the payer can fund this escrow');
        }
        if (escrow.status !== gig_types_1.EscrowStatus.CREATED) {
            throw new common_1.BadRequestException('Escrow has already been funded or is in an invalid state');
        }
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(escrow.amount * 100),
                currency: escrow.currency.toLowerCase(),
                payment_method: fundEscrowDto.stripePaymentMethodId,
                confirm: true,
                capture_method: 'manual',
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
                return await this.prisma.escrow.update({
                    where: { id: escrow.id },
                    data: {
                        status: gig_types_1.EscrowStatus.FUNDED,
                        stripePaymentIntentId: paymentIntent.id,
                        stripeFundingMethod: fundEscrowDto.stripePaymentMethodId,
                        fundedAt: new Date(),
                    },
                });
            }
            throw new common_1.BadRequestException(`Payment failed with status: ${paymentIntent.status}`);
        }
        catch (error) {
            if (error instanceof stripe_1.default.errors.StripeError) {
                throw new common_1.BadRequestException(`Stripe error: ${error.message}`);
            }
            throw error;
        }
    }
    async releaseMilestone(escrowId, payerId, releaseMilestoneDto) {
        const escrow = await this.findOne(escrowId);
        const milestone = await this.prisma.gigMilestone.findUnique({
            where: { id: releaseMilestoneDto.milestoneId },
        });
        if (!milestone) {
            throw new common_1.NotFoundException('Milestone not found');
        }
        if (escrow.payerId !== payerId) {
            throw new common_1.ForbiddenException('Only the payer can release milestone payments');
        }
        if (escrow.status !== gig_types_1.EscrowStatus.FUNDED) {
            throw new common_1.BadRequestException('Escrow must be funded before releasing payments');
        }
        if (milestone.status !== gig_types_1.MilestoneStatus.SUBMITTED) {
            throw new common_1.BadRequestException('Milestone must be submitted before payment can be released');
        }
        try {
            const transferAmount = Math.round(milestone.amount * 100);
            await stripe.paymentIntents.capture(escrow.stripePaymentIntentId, {
                amount_to_capture: transferAmount,
            });
            const updatedMilestone = await this.prisma.gigMilestone.update({
                where: { id: milestone.id },
                data: { status: gig_types_1.MilestoneStatus.APPROVED, approvedAt: new Date() },
            });
            const allMilestones = await this.prisma.gigMilestone.findMany({
                where: { applicationId: escrow.applicationId },
            });
            const allApproved = allMilestones.every(m => m.status === gig_types_1.MilestoneStatus.APPROVED);
            const updatedEscrow = await this.prisma.escrow.update({
                where: { id: escrow.id },
                data: allApproved
                    ? { status: gig_types_1.EscrowStatus.RELEASED, releasedAt: new Date() }
                    : {},
            });
            return { escrow: updatedEscrow, milestone: updatedMilestone };
        }
        catch (error) {
            if (error instanceof stripe_1.default.errors.StripeError) {
                throw new common_1.BadRequestException(`Stripe error: ${error.message}`);
            }
            throw error;
        }
    }
    async refund(escrowId, _adminId, _reason) {
        const escrow = await this.findOne(escrowId);
        if (![gig_types_1.EscrowStatus.FUNDED, gig_types_1.EscrowStatus.DISPUTED].includes(escrow.status)) {
            throw new common_1.BadRequestException('Can only refund funded or disputed escrows');
        }
        try {
            await stripe.paymentIntents.cancel(escrow.stripePaymentIntentId);
            return await this.prisma.escrow.update({
                where: { id: escrow.id },
                data: { status: gig_types_1.EscrowStatus.REFUNDED, refundedAt: new Date() },
            });
        }
        catch (error) {
            if (error instanceof stripe_1.default.errors.StripeError) {
                throw new common_1.BadRequestException(`Stripe error: ${error.message}`);
            }
            throw error;
        }
    }
    async markDisputed(escrowId) {
        const escrow = await this.findOne(escrowId);
        if (escrow.status !== gig_types_1.EscrowStatus.FUNDED) {
            throw new common_1.BadRequestException('Only funded escrows can be disputed');
        }
        return await this.prisma.escrow.update({
            where: { id: escrow.id },
            data: { status: gig_types_1.EscrowStatus.DISPUTED },
        });
    }
    async findOne(id) {
        const escrow = await this.prisma.escrow.findUnique({
            where: { id },
            include: {
                gig: true,
                application: true,
                payer: true,
                payee: true,
            },
        });
        if (!escrow) {
            throw new common_1.NotFoundException('Escrow not found');
        }
        return escrow;
    }
    async findByApplication(applicationId) {
        return await this.prisma.escrow.findUnique({
            where: { applicationId },
            include: {
                gig: true,
                application: true,
                payer: true,
                payee: true,
            },
        });
    }
    async getMilestones(applicationId) {
        return await this.prisma.gigMilestone.findMany({
            where: { applicationId },
            orderBy: { order: 'asc' },
        });
    }
    async submitMilestone(milestoneId, freelancerId) {
        const milestone = await this.prisma.gigMilestone.findUnique({
            where: { id: milestoneId },
            include: { application: true },
        });
        if (!milestone) {
            throw new common_1.NotFoundException('Milestone not found');
        }
        if (milestone.application.applicantId !== freelancerId) {
            throw new common_1.ForbiddenException('Only the assigned freelancer can submit milestones');
        }
        if (![gig_types_1.MilestoneStatus.PENDING, gig_types_1.MilestoneStatus.REJECTED].includes(milestone.status)) {
            throw new common_1.BadRequestException('Only pending or rejected milestones can be submitted');
        }
        return await this.prisma.gigMilestone.update({
            where: { id: milestone.id },
            data: { status: gig_types_1.MilestoneStatus.SUBMITTED, submittedAt: new Date() },
        });
    }
    async approveMilestone(milestoneId, clientId, feedback) {
        const milestone = await this.prisma.gigMilestone.findUnique({
            where: { id: milestoneId },
            include: { gig: true },
        });
        if (!milestone) {
            throw new common_1.NotFoundException('Milestone not found');
        }
        if (milestone.gig.creatorId !== clientId) {
            throw new common_1.ForbiddenException('Only the gig creator can approve milestones');
        }
        if (milestone.status !== gig_types_1.MilestoneStatus.SUBMITTED) {
            throw new common_1.BadRequestException('Only submitted milestones can be approved');
        }
        return await this.prisma.gigMilestone.update({
            where: { id: milestone.id },
            data: { status: gig_types_1.MilestoneStatus.APPROVED, approvedAt: new Date(), feedback },
        });
    }
    async rejectMilestone(milestoneId, clientId, feedback) {
        const milestone = await this.prisma.gigMilestone.findUnique({
            where: { id: milestoneId },
            include: { gig: true },
        });
        if (!milestone) {
            throw new common_1.NotFoundException('Milestone not found');
        }
        if (milestone.gig.creatorId !== clientId) {
            throw new common_1.ForbiddenException('Only the gig creator can reject milestones');
        }
        if (milestone.status !== gig_types_1.MilestoneStatus.SUBMITTED) {
            throw new common_1.BadRequestException('Only submitted milestones can be rejected');
        }
        if (!feedback) {
            throw new common_1.BadRequestException('Feedback is required when rejecting a milestone');
        }
        return await this.prisma.gigMilestone.update({
            where: { id: milestone.id },
            data: { status: gig_types_1.MilestoneStatus.REJECTED, rejectedAt: new Date(), feedback },
        });
    }
    async getReleasedAmount(escrowId) {
        const escrow = await this.findOne(escrowId);
        const milestones = await this.getMilestones(escrow.applicationId);
        return milestones
            .filter(m => m.status === gig_types_1.MilestoneStatus.APPROVED)
            .reduce((sum, m) => sum + m.amount, 0);
    }
};
exports.EscrowService = EscrowService;
exports.EscrowService = EscrowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EscrowService);
//# sourceMappingURL=escrow.service.js.map