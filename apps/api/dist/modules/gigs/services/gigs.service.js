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
exports.GigsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const gig_types_1 = require("../../../shared/types/gig.types");
let GigsService = class GigsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(creatorId, createGigDto) {
        if (createGigDto.budgetMin > createGigDto.budgetMax) {
            throw new common_1.BadRequestException('Budget minimum cannot exceed maximum');
        }
        if (createGigDto.expiresAt && createGigDto.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Expiration date cannot be in the past');
        }
        return await this.prisma.gig.create({
            data: {
                ...createGigDto,
                category: createGigDto.category,
                budgetType: createGigDto.budgetType,
                experienceLevel: createGigDto.experienceLevel,
                creatorId,
                status: client_1.GigStatus.DRAFT,
                applicationsCount: 0,
                viewsCount: 0,
            },
        });
    }
    async publish(gigId, creatorId) {
        const gig = await this.findOne(gigId);
        if (gig.creatorId !== creatorId) {
            throw new common_1.ForbiddenException('Only the creator can publish this gig');
        }
        if (gig.status !== gig_types_1.GigStatus.DRAFT) {
            throw new common_1.BadRequestException('Only draft gigs can be published');
        }
        return await this.prisma.gig.update({
            where: { id: gigId },
            data: { status: client_1.GigStatus.OPEN },
        });
    }
    async findAll(searchDto) {
        const { query, category, budgetMin, budgetMax, budgetType, experienceLevel, skills, sortBy, page = 1, limit = 20, } = searchDto;
        const where = {
            status: client_1.GigStatus.OPEN,
            deletedAt: null,
        };
        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { skills: { hasSome: [query] } },
            ];
        }
        if (category) {
            where.category = category;
        }
        if (budgetMin !== undefined) {
            where.budgetMax = { gte: budgetMin };
        }
        if (budgetMax !== undefined) {
            where.budgetMin = { lte: budgetMax };
        }
        if (budgetType) {
            where.budgetType = budgetType;
        }
        if (experienceLevel) {
            where.experienceLevel = experienceLevel;
        }
        if (skills && skills.length > 0) {
            where.skills = { hasSome: skills };
        }
        const orderBy = sortBy === 'budget_high'
            ? { budgetMax: client_1.Prisma.SortOrder.desc }
            : sortBy === 'budget_low'
                ? { budgetMin: client_1.Prisma.SortOrder.asc }
                : sortBy === 'deadline'
                    ? { expiresAt: client_1.Prisma.SortOrder.asc }
                    : { createdAt: client_1.Prisma.SortOrder.desc };
        const skip = (page - 1) * limit;
        const [gigs, total] = await Promise.all([
            this.prisma.gig.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    creator: { include: { profile: true } },
                },
            }),
            this.prisma.gig.count({ where }),
        ]);
        return {
            gigs: gigs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const gig = await this.prisma.gig.findUnique({
            where: { id },
            include: {
                creator: { include: { profile: true } },
                milestones: true,
                escrows: true,
            },
        });
        if (!gig || gig.deletedAt) {
            throw new common_1.NotFoundException('Gig not found');
        }
        const acceptedApplication = await this.prisma.application.findFirst({
            where: { gigId: id, status: 'ACCEPTED' },
            include: {
                applicant: { include: { profile: true } },
                escrow: true,
                milestones: true,
            },
        });
        return {
            ...gig,
            acceptedApplication: acceptedApplication,
            milestones: gig.milestones,
            escrow: gig.escrows?.[0] ?? undefined,
        };
    }
    async findByCreator(creatorId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [gigs, total] = await Promise.all([
            this.prisma.gig.findMany({
                where: { creatorId, deletedAt: null },
                include: { creator: { include: { profile: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.gig.count({ where: { creatorId, deletedAt: null } }),
        ]);
        return {
            gigs: gigs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async update(id, creatorId, updateGigDto) {
        const gig = await this.findOne(id);
        if (gig.creatorId !== creatorId) {
            throw new common_1.ForbiddenException('Only the creator can update this gig');
        }
        if ([gig_types_1.GigStatus.IN_PROGRESS, gig_types_1.GigStatus.COMPLETED].includes(gig.status)) {
            throw new common_1.BadRequestException('Cannot edit gigs that are in progress or completed');
        }
        const newBudgetMin = updateGigDto.budgetMin ?? gig.budgetMin;
        const newBudgetMax = updateGigDto.budgetMax ?? gig.budgetMax;
        if (newBudgetMin > newBudgetMax) {
            throw new common_1.BadRequestException('Budget minimum cannot exceed maximum');
        }
        return await this.prisma.gig.update({
            where: { id },
            data: updateGigDto,
        });
    }
    async cancel(id, creatorId) {
        const gig = await this.findOne(id);
        if (gig.creatorId !== creatorId) {
            throw new common_1.ForbiddenException('Only the creator can cancel this gig');
        }
        if (gig.status === gig_types_1.GigStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot cancel a completed gig');
        }
        if (gig.status === gig_types_1.GigStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Cannot cancel a gig in progress. Please raise a dispute instead.');
        }
        return await this.prisma.gig.update({
            where: { id },
            data: { status: client_1.GigStatus.CANCELLED },
        });
    }
    async markInProgress(id) {
        return await this.prisma.gig.update({
            where: { id },
            data: { status: client_1.GigStatus.IN_PROGRESS },
        });
    }
    async markCompleted(id, userId) {
        const gig = await this.findOne(id);
        if (gig.creatorId !== userId) {
            throw new common_1.ForbiddenException('Only the creator can mark this gig as completed');
        }
        if (gig.status !== gig_types_1.GigStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Only gigs in progress can be marked as completed');
        }
        return await this.prisma.gig.update({
            where: { id },
            data: { status: client_1.GigStatus.COMPLETED },
        });
    }
    async incrementViews(id) {
        await this.prisma.gig.update({
            where: { id },
            data: { viewsCount: { increment: 1 } },
        });
    }
    async incrementApplications(id) {
        await this.prisma.gig.update({
            where: { id },
            data: { applicationsCount: { increment: 1 } },
        });
    }
    async getCreatorStats(creatorId) {
        const gigs = await this.prisma.gig.findMany({
            where: { creatorId, deletedAt: null },
        });
        const totalGigs = gigs.length;
        const activeGigs = gigs.filter(g => g.status === gig_types_1.GigStatus.OPEN || g.status === gig_types_1.GigStatus.IN_PROGRESS).length;
        const completedGigs = gigs.filter(g => g.status === gig_types_1.GigStatus.COMPLETED).length;
        return {
            totalGigs,
            activeGigs,
            completedGigs,
            totalEarned: 0,
            totalSpent: 0,
            averageRating: 0,
            reviewsCount: 0,
        };
    }
    async getRecommendedGigs(_userId, limit = 10) {
        const gigs = await this.prisma.gig.findMany({
            where: { status: client_1.GigStatus.OPEN, deletedAt: null },
            orderBy: [
                { viewsCount: 'desc' },
                { applicationsCount: 'desc' },
                { createdAt: 'desc' },
            ],
            take: limit,
            include: { creator: { include: { profile: true } } },
        });
        return gigs.map(gig => ({
            ...gig,
            status: gig.status,
            category: gig.category,
            budgetType: gig.budgetType,
            experienceLevel: gig.experienceLevel,
            creator: gig.creator.profile ? {
                id: gig.creator.id,
                username: gig.creator.profile.username,
                displayName: gig.creator.profile.displayName,
                avatar: gig.creator.profile.avatarUrl,
                bio: gig.creator.profile.bio,
                verified: gig.creator.profile.isVerified,
            } : undefined,
        }));
    }
    async remove(id, creatorId) {
        const gig = await this.findOne(id);
        if (gig.creatorId !== creatorId) {
            throw new common_1.ForbiddenException('Only the creator can delete this gig');
        }
        if (gig.status === gig_types_1.GigStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Cannot delete a gig in progress');
        }
        await this.prisma.gig.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.GigsService = GigsService;
exports.GigsService = GigsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GigsService);
//# sourceMappingURL=gigs.service.js.map