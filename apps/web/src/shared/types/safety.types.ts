/**
 * Safety Types
 * Types for reporting, moderation, blocking, muting, and content filtering
 */

// ============================================================================
// ENUMS
// ============================================================================

export const ReportStatus = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED',
  ESCALATED: 'ESCALATED',
  ACTION_TAKEN: 'ACTION_TAKEN',
} as const;
export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];

export const ReportReason = {
  SPAM: 'SPAM',
  HARASSMENT: 'HARASSMENT',
  HATE_SPEECH: 'HATE_SPEECH',
  VIOLENCE: 'VIOLENCE',
  NUDITY: 'NUDITY',
  MISINFORMATION: 'MISINFORMATION',
  COPYRIGHT: 'COPYRIGHT',
  IMPERSONATION: 'IMPERSONATION',
  SCAM: 'SCAM',
  ILLEGAL: 'ILLEGAL',
  NSFW_UNLABELED: 'NSFW_UNLABELED',
  SELF_HARM: 'SELF_HARM',
  OTHER: 'OTHER',
} as const;
export type ReportReason = typeof ReportReason[keyof typeof ReportReason];

export const ReportEntityType = {
  USER: 'USER',
  POST: 'POST',
  COMMENT: 'COMMENT',
  MESSAGE: 'MESSAGE',
  GIG: 'GIG',
  APPLICATION: 'APPLICATION',
} as const;
export type ReportEntityType = typeof ReportEntityType[keyof typeof ReportEntityType];

export const ModerationActionType = {
  WARNING: 'WARNING',
  CONTENT_REMOVAL: 'CONTENT_REMOVAL',
  TEMPORARY_BAN: 'TEMPORARY_BAN',
  PERMANENT_BAN: 'PERMANENT_BAN',
  FEATURE_RESTRICTION: 'FEATURE_RESTRICTION',
} as const;
export type ModerationActionType = typeof ModerationActionType[keyof typeof ModerationActionType];

export const AppealStatus = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type AppealStatus = typeof AppealStatus[keyof typeof AppealStatus];

// ============================================================================
// REPORT INTERFACES
// ============================================================================

export interface Report {
  id: string;
  reporterId: string;
  entityType: ReportEntityType;
  entityId: string;
  reason: ReportReason;
  description?: string;
  evidence?: string[];
  status: ReportStatus;
  priority?: number;
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  reporter?: {
    id: string;
    username: string;
    displayName: string;
  };
  reportedUser?: {
    id: string;
    username: string;
    displayName: string;
  };
}

export interface CreateReportDto {
  entityType: ReportEntityType;
  entityId: string;
  reason: ReportReason;
  description?: string;
  evidence?: string[];
}

export interface UpdateReportDto {
  status?: ReportStatus;
  priority?: number;
  assignedTo?: string;
  resolution?: string;
}

export interface QueryReportsDto {
  status?: ReportStatus;
  reason?: ReportReason;
  entityType?: ReportEntityType;
  priority?: number;
  assignedTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// MODERATION ACTION INTERFACES
// ============================================================================

export interface ModerationAction {
  id: string;
  userId: string;
  actionType: ModerationActionType;
  reason: string;
  duration?: number; // in hours
  reportId?: string;
  moderatorId: string;
  revokedAt?: Date;
  revokedBy?: string;
  revokeReason?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    username: string;
    displayName: string;
  };
  moderator?: {
    id: string;
    username: string;
    displayName: string;
  };
}

export interface CreateModerationActionDto {
  userId: string;
  actionType: ModerationActionType;
  reason: string;
  duration?: number;
  reportId?: string;
}

export interface QueryModerationActionsDto {
  userId?: string;
  actionType?: ModerationActionType;
  active?: boolean;
  page?: number;
  limit?: number;
}

// ============================================================================
// BLOCKING & MUTING INTERFACES
// ============================================================================

export interface BlockedUser {
  id: string;
  blockerId: string;
  blockedId: string;
  reason?: string;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
}

export interface BlockUserDto {
  userId: string;
  reason?: string;
}

export interface MutedUser {
  id: string;
  muterId: string;
  mutedId: string;
  duration?: number; // in hours, null = permanent
  expiresAt?: Date;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
}

export interface MuteUserDto {
  userId: string;
  duration?: number;
}

export interface MutedKeyword {
  id: string;
  userId: string;
  keyword: string;
  isRegex: boolean;
  createdAt: Date;
}

export interface MuteKeywordDto {
  keyword: string;
  isRegex?: boolean;
}

// ============================================================================
// APPEAL INTERFACES
// ============================================================================

export interface Appeal {
  id: string;
  userId: string;
  moderationActionId: string;
  reason: string;
  evidence?: string[];
  status: AppealStatus;
  reviewerId?: string;
  reviewNote?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  moderationAction?: ModerationAction;
  user?: {
    id: string;
    username: string;
    displayName: string;
  };
  reviewer?: {
    id: string;
    username: string;
    displayName: string;
  };
}

export interface CreateAppealDto {
  moderationActionId: string;
  reason: string;
  evidence?: string[];
}

export interface UpdateAppealDto {
  status?: AppealStatus;
  reviewNote?: string;
}

export interface QueryAppealsDto {
  status?: AppealStatus;
  userId?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// CONTENT FILTERING INTERFACES
// ============================================================================

export interface ContentFilterDto {
  content: string;
  contentType?: string;
}

export interface FilterResult {
  isAllowed: boolean;
  flaggedCategories: string[];
  confidence: number;
  filteredContent?: string;
  warnings?: string[];
}

export interface ContentRule {
  id: string;
  name: string;
  pattern: string;
  isRegex: boolean;
  action: 'block' | 'flag' | 'replace';
  replacement?: string;
  severity: number;
  isEnabled: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContentRuleDto {
  name: string;
  pattern: string;
  isRegex?: boolean;
  action: 'block' | 'flag' | 'replace';
  replacement?: string;
  severity?: number;
  isEnabled?: boolean;
}

// ============================================================================
// STATS INTERFACES
// ============================================================================

export interface QueueStats {
  total: {
    pending: number;
    underReview: number;
    actionTaken: number;
    dismissed: number;
    escalated?: number;
  };
  byReason: { reason: string; _count: number }[];
  averageResolutionTime: number;
}

export interface ModerationStats {
  totalActions: number;
  actionsByType: Record<ModerationActionType, number>;
  activeRestrictions: number;
  revokedActions: number;
  averageActionDuration: number;
}

export interface FilterStats {
  totalChecked: number;
  totalBlocked: number;
  totalFlagged: number;
  blockRate: number;
  topFlaggedCategories: { category: string; count: number }[];
}
