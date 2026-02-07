import { PrismaService } from '../../prisma/prisma.service';
import { CreateReportDto, UpdateReportDto, QueryReportsDto } from '../dto/safety.dto';
import { NotificationsService } from '../../notifications/notifications.service';
export declare class ReportsService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    createReport(reporterId: string, dto: CreateReportDto): Promise<{
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
    getReports(query: QueryReportsDto, moderatorId?: string): Promise<{
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
    getReportById(reportId: string, moderatorId?: string): Promise<{
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
    updateReport(reportId: string, moderatorId: string, dto: UpdateReportDto): Promise<{
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
    bulkUpdateReports(reportIds: string[], moderatorId: string, dto: UpdateReportDto): Promise<{
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
    private validateEntityExists;
    private checkAutoEscalation;
    private notifyModerators;
    private getAverageResolutionTime;
}
