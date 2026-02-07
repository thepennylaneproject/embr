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
exports.CreateReviewDto = exports.RaiseDisputeDto = exports.ReleaseMilestoneDto = exports.FundEscrowDto = exports.UpdateMilestoneDto = exports.CreateMilestoneDto = exports.UpdateApplicationStatusDto = exports.CreateApplicationDto = exports.MilestoneProposalDto = exports.GigSearchDto = exports.UpdateGigDto = exports.CreateGigDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const gig_types_1 = require("../../../shared/types/gig.types");
class CreateGigDto {
    constructor() {
        this.currency = 'USD';
    }
}
exports.CreateGigDto = CreateGigDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateGigDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(50),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreateGigDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(gig_types_1.GigCategory),
    __metadata("design:type", String)
], CreateGigDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(gig_types_1.GigBudgetType),
    __metadata("design:type", String)
], CreateGigDto.prototype, "budgetType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateGigDto.prototype, "budgetMin", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateGigDto.prototype, "budgetMax", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGigDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(gig_types_1.GigExperienceLevel),
    __metadata("design:type", String)
], CreateGigDto.prototype, "experienceLevel", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(365),
    __metadata("design:type", Number)
], CreateGigDto.prototype, "estimatedDuration", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], CreateGigDto.prototype, "skills", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], CreateGigDto.prototype, "deliverables", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateGigDto.prototype, "attachments", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateGigDto.prototype, "expiresAt", void 0);
class UpdateGigDto {
}
exports.UpdateGigDto = UpdateGigDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(200),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGigDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(50),
    (0, class_validator_1.MaxLength)(5000),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGigDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(gig_types_1.GigCategory),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGigDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(gig_types_1.GigBudgetType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGigDto.prototype, "budgetType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateGigDto.prototype, "budgetMin", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateGigDto.prototype, "budgetMax", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(gig_types_1.GigExperienceLevel),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGigDto.prototype, "experienceLevel", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(365),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateGigDto.prototype, "estimatedDuration", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateGigDto.prototype, "skills", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateGigDto.prototype, "deliverables", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateGigDto.prototype, "attachments", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(gig_types_1.GigStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGigDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateGigDto.prototype, "expiresAt", void 0);
class GigSearchDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.GigSearchDto = GigSearchDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GigSearchDto.prototype, "query", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(gig_types_1.GigCategory),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GigSearchDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GigSearchDto.prototype, "budgetMin", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GigSearchDto.prototype, "budgetMax", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(gig_types_1.GigBudgetType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GigSearchDto.prototype, "budgetType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(gig_types_1.GigExperienceLevel),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GigSearchDto.prototype, "experienceLevel", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], GigSearchDto.prototype, "skills", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GigSearchDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GigSearchDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GigSearchDto.prototype, "limit", void 0);
class MilestoneProposalDto {
}
exports.MilestoneProposalDto = MilestoneProposalDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], MilestoneProposalDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], MilestoneProposalDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], MilestoneProposalDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(365),
    __metadata("design:type", Number)
], MilestoneProposalDto.prototype, "estimatedDays", void 0);
class CreateApplicationDto {
}
exports.CreateApplicationDto = CreateApplicationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "gigId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(100),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "coverLetter", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateApplicationDto.prototype, "proposedBudget", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(365),
    __metadata("design:type", Number)
], CreateApplicationDto.prototype, "proposedTimeline", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUrl)({}, { each: true }),
    __metadata("design:type", Array)
], CreateApplicationDto.prototype, "portfolioLinks", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(50),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "relevantExperience", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => MilestoneProposalDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateApplicationDto.prototype, "milestones", void 0);
class UpdateApplicationStatusDto {
}
exports.UpdateApplicationStatusDto = UpdateApplicationStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(gig_types_1.ApplicationStatus),
    __metadata("design:type", String)
], UpdateApplicationStatusDto.prototype, "status", void 0);
class CreateMilestoneDto {
}
exports.CreateMilestoneDto = CreateMilestoneDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateMilestoneDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateMilestoneDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateMilestoneDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateMilestoneDto.prototype, "dueDate", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateMilestoneDto.prototype, "order", void 0);
class UpdateMilestoneDto {
}
exports.UpdateMilestoneDto = UpdateMilestoneDto;
__decorate([
    (0, class_validator_1.IsEnum)(gig_types_1.MilestoneStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMilestoneDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(1000),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMilestoneDto.prototype, "feedback", void 0);
class FundEscrowDto {
}
exports.FundEscrowDto = FundEscrowDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FundEscrowDto.prototype, "stripePaymentMethodId", void 0);
class ReleaseMilestoneDto {
}
exports.ReleaseMilestoneDto = ReleaseMilestoneDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReleaseMilestoneDto.prototype, "milestoneId", void 0);
class RaiseDisputeDto {
}
exports.RaiseDisputeDto = RaiseDisputeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], RaiseDisputeDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(50),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], RaiseDisputeDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], RaiseDisputeDto.prototype, "evidence", void 0);
class CreateReviewDto {
}
exports.CreateReviewDto = CreateReviewDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CreateReviewDto.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateReviewDto.prototype, "comment", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CreateReviewDto.prototype, "professionalism", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CreateReviewDto.prototype, "communication", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CreateReviewDto.prototype, "quality", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CreateReviewDto.prototype, "timeliness", void 0);
//# sourceMappingURL=gig.dto.js.map