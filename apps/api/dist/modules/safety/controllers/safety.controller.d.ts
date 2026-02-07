import { ReportsService } from '../services/reports.service';
import { ModerationActionsService } from '../services/moderation-actions.service';
import { BlockingService } from '../services/blocking.service';
import { AppealsService } from '../services/appeals.service';
import { ContentFilterService } from '../services/content-filter.service';
import { CreateReportDto, UpdateReportDto, QueryReportsDto, CreateModerationActionDto, QueryModerationActionsDto, BlockUserDto, MuteUserDto, MuteKeywordDto, CreateAppealDto, UpdateAppealDto, QueryAppealsDto, ContentFilterDto, CreateContentRuleDto } from '../dto/safety.dto';
export declare class SafetyController {
    private reportsService;
    private moderationActionsService;
    private blockingService;
    private appealsService;
    private contentFilterService;
    constructor(reportsService: ReportsService, moderationActionsService: ModerationActionsService, blockingService: BlockingService, appealsService: AppealsService, contentFilterService: ContentFilterService);
    createReport(req: any, dto: CreateReportDto): Promise<{
        reporter: {
            profile: {
                avatarUrl: string;
            };
            username: string;
            id: string;
        };
        reportedUser: {
            profile: {
                avatarUrl: string;
            };
            username: string;
            id: string;
        };
        reportedPost: {
            id: string;
            content: string;
            mediaUrl: string;
        };
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.ReportStatus;
        reason: import(".prisma/client").$Enums.ReportReason;
        action: string | null;
        reporterId: string;
        reportedUserId: string | null;
        reportedPostId: string | null;
        reportedCommentId: string | null;
        reviewerId: string | null;
        reviewedAt: Date | null;
    }>;
    getReports(query: QueryReportsDto, req: any): Promise<{
        reports: ({
            reporter: {
                profile: {
                    avatarUrl: string;
                };
                username: string;
                id: string;
            };
            reportedUser: {
                profile: {
                    displayName: string;
                    avatarUrl: string;
                };
                username: string;
                id: string;
            };
            reportedPost: {
                id: string;
                createdAt: Date;
                content: string;
                mediaUrl: string;
            };
            reportedComment: {
                id: string;
                createdAt: Date;
                content: string;
            };
        } & {
            id: string;
            createdAt: Date;
            description: string | null;
            status: import(".prisma/client").$Enums.ReportStatus;
            reason: import(".prisma/client").$Enums.ReportReason;
            action: string | null;
            reporterId: string;
            reportedUserId: string | null;
            reportedPostId: string | null;
            reportedCommentId: string | null;
            reviewerId: string | null;
            reviewedAt: Date | null;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getReportById(id: string, req: any): Promise<{
        reporter: {
            profile: {
                displayName: string;
                avatarUrl: string;
            };
            email: string;
            username: string;
            id: string;
        };
        reportedUser: {
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
        reportedPost: {
            id: string;
            createdAt: Date;
            _count: {
                comments: number;
                likes: number;
                reports: number;
            };
            content: string;
            mediaUrl: string;
            author: {
                profile: {
                    avatarUrl: string;
                };
                username: string;
                id: string;
            };
        };
        reportedComment: {
            id: string;
            createdAt: Date;
            content: string;
            author: {
                profile: {
                    avatarUrl: string;
                };
                username: string;
                id: string;
            };
        };
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.ReportStatus;
        reason: import(".prisma/client").$Enums.ReportReason;
        action: string | null;
        reporterId: string;
        reportedUserId: string | null;
        reportedPostId: string | null;
        reportedCommentId: string | null;
        reviewerId: string | null;
        reviewedAt: Date | null;
    }>;
    updateReport(id: string, req: any, dto: UpdateReportDto): Promise<{
        reporter: {
            username: string;
            id: string;
        };
        reportedUser: {
            username: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.ReportStatus;
        reason: import(".prisma/client").$Enums.ReportReason;
        action: string | null;
        reporterId: string;
        reportedUserId: string | null;
        reportedPostId: string | null;
        reportedCommentId: string | null;
        reviewerId: string | null;
        reviewedAt: Date | null;
    }>;
    bulkUpdateReports(req: any, body: {
        reportIds: string[];
        updates: UpdateReportDto;
    }): Promise<{
        updated: number;
    }>;
    getQueueStats(): Promise<{
        total: {
            pending: number;
            underReview: number;
            actionTaken: number;
            dismissed: number;
        };
        byReason: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.ReportGroupByOutputType, "reason"[]> & {
            _count: number;
        })[];
        averageResolutionTime: number;
    }>;
    createModerationAction(req: any, dto: CreateModerationActionDto): Promise<{
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
    getModerationActions(query: QueryModerationActionsDto): Promise<{
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
    getModerationActionById(id: string): Promise<{
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
    revokeModerationAction(id: string, req: any, body: {
        reason: string;
    }): Promise<{
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
    getUserModerationHistory(userId: string): Promise<{
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
    getModerationStats(days?: number): Promise<{
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
    blockUser(req: any, dto: BlockUserDto): Promise<{
        blocked: {
            profile: {
                displayName: string;
                avatarUrl: string;
            };
            username: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        reason: string | null;
        blockerId: string;
        blockedId: string;
    }>;
    unblockUser(req: any, userId: string): Promise<{
        success: boolean;
    }>;
    getBlockedUsers(req: any, page?: number, limit?: number): Promise<{
        blocks: {
            id: string;
            user: {
                profile: {
                    displayName: string;
                    avatarUrl: string;
                };
                username: string;
                id: string;
            };
            reason: string;
            blockedAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    checkIfBlocked(req: any, userId: string): Promise<{
        blocked: boolean;
    }>;
    muteUser(req: any, dto: MuteUserDto): Promise<{
        muted: {
            profile: {
                displayName: string;
                avatarUrl: string;
            };
            username: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        expiresAt: Date | null;
        muterId: string;
        mutedId: string;
    }>;
    unmuteUser(req: any, userId: string): Promise<{
        success: boolean;
    }>;
    getMutedUsers(req: any, page?: number, limit?: number): Promise<{
        mutes: {
            id: string;
            user: {
                profile: {
                    displayName: string;
                    avatarUrl: string;
                };
                username: string;
                id: string;
            };
            expiresAt: Date;
            mutedAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    checkIfMuted(req: any, userId: string): Promise<{
        muted: boolean;
    }>;
    addMutedKeyword(req: any, dto: MuteKeywordDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        keyword: string;
        caseSensitive: boolean;
    }>;
    removeMutedKeyword(req: any, keywordId: string): Promise<{
        success: boolean;
    }>;
    getMutedKeywords(req: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        keyword: string;
        caseSensitive: boolean;
    }[]>;
    createAppeal(req: any, dto: CreateAppealDto): Promise<{
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
    getAppealById(id: string): Promise<{
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
    updateAppeal(id: string, req: any, dto: UpdateAppealDto): Promise<{
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
    getUserAppeals(req: any): Promise<{
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
    getAppealStats(days?: number): Promise<{
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
    filterContent(req: any, dto: ContentFilterDto): Promise<import("../services/content-filter.service").FilterResult>;
    getUserSpamScore(req: any): Promise<{
        score: number;
        risk: string;
    }>;
    createContentRule(dto: CreateContentRuleDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        action: import(".prisma/client").$Enums.FilterAction;
        caseSensitive: boolean;
        keywords: string[];
        enabled: boolean;
    }>;
    getContentRules(includeDisabled?: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        action: import(".prisma/client").$Enums.FilterAction;
        caseSensitive: boolean;
        keywords: string[];
        enabled: boolean;
    }[]>;
    updateContentRule(id: string, updates: Partial<CreateContentRuleDto>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        action: import(".prisma/client").$Enums.FilterAction;
        caseSensitive: boolean;
        keywords: string[];
        enabled: boolean;
    }>;
    deleteContentRule(id: string): Promise<{
        success: boolean;
    }>;
    getFilterStats(days?: number): Promise<{
        period: string;
        total: number;
        byAction: {
            blocked: number;
            flagged: number;
            hidden: number;
        };
        topRules: any[];
    }>;
    private getRiskLevel;
}
