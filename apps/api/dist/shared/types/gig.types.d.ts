export declare const GigStatus: {
    readonly DRAFT: "DRAFT";
    readonly OPEN: "OPEN";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly COMPLETED: "COMPLETED";
    readonly CANCELLED: "CANCELLED";
    readonly DISPUTED: "DISPUTED";
};
export type GigStatus = typeof GigStatus[keyof typeof GigStatus];
export declare const GigCategory: {
    readonly VIDEO_EDITING: "VIDEO_EDITING";
    readonly GRAPHIC_DESIGN: "GRAPHIC_DESIGN";
    readonly WRITING: "WRITING";
    readonly MUSIC_AUDIO: "MUSIC_AUDIO";
    readonly ANIMATION: "ANIMATION";
    readonly PHOTOGRAPHY: "PHOTOGRAPHY";
    readonly SOCIAL_MEDIA: "SOCIAL_MEDIA";
    readonly CONSULTING: "CONSULTING";
    readonly WEB_DEV: "WEB_DEV";
    readonly VOICE_OVER: "VOICE_OVER";
    readonly OTHER: "OTHER";
};
export type GigCategory = typeof GigCategory[keyof typeof GigCategory];
export declare const GigBudgetType: {
    readonly FIXED: "FIXED";
    readonly HOURLY: "HOURLY";
    readonly MILESTONE: "MILESTONE";
};
export type GigBudgetType = typeof GigBudgetType[keyof typeof GigBudgetType];
export declare const GigExperienceLevel: {
    readonly BEGINNER: "BEGINNER";
    readonly INTERMEDIATE: "INTERMEDIATE";
    readonly EXPERT: "EXPERT";
};
export type GigExperienceLevel = typeof GigExperienceLevel[keyof typeof GigExperienceLevel];
export declare const ApplicationStatus: {
    readonly PENDING: "PENDING";
    readonly ACCEPTED: "ACCEPTED";
    readonly REJECTED: "REJECTED";
    readonly WITHDRAWN: "WITHDRAWN";
};
export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];
export declare const MilestoneStatus: {
    readonly PENDING: "PENDING";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly SUBMITTED: "SUBMITTED";
    readonly APPROVED: "APPROVED";
    readonly REJECTED: "REJECTED";
};
export type MilestoneStatus = typeof MilestoneStatus[keyof typeof MilestoneStatus];
export declare const EscrowStatus: {
    readonly CREATED: "CREATED";
    readonly FUNDED: "FUNDED";
    readonly RELEASED: "RELEASED";
    readonly REFUNDED: "REFUNDED";
    readonly DISPUTED: "DISPUTED";
};
export type EscrowStatus = typeof EscrowStatus[keyof typeof EscrowStatus];
export declare const DisputeStatus: {
    readonly OPEN: "OPEN";
    readonly UNDER_REVIEW: "UNDER_REVIEW";
    readonly RESOLVED: "RESOLVED";
};
export type DisputeStatus = typeof DisputeStatus[keyof typeof DisputeStatus];
export interface Gig {
    id: string;
    creatorId: string;
    title: string;
    description: string;
    category: GigCategory;
    budgetType: GigBudgetType;
    budgetMin: number;
    budgetMax: number;
    currency: string;
    experienceLevel: GigExperienceLevel;
    estimatedDuration: number;
    skills: string[];
    deliverables: string[];
    status: GigStatus;
    applicationsCount: number;
    viewsCount: number;
    attachments: string[];
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
    creator?: PublicProfile;
}
export interface GigMilestone {
    id: string;
    gigId: string;
    applicationId: string;
    title: string;
    description: string;
    amount: number;
    dueDate: Date;
    status: MilestoneStatus;
    order: number;
    submittedAt?: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    feedback?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Application {
    id: string;
    gigId: string;
    applicantId: string;
    coverLetter: string;
    proposedBudget: number;
    proposedTimeline: number;
    portfolioLinks: string[];
    relevantExperience: string;
    milestoneProposals?: MilestoneProposal[];
    status: ApplicationStatus;
    createdAt: Date;
    updatedAt: Date;
    applicant?: PublicProfile;
    gig?: Gig;
}
export interface MilestoneProposal {
    title: string;
    description: string;
    amount: number;
    estimatedDays: number;
}
export interface Escrow {
    id: string;
    gigId: string;
    applicationId: string;
    payerId: string;
    payeeId: string;
    amount: number;
    currency: string;
    status: EscrowStatus;
    stripePaymentIntentId?: string;
    stripeFundingMethod?: string;
    createdAt: Date;
    updatedAt: Date;
    fundedAt?: Date;
    releasedAt?: Date;
    refundedAt?: Date;
}
export interface Dispute {
    id: string;
    gigId: string;
    applicationId: string;
    escrowId: string;
    raisedBy: string;
    against: string;
    reason: string;
    description: string;
    evidence: string[];
    status: DisputeStatus;
    resolution?: string;
    resolvedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
}
export interface GigReview {
    id: string;
    gigId: string;
    applicationId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment: string;
    professionalism: number;
    communication: number;
    quality: number;
    timeliness: number;
    createdAt: Date;
    updatedAt: Date;
    reviewer?: PublicProfile;
}
export interface PublicProfile {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    bio?: string;
    verified?: boolean;
}
export interface GigFilters {
    category?: GigCategory;
    budgetMin?: number;
    budgetMax?: number;
    budgetType?: GigBudgetType;
    experienceLevel?: GigExperienceLevel;
    skills?: string[];
    sortBy?: 'recent' | 'budget_high' | 'budget_low' | 'deadline';
}
export interface GigSearchParams extends GigFilters {
    query?: string;
    page?: number;
    limit?: number;
}
export interface PaginatedGigs {
    gigs: Gig[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface PaginatedApplications {
    applications: Application[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GigStats {
    totalGigs: number;
    activeGigs: number;
    completedGigs: number;
    totalEarned: number;
    totalSpent: number;
    averageRating: number;
    reviewsCount: number;
}
export interface ApplicationWithDetails extends Application {
    gig: Gig;
    applicant: PublicProfile;
    escrow?: Escrow;
    milestones?: GigMilestone[];
}
export interface GigWithDetails extends Gig {
    creator: PublicProfile;
    acceptedApplication?: ApplicationWithDetails;
    milestones?: GigMilestone[];
    escrow?: Escrow;
}
export interface CreateGigData {
    title: string;
    description: string;
    category: GigCategory;
    budgetType: GigBudgetType;
    budgetMin: number;
    budgetMax: number;
    currency?: string;
    experienceLevel: GigExperienceLevel;
    estimatedDuration: number;
    skills: string[];
    deliverables: string[];
    attachments?: string[];
    expiresAt?: Date;
}
export interface UpdateGigData extends Partial<CreateGigData> {
    status?: GigStatus;
}
export interface CreateApplicationData {
    gigId: string;
    coverLetter: string;
    proposedBudget: number;
    proposedTimeline: number;
    portfolioLinks: string[];
    relevantExperience: string;
    milestones?: MilestoneProposal[];
}
export interface UpdateApplicationData {
    status?: ApplicationStatus;
}
export interface CreateMilestoneData {
    title: string;
    description: string;
    amount: number;
    dueDate: Date;
    order: number;
}
export interface UpdateMilestoneData {
    status?: MilestoneStatus;
    feedback?: string;
}
export interface FundEscrowData {
    stripePaymentMethodId: string;
}
export interface ReleaseMilestoneData {
    milestoneId: string;
}
export interface RaiseDisputeData {
    reason: string;
    description: string;
    evidence: string[];
}
export interface CreateReviewData {
    rating: number;
    comment: string;
    professionalism: number;
    communication: number;
    quality: number;
    timeliness: number;
}
