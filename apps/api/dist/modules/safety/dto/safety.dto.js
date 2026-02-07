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
exports.UpdateSafetySettingsDto = exports.CreateContentRuleDto = exports.ContentFilterDto = exports.FilterAction = exports.QueryAppealsDto = exports.UpdateAppealDto = exports.CreateAppealDto = exports.AppealStatus = exports.MuteKeywordDto = exports.MuteUserDto = exports.BlockUserDto = exports.QueryModerationActionsDto = exports.CreateModerationActionDto = exports.ActionType = exports.QueryReportsDto = exports.UpdateReportDto = exports.CreateReportDto = exports.ReportEntityType = exports.ReportStatus = exports.ReportReason = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var ReportReason;
(function (ReportReason) {
    ReportReason["SPAM"] = "spam";
    ReportReason["HARASSMENT"] = "harassment";
    ReportReason["ILLEGAL"] = "illegal";
    ReportReason["NSFW_UNLABELED"] = "nsfw_unlabeled";
    ReportReason["COPYRIGHT"] = "copyright";
    ReportReason["IMPERSONATION"] = "impersonation";
    ReportReason["SELF_HARM"] = "self_harm";
    ReportReason["OTHER"] = "other";
})(ReportReason || (exports.ReportReason = ReportReason = {}));
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["PENDING"] = "pending";
    ReportStatus["UNDER_REVIEW"] = "under_review";
    ReportStatus["ACTION_TAKEN"] = "action_taken";
    ReportStatus["DISMISSED"] = "dismissed";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
var ReportEntityType;
(function (ReportEntityType) {
    ReportEntityType["POST"] = "post";
    ReportEntityType["USER"] = "user";
    ReportEntityType["MESSAGE"] = "message";
    ReportEntityType["COMMENT"] = "comment";
})(ReportEntityType || (exports.ReportEntityType = ReportEntityType = {}));
class CreateReportDto {
}
exports.CreateReportDto = CreateReportDto;
__decorate([
    (0, class_validator_1.IsEnum)(ReportEntityType),
    __metadata("design:type", String)
], CreateReportDto.prototype, "entityType", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "entityId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ReportReason),
    __metadata("design:type", String)
], CreateReportDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateReportDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateReportDto.prototype, "evidenceUrls", void 0);
class UpdateReportDto {
}
exports.UpdateReportDto = UpdateReportDto;
__decorate([
    (0, class_validator_1.IsEnum)(ReportStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateReportDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateReportDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], UpdateReportDto.prototype, "reviewNote", void 0);
class QueryReportsDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
    }
}
exports.QueryReportsDto = QueryReportsDto;
__decorate([
    (0, class_validator_1.IsEnum)(ReportStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryReportsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ReportEntityType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryReportsDto.prototype, "entityType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ReportReason),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryReportsDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryReportsDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryReportsDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryReportsDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryReportsDto.prototype, "sortOrder", void 0);
var ActionType;
(function (ActionType) {
    ActionType["WARNING"] = "warning";
    ActionType["CONTENT_REMOVAL"] = "content_removal";
    ActionType["SUSPENSION"] = "suspension";
    ActionType["BAN"] = "ban";
})(ActionType || (exports.ActionType = ActionType = {}));
class CreateModerationActionDto {
    constructor() {
        this.appealable = true;
        this.notifyUser = true;
    }
}
exports.CreateModerationActionDto = CreateModerationActionDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateModerationActionDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ActionType),
    __metadata("design:type", String)
], CreateModerationActionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateModerationActionDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateModerationActionDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateModerationActionDto.prototype, "postId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateModerationActionDto.prototype, "commentId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateModerationActionDto.prototype, "appealable", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateModerationActionDto.prototype, "notifyUser", void 0);
class QueryModerationActionsDto {
    constructor() {
        this.activeOnly = false;
        this.page = 1;
        this.limit = 20;
    }
}
exports.QueryModerationActionsDto = QueryModerationActionsDto;
__decorate([
    (0, class_validator_1.IsEnum)(ActionType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryModerationActionsDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryModerationActionsDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], QueryModerationActionsDto.prototype, "activeOnly", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryModerationActionsDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryModerationActionsDto.prototype, "limit", void 0);
class BlockUserDto {
}
exports.BlockUserDto = BlockUserDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], BlockUserDto.prototype, "blockedUserId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], BlockUserDto.prototype, "reason", void 0);
class MuteUserDto {
}
exports.MuteUserDto = MuteUserDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], MuteUserDto.prototype, "mutedUserId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MuteUserDto.prototype, "duration", void 0);
class MuteKeywordDto {
    constructor() {
        this.caseSensitive = false;
    }
}
exports.MuteKeywordDto = MuteKeywordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], MuteKeywordDto.prototype, "keyword", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], MuteKeywordDto.prototype, "caseSensitive", void 0);
var AppealStatus;
(function (AppealStatus) {
    AppealStatus["PENDING"] = "pending";
    AppealStatus["UNDER_REVIEW"] = "under_review";
    AppealStatus["APPROVED"] = "approved";
    AppealStatus["DENIED"] = "denied";
})(AppealStatus || (exports.AppealStatus = AppealStatus = {}));
class CreateAppealDto {
}
exports.CreateAppealDto = CreateAppealDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAppealDto.prototype, "actionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(50),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateAppealDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateAppealDto.prototype, "evidenceUrls", void 0);
class UpdateAppealDto {
}
exports.UpdateAppealDto = UpdateAppealDto;
__decorate([
    (0, class_validator_1.IsEnum)(AppealStatus),
    __metadata("design:type", String)
], UpdateAppealDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], UpdateAppealDto.prototype, "reviewNote", void 0);
class QueryAppealsDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.QueryAppealsDto = QueryAppealsDto;
__decorate([
    (0, class_validator_1.IsEnum)(AppealStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryAppealsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryAppealsDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryAppealsDto.prototype, "limit", void 0);
var FilterAction;
(function (FilterAction) {
    FilterAction["HIDE"] = "hide";
    FilterAction["FLAG"] = "flag";
    FilterAction["BLOCK"] = "block";
})(FilterAction || (exports.FilterAction = FilterAction = {}));
class ContentFilterDto {
}
exports.ContentFilterDto = ContentFilterDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContentFilterDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContentFilterDto.prototype, "contentType", void 0);
class CreateContentRuleDto {
    constructor() {
        this.caseSensitive = false;
        this.enabled = true;
    }
}
exports.CreateContentRuleDto = CreateContentRuleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateContentRuleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateContentRuleDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateContentRuleDto.prototype, "keywords", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FilterAction),
    __metadata("design:type", String)
], CreateContentRuleDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateContentRuleDto.prototype, "caseSensitive", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateContentRuleDto.prototype, "enabled", void 0);
class UpdateSafetySettingsDto {
}
exports.UpdateSafetySettingsDto = UpdateSafetySettingsDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateSafetySettingsDto.prototype, "hideNsfw", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateSafetySettingsDto.prototype, "hideSensitiveContent", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateSafetySettingsDto.prototype, "allowDmsFromEveryone", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateSafetySettingsDto.prototype, "allowTaggingFromEveryone", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateSafetySettingsDto.prototype, "showOnlineStatus", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateSafetySettingsDto.prototype, "mutedKeywords", void 0);
//# sourceMappingURL=safety.dto.js.map