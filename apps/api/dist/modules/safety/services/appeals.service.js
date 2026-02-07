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
exports.AppealsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../../notifications/notifications.service");
const moderation_actions_service_1 = require("./moderation-actions.service");
let AppealsService = class AppealsService {
    constructor(prisma, notificationsService, moderationActionsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.moderationActionsService = moderationActionsService;
    }
    async createAppeal(userId, dto) {
        const action = await this.prisma.moderationAction.findUnique({
            where: { id: dto.actionId },
            include: { user: true },
        });
        if (!action) {
            throw new common_1.NotFoundException('Moderation action not found');
        }
        if (action.userId !== userId) {
            throw new common_1.ForbiddenException('You can only appeal actions against your account');
        }
        if (!action.appealable) {
            throw new common_1.BadRequestException('This action cannot be appealed');
        }
        const existingAppeal = await this.prisma.appeal.findFirst({
            where: {
                actionId: dto.actionId,
                userId,
            },
        });
        if (existingAppeal) {
            throw new common_1.BadRequestException('You have already appealed this action');
        }
        const appeal = await this.prisma.appeal.create({
            data: {
                actionId: dto.actionId,
                userId,
                reason: dto.reason,
                status: client_1.AppealStatus.PENDING,
            },
            include: {
                action: {
                    include: {
                        moderator: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        profile: {
                            select: {
                                displayName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });
        await this.notifyModerators(appeal);
        return appeal;
    }
    async getAppeals(query) {
        const { page = 1, limit = 20, status } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        const [appeals, total] = await Promise.all([
            this.prisma.appeal.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            profile: {
                                select: {
                                    displayName: true,
                                    avatarUrl: true,
                                },
                            },
                        },
                    },
                    action: {
                        include: {
                            moderator: {
                                select: {
                                    id: true,
                                    username: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.appeal.count({ where }),
        ]);
        return {
            appeals,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getAppealById(appealId) {
        const appeal = await this.prisma.appeal.findUnique({
            where: { id: appealId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        profile: {
                            select: {
                                displayName: true,
                                avatarUrl: true,
                            },
                        },
                        _count: {
                            select: {
                                moderationActions: true,
                                reportsReceived: true,
                            },
                        },
                    },
                },
                action: {
                    include: {
                        moderator: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                        user: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                },
            },
        });
        if (!appeal) {
            throw new common_1.NotFoundException('Appeal not found');
        }
        return appeal;
    }
    async updateAppeal(appealId, moderatorId, dto) {
        const appeal = await this.prisma.appeal.findUnique({
            where: { id: appealId },
            include: {
                action: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!appeal) {
            throw new common_1.NotFoundException('Appeal not found');
        }
        if (appeal.status === client_1.AppealStatus.APPROVED ||
            appeal.status === client_1.AppealStatus.DENIED) {
            throw new common_1.BadRequestException('Appeal has already been resolved');
        }
        const updatedAppeal = await this.prisma.appeal.update({
            where: { id: appealId },
            data: {
                status: dto.status,
                reviewNote: dto.reviewNote,
                reviewerId: moderatorId,
                resolvedAt: new Date(),
            },
            include: {
                user: true,
                action: true,
            },
        });
        if (dto.status === client_1.AppealStatus.APPROVED) {
            await this.moderationActionsService.revokeAction(appeal.action.id, moderatorId, 'Appeal approved');
        }
        await this.notificationsService.create({
            userId: appeal.userId,
            type: 'appeal_resolved',
            title: dto.status === client_1.AppealStatus.APPROVED ? '✅ Appeal Approved' : '❌ Appeal Denied',
            body: dto.status === client_1.AppealStatus.APPROVED
                ? 'Your appeal has been approved and the action has been revoked'
                : `Your appeal has been denied. ${dto.reviewNote}`,
            metadata: {
                appealId: appeal.id,
                status: dto.status,
            },
        });
        return updatedAppeal;
    }
    async getUserAppeals(userId) {
        const appeals = await this.prisma.appeal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                action: {
                    include: {
                        moderator: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                },
            },
        });
        const pending = appeals.filter((a) => a.status === client_1.AppealStatus.PENDING).length;
        const underReview = appeals.filter((a) => a.status === client_1.AppealStatus.UNDER_REVIEW).length;
        const approved = appeals.filter((a) => a.status === client_1.AppealStatus.APPROVED).length;
        const denied = appeals.filter((a) => a.status === client_1.AppealStatus.DENIED).length;
        return {
            appeals,
            summary: {
                total: appeals.length,
                pending,
                underReview,
                approved,
                denied,
                approvalRate: appeals.length > 0
                    ? Math.round((approved / appeals.length) * 100)
                    : 0,
            },
        };
    }
    async getStats(days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const [totalAppeals, pending, underReview, approved, denied, avgResolutionTime,] = await Promise.all([
            this.prisma.appeal.count({
                where: { createdAt: { gte: since } },
            }),
            this.prisma.appeal.count({
                where: {
                    createdAt: { gte: since },
                    status: client_1.AppealStatus.PENDING,
                },
            }),
            this.prisma.appeal.count({
                where: {
                    createdAt: { gte: since },
                    status: client_1.AppealStatus.UNDER_REVIEW,
                },
            }),
            this.prisma.appeal.count({
                where: {
                    createdAt: { gte: since },
                    status: client_1.AppealStatus.APPROVED,
                },
            }),
            this.prisma.appeal.count({
                where: {
                    createdAt: { gte: since },
                    status: client_1.AppealStatus.DENIED,
                },
            }),
            this.getAverageResolutionTime(since),
        ]);
        const resolved = approved + denied;
        const approvalRate = resolved > 0 ? Math.round((approved / resolved) * 100) : 0;
        return {
            period: `Last ${days} days`,
            total: totalAppeals,
            byStatus: {
                pending,
                underReview,
                approved,
                denied,
            },
            approvalRate,
            averageResolutionTime: `${avgResolutionTime} hours`,
        };
    }
    async notifyModerators(appeal) {
        const moderators = await this.prisma.user.findMany({
            where: {
                role: { in: [client_1.UserRole.ADMIN, client_1.UserRole.MODERATOR] },
            },
            select: { id: true },
        });
        await Promise.all(moderators.map((mod) => this.notificationsService.create({
            userId: mod.id,
            type: 'appeal_submitted',
            title: '📝 New Appeal Submitted',
            body: `${appeal.user.username} has appealed a ${appeal.action.type}`,
            metadata: {
                appealId: appeal.id,
                actionType: appeal.action.type,
            },
        })));
    }
    async getAverageResolutionTime(since) {
        const resolvedAppeals = await this.prisma.appeal.findMany({
            where: {
                createdAt: { gte: since },
                status: { in: [client_1.AppealStatus.APPROVED, client_1.AppealStatus.DENIED] },
                resolvedAt: { not: null },
            },
            select: {
                createdAt: true,
                resolvedAt: true,
            },
        });
        if (resolvedAppeals.length === 0)
            return 0;
        const totalTime = resolvedAppeals.reduce((sum, appeal) => {
            const diff = appeal.resolvedAt.getTime() - appeal.createdAt.getTime();
            return sum + diff;
        }, 0);
        return Math.round(totalTime / resolvedAppeals.length / (1000 * 60 * 60));
    }
};
exports.AppealsService = AppealsService;
exports.AppealsService = AppealsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        moderation_actions_service_1.ModerationActionsService])
], AppealsService);
//# sourceMappingURL=appeals.service.js.map