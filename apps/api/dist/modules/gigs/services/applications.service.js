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
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const gig_types_1 = require("../../../shared/types/gig.types");
const gigs_service_1 = require("./gigs.service");
const escrow_service_1 = require("./escrow.service");
let ApplicationsService = class ApplicationsService {
    constructor(prisma, gigsService, escrowService) {
        this.prisma = prisma;
        this.gigsService = gigsService;
        this.escrowService = escrowService;
    }
    async create(applicantId, createApplicationDto) {
        const { gigId, milestones, ...applicationData } = createApplicationDto;
        const gig = await this.gigsService.findOne(gigId);
        if (gig.status !== gig_types_1.GigStatus.OPEN) {
            throw new common_1.BadRequestException('This gig is not accepting applications');
        }
        if (gig.creatorId === applicantId) {
            throw new common_1.BadRequestException('Cannot apply to your own gig');
        }
        const existingApplication = await this.prisma.application.findUnique({
            where: { gigId_applicantId: { gigId, applicantId } },
        });
        if (existingApplication) {
            throw new common_1.BadRequestException('You have already applied to this gig');
        }
        if (milestones && milestones.length > 0) {
            const totalMilestoneAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
            if (Math.abs(totalMilestoneAmount - applicationData.proposedBudget) > 0.01) {
                throw new common_1.BadRequestException('Milestone amounts must sum to proposed budget');
            }
        }
        const application = await this.prisma.application.create({
            data: {
                ...applicationData,
                gigId,
                applicantId,
                status: gig_types_1.ApplicationStatus.PENDING,
                milestoneProposals: (milestones ? milestones : undefined),
            },
        });
        await this.gigsService.incrementApplications(gigId);
        return {
            ...application,
            milestoneProposals: application.milestoneProposals,
        };
    }
    async findByGig(gigId, creatorId, page = 1, limit = 20) {
        const gig = await this.gigsService.findOne(gigId);
        if (gig.creatorId !== creatorId) {
            throw new common_1.ForbiddenException('You can only view applications for your own gigs');
        }
        const skip = (page - 1) * limit;
        const [applications, total] = await Promise.all([
            this.prisma.application.findMany({
                where: { gigId },
                include: {
                    applicant: { include: { profile: true } },
                    gig: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.application.count({ where: { gigId } }),
        ]);
        return {
            applications: applications.map(app => ({
                ...app,
                milestoneProposals: app.milestoneProposals,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findByApplicant(applicantId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [applications, total] = await Promise.all([
            this.prisma.application.findMany({
                where: { applicantId },
                include: {
                    applicant: { include: { profile: true } },
                    gig: { include: { creator: { include: { profile: true } } } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.application.count({ where: { applicantId } }),
        ]);
        return {
            applications: applications.map(app => ({
                ...app,
                milestoneProposals: app.milestoneProposals,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: {
                applicant: { include: { profile: true } },
                gig: { include: { creator: { include: { profile: true } } } },
                escrow: true,
                milestones: true,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        return {
            ...application,
            milestoneProposals: application.milestoneProposals,
        };
    }
    async accept(id, creatorId) {
        const application = await this.findOne(id);
        const gig = application.gig;
        if (gig.creatorId !== creatorId) {
            throw new common_1.ForbiddenException('Only the gig creator can accept applications');
        }
        if (gig.status !== gig_types_1.GigStatus.OPEN) {
            throw new common_1.BadRequestException('This gig is not accepting applications');
        }
        if (application.status !== gig_types_1.ApplicationStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending applications can be accepted');
        }
        await this.prisma.application.updateMany({
            where: { gigId: gig.id, status: gig_types_1.ApplicationStatus.PENDING },
            data: { status: gig_types_1.ApplicationStatus.REJECTED },
        });
        const savedApplication = await this.prisma.application.update({
            where: { id: application.id },
            data: { status: gig_types_1.ApplicationStatus.ACCEPTED },
        });
        await this.gigsService.markInProgress(gig.id);
        const proposals = application.milestoneProposals;
        if (proposals && proposals.length > 0) {
            await this.escrowService.create({
                gigId: gig.id,
                applicationId: application.id,
                payerId: gig.creatorId,
                payeeId: application.applicantId,
                amount: application.proposedBudget,
            });
            for (let i = 0; i < proposals.length; i++) {
                const proposal = proposals[i];
                await this.prisma.gigMilestone.create({
                    data: {
                        gigId: gig.id,
                        applicationId: application.id,
                        title: proposal.title,
                        description: proposal.description,
                        amount: proposal.amount,
                        dueDate: new Date(Date.now() + proposal.estimatedDays * 24 * 60 * 60 * 1000),
                        order: i,
                        status: 'PENDING',
                    },
                });
            }
        }
        return {
            ...savedApplication,
            milestoneProposals: savedApplication.milestoneProposals,
        };
    }
    async reject(id, creatorId) {
        const application = await this.findOne(id);
        const gig = application.gig;
        if (gig.creatorId !== creatorId) {
            throw new common_1.ForbiddenException('Only the gig creator can reject applications');
        }
        if (application.status !== gig_types_1.ApplicationStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending applications can be rejected');
        }
        const updatedApp = await this.prisma.application.update({
            where: { id: application.id },
            data: { status: gig_types_1.ApplicationStatus.REJECTED },
        });
        return {
            ...updatedApp,
            milestoneProposals: updatedApp.milestoneProposals,
        };
    }
    async withdraw(id, applicantId) {
        const application = await this.findOne(id);
        if (application.applicantId !== applicantId) {
            throw new common_1.ForbiddenException('You can only withdraw your own applications');
        }
        if (application.status !== gig_types_1.ApplicationStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending applications can be withdrawn');
        }
        const updatedApp = await this.prisma.application.update({
            where: { id: application.id },
            data: { status: gig_types_1.ApplicationStatus.WITHDRAWN },
        });
        return {
            ...updatedApp,
            milestoneProposals: updatedApp.milestoneProposals,
        };
    }
    async updateStatus(id, status) {
        return await this.prisma.application.update({
            where: { id },
            data: { status },
        });
    }
    async getApplicantStats(applicantId) {
        const applications = await this.prisma.application.findMany({
            where: { applicantId },
        });
        return {
            totalApplications: applications.length,
            pending: applications.filter(a => a.status === gig_types_1.ApplicationStatus.PENDING).length,
            accepted: applications.filter(a => a.status === gig_types_1.ApplicationStatus.ACCEPTED).length,
            rejected: applications.filter(a => a.status === gig_types_1.ApplicationStatus.REJECTED).length,
            withdrawn: applications.filter(a => a.status === gig_types_1.ApplicationStatus.WITHDRAWN).length,
        };
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        gigs_service_1.GigsService,
        escrow_service_1.EscrowService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map