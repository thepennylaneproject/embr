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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const reports_service_1 = require("../services/reports.service");
const moderation_actions_service_1 = require("../services/moderation-actions.service");
const blocking_service_1 = require("../services/blocking.service");
const appeals_service_1 = require("../services/appeals.service");
const content_filter_service_1 = require("../services/content-filter.service");
const safety_dto_1 = require("../dto/safety.dto");
let SafetyController = class SafetyController {
    constructor(reportsService, moderationActionsService, blockingService, appealsService, contentFilterService) {
        this.reportsService = reportsService;
        this.moderationActionsService = moderationActionsService;
        this.blockingService = blockingService;
        this.appealsService = appealsService;
        this.contentFilterService = contentFilterService;
    }
    async createReport(req, dto) {
        return this.reportsService.createReport(req.user.id, dto);
    }
    async getReports(query, req) {
        return this.reportsService.getReports(query, req.user.id);
    }
    async getReportById(id, req) {
        return this.reportsService.getReportById(id, req.user.id);
    }
    async updateReport(id, req, dto) {
        return this.reportsService.updateReport(id, req.user.id, dto);
    }
    async bulkUpdateReports(req, body) {
        return this.reportsService.bulkUpdateReports(body.reportIds, req.user.id, body.updates);
    }
    async getQueueStats() {
        return this.reportsService.getQueueStats();
    }
    async createModerationAction(req, dto) {
        return this.moderationActionsService.createAction(req.user.id, dto);
    }
    async getModerationActions(query) {
        return this.moderationActionsService.getActions(query);
    }
    async getModerationActionById(id) {
        return this.moderationActionsService.getActionById(id);
    }
    async revokeModerationAction(id, req, body) {
        return this.moderationActionsService.revokeAction(id, req.user.id, body.reason);
    }
    async getUserModerationHistory(userId) {
        return this.moderationActionsService.getUserHistory(userId);
    }
    async checkUserRestriction(userId) {
        return this.moderationActionsService.checkUserRestriction(userId);
    }
    async getModerationStats(days) {
        return this.moderationActionsService.getStats(days ? parseInt(days) : 30);
    }
    async blockUser(req, dto) {
        return this.blockingService.blockUser(req.user.id, dto);
    }
    async unblockUser(req, userId) {
        return this.blockingService.unblockUser(req.user.id, userId);
    }
    async getBlockedUsers(req, page, limit) {
        return this.blockingService.getBlockedUsers(req.user.id, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }
    async checkIfBlocked(req, userId) {
        const blocked = await this.blockingService.isBlocked(req.user.id, userId);
        return { blocked };
    }
    async muteUser(req, dto) {
        return this.blockingService.muteUser(req.user.id, dto);
    }
    async unmuteUser(req, userId) {
        return this.blockingService.unmuteUser(req.user.id, userId);
    }
    async getMutedUsers(req, page, limit) {
        return this.blockingService.getMutedUsers(req.user.id, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }
    async checkIfMuted(req, userId) {
        const muted = await this.blockingService.isMuted(req.user.id, userId);
        return { muted };
    }
    async addMutedKeyword(req, dto) {
        return this.blockingService.addMutedKeyword(req.user.id, dto);
    }
    async removeMutedKeyword(req, keywordId) {
        return this.blockingService.removeMutedKeyword(req.user.id, keywordId);
    }
    async getMutedKeywords(req) {
        return this.blockingService.getMutedKeywords(req.user.id);
    }
    async createAppeal(req, dto) {
        return this.appealsService.createAppeal(req.user.id, dto);
    }
    async getAppeals(query) {
        return this.appealsService.getAppeals(query);
    }
    async getAppealById(id) {
        return this.appealsService.getAppealById(id);
    }
    async updateAppeal(id, req, dto) {
        return this.appealsService.updateAppeal(id, req.user.id, dto);
    }
    async getUserAppeals(req) {
        return this.appealsService.getUserAppeals(req.user.id);
    }
    async getAppealStats(days) {
        return this.appealsService.getStats(days ? parseInt(days) : 30);
    }
    async filterContent(req, dto) {
        return this.contentFilterService.filterContent(dto.content, req.user.id);
    }
    async getUserSpamScore(req) {
        const score = await this.contentFilterService.checkUserSpamScore(req.user.id);
        return { score, risk: this.getRiskLevel(score) };
    }
    async createContentRule(dto) {
        return this.contentFilterService.createRule(dto);
    }
    async getContentRules(includeDisabled) {
        return this.contentFilterService.getRules(includeDisabled === true);
    }
    async updateContentRule(id, updates) {
        return this.contentFilterService.updateRule(id, updates);
    }
    async deleteContentRule(id) {
        return this.contentFilterService.deleteRule(id);
    }
    async getFilterStats(days) {
        return this.contentFilterService.getStats(days ? parseInt(days) : 30);
    }
    getRiskLevel(score) {
        if (score >= 500)
            return 'critical';
        if (score >= 300)
            return 'high';
        if (score >= 150)
            return 'medium';
        if (score >= 50)
            return 'low';
        return 'none';
    }
};
exports.SafetyController = SafetyController;
__decorate([
    (0, common_1.Post)('reports'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, safety_dto_1.CreateReportDto]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "createReport", null);
__decorate([
    (0, common_1.Get)('reports'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'moderator'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [safety_dto_1.QueryReportsDto, Object]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getReports", null);
__decorate([
    (0, common_1.Get)('reports/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'moderator'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getReportById", null);
__decorate([
    (0, common_1.Put)('reports/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'moderator'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, safety_dto_1.UpdateReportDto]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "updateReport", null);
__decorate([
    (0, common_1.Put)('reports/bulk'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'moderator'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "bulkUpdateReports", null);
__decorate([
    (0, common_1.Get)('reports/stats/queue'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'moderator'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getQueueStats", null);
__decorate([
    (0, common_1.Post)('moderation/actions'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'moderator'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, safety_dto_1.CreateModerationActionDto]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "createModerationAction", null);
__decorate([
    (0, common_1.Get)('moderation/actions'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'moderator'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [safety_dto_1.QueryModerationActionsDto]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getModerationActions", null);
__decorate([
    (0, common_1.Get)('moderation/actions/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'moderator'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getModerationActionById", null);
__decorate([
    (0, common_1.Delete)('moderation/actions/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "revokeModerationAction", null);
__decorate([
    (0, common_1.Get)('moderation/users/:userId/history'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'moderator'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getUserModerationHistory", null);
__decorate([
    (0, common_1.Get)('moderation/users/:userId/restriction'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "checkUserRestriction", null);
__decorate([
    (0, common_1.Get)('moderation/stats'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'moderator'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getModerationStats", null);
__decorate([
    (0, common_1.Post)('blocking/block'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, safety_dto_1.BlockUserDto]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "blockUser", null);
__decorate([
    (0, common_1.Delete)('blocking/block/:userId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "unblockUser", null);
__decorate([
    (0, common_1.Get)('blocking/blocked'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getBlockedUsers", null);
__decorate([
    (0, common_1.Get)('blocking/check/:userId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "checkIfBlocked", null);
__decorate([
    (0, common_1.Post)('muting/mute'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, safety_dto_1.MuteUserDto]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "muteUser", null);
__decorate([
    (0, common_1.Delete)('muting/mute/:userId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "unmuteUser", null);
__decorate([
    (0, common_1.Get)('muting/muted'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getMutedUsers", null);
__decorate([
    (0, common_1.Get)('muting/check/:userId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "checkIfMuted", null);
__decorate([
    (0, common_1.Post)('muting/keywords'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, safety_dto_1.MuteKeywordDto]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "addMutedKeyword", null);
__decorate([
    (0, common_1.Delete)('muting/keywords/:keywordId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('keywordId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "removeMutedKeyword", null);
__decorate([
    (0, common_1.Get)('muting/keywords'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getMutedKeywords", null);
__decorate([
    (0, common_1.Post)('appeals'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, safety_dto_1.CreateAppealDto]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "createAppeal", null);
__decorate([
    (0, common_1.Get)('appeals'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'moderator'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [safety_dto_1.QueryAppealsDto]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getAppeals", null);
__decorate([
    (0, common_1.Get)('appeals/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getAppealById", null);
__decorate([
    (0, common_1.Put)('appeals/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'moderator'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, safety_dto_1.UpdateAppealDto]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "updateAppeal", null);
__decorate([
    (0, common_1.Get)('appeals/user/my-appeals'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getUserAppeals", null);
__decorate([
    (0, common_1.Get)('appeals/stats'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'moderator'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getAppealStats", null);
__decorate([
    (0, common_1.Post)('filter/check'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, safety_dto_1.ContentFilterDto]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "filterContent", null);
__decorate([
    (0, common_1.Get)('filter/user-score'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getUserSpamScore", null);
__decorate([
    (0, common_1.Post)('filter/rules'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [safety_dto_1.CreateContentRuleDto]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "createContentRule", null);
__decorate([
    (0, common_1.Get)('filter/rules'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'moderator'),
    __param(0, (0, common_1.Query)('includeDisabled')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getContentRules", null);
__decorate([
    (0, common_1.Put)('filter/rules/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "updateContentRule", null);
__decorate([
    (0, common_1.Delete)('filter/rules/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "deleteContentRule", null);
__decorate([
    (0, common_1.Get)('filter/stats'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'moderator'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "getFilterStats", null);
exports.SafetyController = SafetyController = __decorate([
    (0, common_1.Controller)('safety'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService,
        moderation_actions_service_1.ModerationActionsService,
        blocking_service_1.BlockingService,
        appeals_service_1.AppealsService,
        content_filter_service_1.ContentFilterService])
], SafetyController);
//# sourceMappingURL=safety.controller.js.map