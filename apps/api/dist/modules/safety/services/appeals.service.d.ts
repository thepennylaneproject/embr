import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppealDto, UpdateAppealDto, QueryAppealsDto } from '../dto/safety.dto';
import { NotificationsService } from '../../notifications/notifications.service';
import { ModerationActionsService } from './moderation-actions.service';
export declare class AppealsService {
    private prisma;
    private notificationsService;
    private moderationActionsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, moderationActionsService: ModerationActionsService);
    createAppeal(userId: string, dto: CreateAppealDto): Promise<{
        user: {
            profile: {
                displayName: string;
                avatarUrl: string;
            };
            email: string;
            username: string;
            id: string;
        };
        action: {
            moderator: {
                username: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            expiresAt: Date | null;
            type: import(".prisma/client").$Enums.ActionType;
            duration: number | null;
            postId: string | null;
            commentId: string | null;
            reason: string;
            appealable: boolean;
            moderatorId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.AppealStatus;
        reason: string;
        reviewNote: string | null;
        actionId: string;
        reviewerId: string | null;
        resolvedAt: Date | null;
    }>;
    getAppeals(query: QueryAppealsDto): Promise<{
        appeals: ({
            user: {
                profile: {
                    displayName: string;
                    avatarUrl: string;
                };
                username: string;
                id: string;
            };
            action: {
                moderator: {
                    username: string;
                    id: string;
                };
            } & {
                id: string;
                createdAt: Date;
                userId: string;
                expiresAt: Date | null;
                type: import(".prisma/client").$Enums.ActionType;
                duration: number | null;
                postId: string | null;
                commentId: string | null;
                reason: string;
                appealable: boolean;
                moderatorId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            status: import(".prisma/client").$Enums.AppealStatus;
            reason: string;
            reviewNote: string | null;
            actionId: string;
            reviewerId: string | null;
            resolvedAt: Date | null;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getAppealById(appealId: string): Promise<{
        user: {
            profile: {
                displayName: string;
                avatarUrl: string;
            };
            email: string;
            username: string;
            id: string;
            _count: {
                reportsReceived: number;
                moderationActions: number;
            };
        };
        action: {
            user: {
                username: string;
                id: string;
            };
            moderator: {
                username: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            expiresAt: Date | null;
            type: import(".prisma/client").$Enums.ActionType;
            duration: number | null;
            postId: string | null;
            commentId: string | null;
            reason: string;
            appealable: boolean;
            moderatorId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.AppealStatus;
        reason: string;
        reviewNote: string | null;
        actionId: string;
        reviewerId: string | null;
        resolvedAt: Date | null;
    }>;
    updateAppeal(appealId: string, moderatorId: string, dto: UpdateAppealDto): Promise<{
        user: {
            email: string;
            username: string;
            fullName: string | null;
            id: string;
            passwordHash: string | null;
            googleId: string | null;
            stripeCustomerId: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            isVerified: boolean;
            suspended: boolean;
            suspendedUntil: Date | null;
            lastLoginAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
        action: {
            id: string;
            createdAt: Date;
            userId: string;
            expiresAt: Date | null;
            type: import(".prisma/client").$Enums.ActionType;
            duration: number | null;
            postId: string | null;
            commentId: string | null;
            reason: string;
            appealable: boolean;
            moderatorId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.AppealStatus;
        reason: string;
        reviewNote: string | null;
        actionId: string;
        reviewerId: string | null;
        resolvedAt: Date | null;
    }>;
    getUserAppeals(userId: string): Promise<{
        appeals: ({
            action: {
                moderator: {
                    username: string;
                    id: string;
                };
            } & {
                id: string;
                createdAt: Date;
                userId: string;
                expiresAt: Date | null;
                type: import(".prisma/client").$Enums.ActionType;
                duration: number | null;
                postId: string | null;
                commentId: string | null;
                reason: string;
                appealable: boolean;
                moderatorId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            status: import(".prisma/client").$Enums.AppealStatus;
            reason: string;
            reviewNote: string | null;
            actionId: string;
            reviewerId: string | null;
            resolvedAt: Date | null;
        })[];
        summary: {
            total: number;
            pending: number;
            underReview: number;
            approved: number;
            denied: number;
            approvalRate: number;
        };
    }>;
    getStats(days?: number): Promise<{
        period: string;
        total: number;
        byStatus: {
            pending: number;
            underReview: number;
            approved: number;
            denied: number;
        };
        approvalRate: number;
        averageResolutionTime: string;
    }>;
    private notifyModerators;
    private getAverageResolutionTime;
}
