import { PrismaService } from '../../prisma/prisma.service';
import { CreateModerationActionDto, QueryModerationActionsDto } from '../dto/safety.dto';
import { NotificationsService } from '../../notifications/notifications.service';
export declare class ModerationActionsService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    createAction(moderatorId: string, dto: CreateModerationActionDto): Promise<{
        user: {
            profile: {
                displayName: string;
            };
            email: string;
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
    }>;
    getActions(query: QueryModerationActionsDto): Promise<{
        actions: ({
            user: {
                profile: {
                    displayName: string;
                    avatarUrl: string;
                };
                username: string;
                id: string;
            };
            appeals: {
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.AppealStatus;
            }[];
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
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getActionById(actionId: string): Promise<{
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
        appeals: ({
            user: {
                username: string;
                id: string;
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
        moderator: {
            profile: {
                displayName: string;
            };
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
    }>;
    revokeAction(actionId: string, moderatorId: string, reason: string): Promise<{
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
    }>;
    getUserHistory(userId: string): Promise<{
        actions: ({
            appeals: {
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.AppealStatus;
            }[];
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
        })[];
        summary: {
            total: number;
            warnings: number;
            suspensions: number;
            bans: number;
            contentRemovals: number;
        };
    }>;
    checkUserRestriction(userId: string): Promise<{
        restricted: boolean;
        action: {
            id: string;
            type: import(".prisma/client").$Enums.ActionType;
            reason: string;
            expiresAt: Date;
            appealable: boolean;
        };
    }>;
    cleanupExpiredActions(): Promise<{
        cleaned: number;
    }>;
    getStats(days?: number): Promise<{
        period: string;
        total: number;
        byType: {
            warnings: number;
            suspensions: number;
            bans: number;
            contentRemovals: number;
        };
        appealRate: number;
    }>;
    private executeAction;
    private reverseAction;
    private removeContent;
    private notifyUser;
    private getAppealRate;
}
