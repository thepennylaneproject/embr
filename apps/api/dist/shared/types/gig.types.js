"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputeStatus = exports.EscrowStatus = exports.MilestoneStatus = exports.ApplicationStatus = exports.GigExperienceLevel = exports.GigBudgetType = exports.GigCategory = exports.GigStatus = void 0;
exports.GigStatus = {
    DRAFT: 'DRAFT',
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    DISPUTED: 'DISPUTED',
};
exports.GigCategory = {
    VIDEO_EDITING: 'VIDEO_EDITING',
    GRAPHIC_DESIGN: 'GRAPHIC_DESIGN',
    WRITING: 'WRITING',
    MUSIC_AUDIO: 'MUSIC_AUDIO',
    ANIMATION: 'ANIMATION',
    PHOTOGRAPHY: 'PHOTOGRAPHY',
    SOCIAL_MEDIA: 'SOCIAL_MEDIA',
    CONSULTING: 'CONSULTING',
    WEB_DEV: 'WEB_DEV',
    VOICE_OVER: 'VOICE_OVER',
    OTHER: 'OTHER',
};
exports.GigBudgetType = {
    FIXED: 'FIXED',
    HOURLY: 'HOURLY',
    MILESTONE: 'MILESTONE',
};
exports.GigExperienceLevel = {
    BEGINNER: 'BEGINNER',
    INTERMEDIATE: 'INTERMEDIATE',
    EXPERT: 'EXPERT',
};
exports.ApplicationStatus = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    WITHDRAWN: 'WITHDRAWN',
};
exports.MilestoneStatus = {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    SUBMITTED: 'SUBMITTED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
};
exports.EscrowStatus = {
    CREATED: 'CREATED',
    FUNDED: 'FUNDED',
    RELEASED: 'RELEASED',
    REFUNDED: 'REFUNDED',
    DISPUTED: 'DISPUTED',
};
exports.DisputeStatus = {
    OPEN: 'OPEN',
    UNDER_REVIEW: 'UNDER_REVIEW',
    RESOLVED: 'RESOLVED',
};
//# sourceMappingURL=gig.types.js.map