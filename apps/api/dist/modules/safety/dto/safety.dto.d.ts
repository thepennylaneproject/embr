export declare enum ReportReason {
    SPAM = "spam",
    HARASSMENT = "harassment",
    ILLEGAL = "illegal",
    NSFW_UNLABELED = "nsfw_unlabeled",
    COPYRIGHT = "copyright",
    IMPERSONATION = "impersonation",
    SELF_HARM = "self_harm",
    OTHER = "other"
}
export declare enum ReportStatus {
    PENDING = "pending",
    UNDER_REVIEW = "under_review",
    ACTION_TAKEN = "action_taken",
    DISMISSED = "dismissed"
}
export declare enum ReportEntityType {
    POST = "post",
    USER = "user",
    MESSAGE = "message",
    COMMENT = "comment"
}
export declare class CreateReportDto {
    entityType: ReportEntityType;
    entityId: string;
    reason: ReportReason;
    description?: string;
    evidenceUrls?: string[];
}
export declare class UpdateReportDto {
    status?: ReportStatus;
    action?: string;
    reviewNote?: string;
}
export declare class QueryReportsDto {
    status?: ReportStatus;
    entityType?: ReportEntityType;
    reason?: ReportReason;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare enum ActionType {
    WARNING = "warning",
    CONTENT_REMOVAL = "content_removal",
    SUSPENSION = "suspension",
    BAN = "ban"
}
export declare class CreateModerationActionDto {
    userId: string;
    type: ActionType;
    reason: string;
    duration?: number;
    postId?: string;
    commentId?: string;
    appealable?: boolean;
    notifyUser?: boolean;
}
export declare class QueryModerationActionsDto {
    type?: ActionType;
    userId?: string;
    activeOnly?: boolean;
    page?: number;
    limit?: number;
}
export declare class BlockUserDto {
    blockedUserId: string;
    reason?: string;
}
export declare class MuteUserDto {
    mutedUserId: string;
    duration?: number;
}
export declare class MuteKeywordDto {
    keyword: string;
    caseSensitive?: boolean;
}
export declare enum AppealStatus {
    PENDING = "pending",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    DENIED = "denied"
}
export declare class CreateAppealDto {
    actionId: string;
    reason: string;
    evidenceUrls?: string[];
}
export declare class UpdateAppealDto {
    status: AppealStatus;
    reviewNote: string;
}
export declare class QueryAppealsDto {
    status?: AppealStatus;
    page?: number;
    limit?: number;
}
export declare enum FilterAction {
    HIDE = "hide",
    FLAG = "flag",
    BLOCK = "block"
}
export declare class ContentFilterDto {
    content: string;
    contentType?: string;
}
export declare class CreateContentRuleDto {
    name: string;
    description: string;
    keywords: string[];
    action: FilterAction;
    caseSensitive?: boolean;
    enabled?: boolean;
}
export declare class UpdateSafetySettingsDto {
    hideNsfw?: boolean;
    hideSensitiveContent?: boolean;
    allowDmsFromEveryone?: boolean;
    allowTaggingFromEveryone?: boolean;
    showOnlineStatus?: boolean;
    mutedKeywords?: string[];
}
