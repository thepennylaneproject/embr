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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const safety_dto_1 = require("../dto/safety.dto");
const notifications_service_1 = require("../../notifications/notifications.service");
const client_1 = require("@prisma/client");
let ReportsService = class ReportsService {
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async createReport(reporterId, dto) {
        await this.validateEntityExists(dto.entityType, dto.entityId);
        const existingReport = await this.prisma.report.findFirst({
            where: {
                reporterId,
                ...(dto.entityType === safety_dto_1.ReportEntityType.POST && {
                    reportedPostId: dto.entityId,
                }),
                ...(dto.entityType === safety_dto_1.ReportEntityType.USER && {
                    reportedUserId: dto.entityId,
                }),
                ...(dto.entityType === safety_dto_1.ReportEntityType.COMMENT && {
                    reportedCommentId: dto.entityId,
                }),
                status: {
                    in: [client_1.ReportStatus.PENDING, client_1.ReportStatus.UNDER_REVIEW],
                },
            },
        });
        if (existingReport) {
            throw new common_1.BadRequestException('You have already reported this content');
        }
        const report = await this.prisma.report.create({
            data: {
                reporterId,
                reason: dto.reason,
                description: dto.description,
                status: client_1.ReportStatus.PENDING,
                ...(dto.entityType === safety_dto_1.ReportEntityType.POST && {
                    reportedPostId: dto.entityId,
                }),
                ...(dto.entityType === safety_dto_1.ReportEntityType.USER && {
                    reportedUserId: dto.entityId,
                }),
                ...(dto.entityType === safety_dto_1.ReportEntityType.COMMENT && {
                    reportedCommentId: dto.entityId,
                }),
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true,
                        profile: { select: { avatarUrl: true } },
                    },
                },
                reportedUser: {
                    select: {
                        id: true,
                        username: true,
                        profile: { select: { avatarUrl: true } },
                    },
                },
                reportedPost: {
                    select: {
                        id: true,
                        content: true,
                        mediaUrl: true,
                    },
                },
            },
        });
        await this.notifyModerators('new_report', report.id);
        await this.checkAutoEscalation(dto.entityType, dto.entityId);
        return report;
    }
    async getReports(query, moderatorId) {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.reason) {
            where.reason = query.reason;
        }
        if (query.entityType) {
            switch (query.entityType) {
                case safety_dto_1.ReportEntityType.POST:
                    where.reportedPostId = { not: null };
                    break;
                case safety_dto_1.ReportEntityType.USER:
                    where.reportedUserId = { not: null };
                    break;
                case safety_dto_1.ReportEntityType.COMMENT:
                    where.reportedCommentId = { not: null };
                    break;
            }
        }
        const [reports, total] = await Promise.all([
            this.prisma.report.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    reporter: {
                        select: {
                            id: true,
                            username: true,
                            profile: { select: { avatarUrl: true } },
                        },
                    },
                    reportedUser: {
                        select: {
                            id: true,
                            username: true,
                            profile: { select: { avatarUrl: true, displayName: true } },
                        },
                    },
                    reportedPost: {
                        select: {
                            id: true,
                            content: true,
                            mediaUrl: true,
                            createdAt: true,
                        },
                    },
                    reportedComment: {
                        select: {
                            id: true,
                            content: true,
                            createdAt: true,
                        },
                    },
                },
            }),
            this.prisma.report.count({ where }),
        ]);
        return {
            reports,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getReportById(reportId, moderatorId) {
        const report = await this.prisma.report.findUnique({
            where: { id: reportId },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        profile: { select: { avatarUrl: true, displayName: true } },
                    },
                },
                reportedUser: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        profile: { select: { avatarUrl: true, displayName: true } },
                        _count: {
                            select: {
                                reportsReceived: true,
                                moderationActions: true,
                            },
                        },
                    },
                },
                reportedPost: {
                    select: {
                        id: true,
                        content: true,
                        mediaUrl: true,
                        createdAt: true,
                        author: {
                            select: {
                                id: true,
                                username: true,
                                profile: { select: { avatarUrl: true } },
                            },
                        },
                        _count: {
                            select: { likes: true, comments: true, reports: true },
                        },
                    },
                },
                reportedComment: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        author: {
                            select: {
                                id: true,
                                username: true,
                                profile: { select: { avatarUrl: true } },
                            },
                        },
                    },
                },
            },
        });
        if (!report) {
            throw new common_1.NotFoundException('Report not found');
        }
        return report;
    }
    async updateReport(reportId, moderatorId, dto) {
        const report = await this.prisma.report.findUnique({
            where: { id: reportId },
        });
        if (!report) {
            throw new common_1.NotFoundException('Report not found');
        }
        if (report.status === client_1.ReportStatus.ACTION_TAKEN ||
            report.status === client_1.ReportStatus.DISMISSED) {
            throw new common_1.BadRequestException('Report has already been resolved');
        }
        const updatedReport = await this.prisma.report.update({
            where: { id: reportId },
            data: {
                status: dto.status,
                action: dto.action,
                reviewerId: moderatorId,
                reviewedAt: new Date(),
            },
            include: {
                reporter: {
                    select: { id: true, username: true },
                },
                reportedUser: {
                    select: { id: true, username: true },
                },
            },
        });
        const status = dto.status;
        if (status === client_1.ReportStatus.ACTION_TAKEN ||
            status === client_1.ReportStatus.DISMISSED) {
            await this.notificationsService.create({
                userId: report.reporterId,
                type: 'report_resolved',
                title: 'Report Update',
                body: `Your report has been ${status === client_1.ReportStatus.ACTION_TAKEN ? 'acted upon' : 'reviewed'}`,
                metadata: { reportId: report.id, status: dto.status },
            });
        }
        return updatedReport;
    }
    async bulkUpdateReports(reportIds, moderatorId, dto) {
        const reports = await this.prisma.report.updateMany({
            where: {
                id: { in: reportIds },
                status: {
                    in: [client_1.ReportStatus.PENDING, client_1.ReportStatus.UNDER_REVIEW],
                },
            },
            data: {
                status: dto.status,
                action: dto.action,
                reviewerId: moderatorId,
                reviewedAt: new Date(),
            },
        });
        return { updated: reports.count };
    }
    async getQueueStats() {
        const [totalPending, totalUnderReview, totalActionTaken, totalDismissed, reportsByReason, reportsByEntity,] = await Promise.all([
            this.prisma.report.count({ where: { status: client_1.ReportStatus.PENDING } }),
            this.prisma.report.count({ where: { status: client_1.ReportStatus.UNDER_REVIEW } }),
            this.prisma.report.count({ where: { status: client_1.ReportStatus.ACTION_TAKEN } }),
            this.prisma.report.count({ where: { status: client_1.ReportStatus.DISMISSED } }),
            this.prisma.report.groupBy({
                by: ['reason'],
                _count: true,
            }),
            this.prisma.report.groupBy({
                by: ['reportedPostId', 'reportedUserId', 'reportedCommentId'],
                _count: true,
            }),
        ]);
        return {
            total: {
                pending: totalPending,
                underReview: totalUnderReview,
                actionTaken: totalActionTaken,
                dismissed: totalDismissed,
            },
            byReason: reportsByReason,
            averageResolutionTime: await this.getAverageResolutionTime(),
        };
    }
    async validateEntityExists(entityType, entityId) {
        let exists = false;
        switch (entityType) {
            case safety_dto_1.ReportEntityType.POST:
                exists = !!(await this.prisma.post.findUnique({
                    where: { id: entityId },
                }));
                break;
            case safety_dto_1.ReportEntityType.USER:
                exists = !!(await this.prisma.user.findUnique({
                    where: { id: entityId },
                }));
                break;
            case safety_dto_1.ReportEntityType.COMMENT:
                exists = !!(await this.prisma.comment.findUnique({
                    where: { id: entityId },
                }));
                break;
        }
        if (!exists) {
            throw new common_1.NotFoundException(`${entityType} not found`);
        }
    }
    async checkAutoEscalation(entityType, entityId) {
        const whereClause = {
            status: client_1.ReportStatus.PENDING,
        };
        switch (entityType) {
            case safety_dto_1.ReportEntityType.POST:
                whereClause.reportedPostId = entityId;
                break;
            case safety_dto_1.ReportEntityType.USER:
                whereClause.reportedUserId = entityId;
                break;
            case safety_dto_1.ReportEntityType.COMMENT:
                whereClause.reportedCommentId = entityId;
                break;
        }
        const reportCount = await this.prisma.report.count({ where: whereClause });
        if (reportCount >= 5) {
            await this.prisma.report.updateMany({
                where: whereClause,
                data: { status: client_1.ReportStatus.UNDER_REVIEW },
            });
            await this.notifyModerators('high_priority_report', entityId);
        }
    }
    async notifyModerators(type, entityId) {
        const moderators = await this.prisma.user.findMany({
            where: {
                role: { in: [client_1.UserRole.ADMIN, client_1.UserRole.MODERATOR] },
            },
            select: { id: true },
        });
        await Promise.all(moderators.map((mod) => this.notificationsService.create({
            userId: mod.id,
            type: 'moderation_alert',
            title: type === 'high_priority_report' ? '🚨 High Priority Report' : 'New Report',
            body: type === 'high_priority_report'
                ? 'Multiple reports detected - immediate review needed'
                : 'A new report requires your attention',
            metadata: { entityId },
        })));
    }
    async getAverageResolutionTime() {
        const resolvedReports = await this.prisma.report.findMany({
            where: {
                status: { in: [client_1.ReportStatus.ACTION_TAKEN, client_1.ReportStatus.DISMISSED] },
                reviewedAt: { not: null },
            },
            select: {
                createdAt: true,
                reviewedAt: true,
            },
            take: 100,
        });
        if (resolvedReports.length === 0)
            return 0;
        const totalTime = resolvedReports.reduce((sum, report) => {
            const diff = report.reviewedAt.getTime() - report.createdAt.getTime();
            return sum + diff;
        }, 0);
        return Math.round(totalTime / resolvedReports.length / (1000 * 60 * 60));
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map