import { GigCategory, GigBudgetType, GigExperienceLevel, GigStatus, ApplicationStatus, MilestoneStatus } from '../../../shared/types/gig.types';
export declare class CreateGigDto {
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
export declare class UpdateGigDto {
    title?: string;
    description?: string;
    category?: GigCategory;
    budgetType?: GigBudgetType;
    budgetMin?: number;
    budgetMax?: number;
    experienceLevel?: GigExperienceLevel;
    estimatedDuration?: number;
    skills?: string[];
    deliverables?: string[];
    attachments?: string[];
    status?: GigStatus;
    expiresAt?: Date;
}
export declare class GigSearchDto {
    query?: string;
    category?: GigCategory;
    budgetMin?: number;
    budgetMax?: number;
    budgetType?: GigBudgetType;
    experienceLevel?: GigExperienceLevel;
    skills?: string[];
    sortBy?: 'recent' | 'budget_high' | 'budget_low' | 'deadline';
    page?: number;
    limit?: number;
}
export declare class MilestoneProposalDto {
    title: string;
    description: string;
    amount: number;
    estimatedDays: number;
}
export declare class CreateApplicationDto {
    gigId: string;
    coverLetter: string;
    proposedBudget: number;
    proposedTimeline: number;
    portfolioLinks: string[];
    relevantExperience: string;
    milestones?: MilestoneProposalDto[];
}
export declare class UpdateApplicationStatusDto {
    status: ApplicationStatus;
}
export declare class CreateMilestoneDto {
    title: string;
    description: string;
    amount: number;
    dueDate: Date;
    order: number;
}
export declare class UpdateMilestoneDto {
    status?: MilestoneStatus;
    feedback?: string;
}
export declare class FundEscrowDto {
    stripePaymentMethodId: string;
}
export declare class ReleaseMilestoneDto {
    milestoneId: string;
}
export declare class RaiseDisputeDto {
    reason: string;
    description: string;
    evidence: string[];
}
export declare class CreateReviewDto {
    rating: number;
    comment: string;
    professionalism: number;
    communication: number;
    quality: number;
    timeliness: number;
}
