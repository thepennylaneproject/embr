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
exports.ModerationActionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../../notifications/notifications.service");
const client_1 = require("@prisma/client");
let ModerationActionsService = class ModerationActionsService {
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async createAction(moderatorId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.type === client_1.ActionType.BAN || dto.type === client_1.ActionType.SUSPENSION) {
            const existingAction = await this.prisma.moderationAction.findFirst({
                where: {
                    userId: dto.userId,
                    type: { in: [client_1.ActionType.BAN, client_1.ActionType.SUSPENSION] },
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gte: new Date() } },
                    ],
                },
            });
            if (existingAction) {
                throw new common_1.BadRequestException(`User is already ${existingAction.type === client_1.ActionType.BAN ? 'banned' : 'suspended'}`);
            }
        }
        let expiresAt = null;
        if (dto.type === client_1.ActionType.SUSPENSION && dto.duration) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + dto.duration);
        }
        const action = await this.prisma.moderationAction.create({
            data: {
                userId: dto.userId,
                moderatorId,
                type: dto.type,
                reason: dto.reason,
                duration: dto.duration,
                postId: dto.postId,
                commentId: dto.commentId,
                appealable: dto.appealable,
                expiresAt,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        profile: { select: { displayName: true } },
                    },
                },
                moderator: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });
        await this.executeAction(action);
        if (dto.notifyUser) {
            await this.notifyUser(action);
        }
        if (dto.type === client_1.ActionType.CONTENT_REMOVAL && dto.postId) {
            await this.removeContent(dto.postId, 'post');
        }
        return action;
    }
    async getActions(query) {
        const { page = 1, limit = 20, type, userId, activeOnly } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (type) {
            where.type = type;
        }
        if (userId) {
            where.userId = userId;
        }
        if (activeOnly) {
            where.OR = [
                { expiresAt: null },
                { expiresAt: { gte: new Date() } },
            ];
        }
        const [actions, total] = await Promise.all([
            this.prisma.moderationAction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            profile: { select: { displayName: true, avatarUrl: true } },
                        },
                    },
                    moderator: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                    appeals: {
                        select: {
                            id: true,
                            status: true,
                            createdAt: true,
                        },
                    },
                },
            }),
            this.prisma.moderationAction.count({ where }),
        ]);
        return {
            actions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getActionById(actionId) {
        const action = await this.prisma.moderationAction.findUnique({
            where: { id: actionId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        profile: { select: { displayName: true, avatarUrl: true } },
                        _count: {
                            select: {
                                moderationActions: true,
                                reportsReceived: true,
                            },
                        },
                    },
                },
                moderator: {
                    select: {
                        id: true,
                        username: true,
                        profile: { select: { displayName: true } },
                    },
                },
                appeals: {
                    orderBy: { createdAt: 'desc' },
                    include: {
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
        if (!action) {
            throw new common_1.NotFoundException('Moderation action not found');
        }
        return action;
    }
    async revokeAction(actionId, moderatorId, reason) {
        const action = await this.prisma.moderationAction.findUnique({
            where: { id: actionId },
            include: { user: true },
        });
        if (!action) {
            throw new common_1.NotFoundException('Moderation action not found');
        }
        if (action.expiresAt && action.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Action has already expired');
        }
        const updatedAction = await this.prisma.moderationAction.update({
            where: { id: actionId },
            data: {
                expiresAt: new Date(),
                reason: `${action.reason}\n\nREVOKED: ${reason}`,
            },
        });
        await this.reverseAction(action);
        await this.notificationsService.create({
            userId: action.userId,
            type: 'moderation_revoked',
            title: 'Action Revoked',
            body: `Your ${action.type} has been revoked`,
            metadata: { actionId: action.id, reason },
        });
        return updatedAction;
    }
    async getUserHistory(userId) {
        const actions = await this.prisma.moderationAction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                moderator: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                appeals: {
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
        });
        const warnings = actions.filter((a) => a.type === client_1.ActionType.WARNING).length;
        const suspensions = actions.filter((a) => a.type === client_1.ActionType.SUSPENSION).length;
        const bans = actions.filter((a) => a.type === client_1.ActionType.BAN).length;
        const contentRemovals = actions.filter((a) => a.type === client_1.ActionType.CONTENT_REMOVAL).length;
        return {
            actions,
            summary: {
                total: actions.length,
                warnings,
                suspensions,
                bans,
                contentRemovals,
            },
        };
    }
    async checkUserRestriction(userId) {
        const activeActions = await this.prisma.moderationAction.findMany({
            where: {
                userId,
                type: { in: [client_1.ActionType.BAN, client_1.ActionType.SUSPENSION] },
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gte: new Date() } },
                ],
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
        });
        if (activeActions.length === 0) {
            return {
                restricted: false,
                action: null,
            };
        }
        const action = activeActions[0];
        return {
            restricted: true,
            action: {
                id: action.id,
                type: action.type,
                reason: action.reason,
                expiresAt: action.expiresAt,
                appealable: action.appealable,
            },
        };
    }
    async cleanupExpiredActions() {
        const expiredActions = await this.prisma.moderationAction.findMany({
            where: {
                expiresAt: { lte: new Date() },
                type: { in: [client_1.ActionType.SUSPENSION] },
            },
        });
        for (const action of expiredActions) {
            await this.reverseAction(action);
        }
        return { cleaned: expiredActions.length };
    }
    async getStats(days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const [totalActions, actionsByType, totalWarnings, totalSuspensions, totalBans, appealRate,] = await Promise.all([
            this.prisma.moderationAction.count({
                where: { createdAt: { gte: since } },
            }),
            this.prisma.moderationAction.groupBy({
                by: ['type'],
                where: { createdAt: { gte: since } },
                _count: true,
            }),
            this.prisma.moderationAction.count({
                where: {
                    type: client_1.ActionType.WARNING,
                    createdAt: { gte: since },
                },
            }),
            this.prisma.moderationAction.count({
                where: {
                    type: client_1.ActionType.SUSPENSION,
                    createdAt: { gte: since },
                },
            }),
            this.prisma.moderationAction.count({
                where: {
                    type: client_1.ActionType.BAN,
                    createdAt: { gte: since },
                },
            }),
            this.getAppealRate(since),
        ]);
        return {
            period: `Last ${days} days`,
            total: totalActions,
            byType: {
                warnings: totalWarnings,
                suspensions: totalSuspensions,
                bans: totalBans,
                contentRemovals: totalActions - totalWarnings - totalSuspensions - totalBans,
            },
            appealRate,
        };
    }
    async executeAction(action) {
        switch (action.type) {
            case client_1.ActionType.BAN:
            case client_1.ActionType.SUSPENSION:
                await this.prisma.user.update({
                    where: { id: action.userId },
                    data: {
                        suspended: true,
                        suspendedUntil: action.expiresAt,
                    },
                });
                break;
            case client_1.ActionType.CONTENT_REMOVAL:
                break;
            case client_1.ActionType.WARNING:
                break;
        }
    }
    async reverseAction(action) {
        switch (action.type) {
            case client_1.ActionType.BAN:
            case client_1.ActionType.SUSPENSION:
                await this.prisma.user.update({
                    where: { id: action.userId },
                    data: {
                        suspended: false,
                        suspendedUntil: null,
                    },
                });
                break;
        }
    }
    async removeContent(contentId, contentType) {
        if (contentType === 'post') {
            await this.prisma.post.update({
                where: { id: contentId },
                data: {
                    deletedAt: new Date(),
                    content: '[Content removed by moderators]',
                },
            });
        }
    }
    async notifyUser(action) {
        const messages = {
            [client_1.ActionType.WARNING]: {
                title: '⚠️ Warning Issued',
                body: 'You have received a warning for violating community guidelines',
            },
            [client_1.ActionType.SUSPENSION]: {
                title: '⏸️ Account Suspended',
                body: `Your account has been suspended ${action.duration ? `for ${action.duration} days` : 'permanently'}`,
            },
            [client_1.ActionType.BAN]: {
                title: '🚫 Account Banned',
                body: 'Your account has been permanently banned',
            },
            [client_1.ActionType.CONTENT_REMOVAL]: {
                title: '🗑️ Content Removed',
                body: 'Your content has been removed for violating community guidelines',
            },
        };
        const message = messages[action.type];
        await this.notificationsService.create({
            userId: action.userId,
            type: 'moderation_action',
            title: message.title,
            body: `${message.body}\n\nReason: ${action.reason}`,
            metadata: {
                actionId: action.id,
                type: action.type,
                appealable: action.appealable,
            },
        });
    }
    async getAppealRate(since) {
        const [totalActions, totalAppeals] = await Promise.all([
            this.prisma.moderationAction.count({
                where: {
                    createdAt: { gte: since },
                    appealable: true,
                },
            }),
            this.prisma.appeal.count({
                where: {
                    createdAt: { gte: since },
                },
            }),
        ]);
        return totalActions > 0 ? Math.round((totalAppeals / totalActions) * 100) : 0;
    }
};
exports.ModerationActionsService = ModerationActionsService;
exports.ModerationActionsService = ModerationActionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ModerationActionsService);
//# sourceMappingURL=moderation-actions.service.js.map