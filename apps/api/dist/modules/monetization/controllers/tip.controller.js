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
exports.TipController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const tip_service_1 = require("../services/tip.service");
const tip_dto_1 = require("../dto/tip.dto");
let TipController = class TipController {
    constructor(tipService) {
        this.tipService = tipService;
    }
    async createTip(req, dto) {
        return this.tipService.createTip(req.user.id, dto);
    }
    async getTips(req, query) {
        return this.tipService.getTips(req.user.id, query);
    }
    async getTipStats(req, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.tipService.getTipStats(req.user.id, start, end);
    }
    async getTip(id) {
        return { id };
    }
    async refundTip(id, reason) {
        return this.tipService.refundTip(id, reason);
    }
    async getTipsByPost(postId, query) {
        return this.tipService.getTips('', { ...query, postId });
    }
    async getTipsReceivedByUser(userId, query) {
        return this.tipService.getTips(userId, { ...query, type: 'received' });
    }
};
exports.TipController = TipController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tip_dto_1.CreateTipDto]),
    __metadata("design:returntype", Promise)
], TipController.prototype, "createTip", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tip_dto_1.GetTipsQueryDto]),
    __metadata("design:returntype", Promise)
], TipController.prototype, "getTips", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TipController.prototype, "getTipStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TipController.prototype, "getTip", null);
__decorate([
    (0, common_1.Post)(':id/refund'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TipController.prototype, "refundTip", null);
__decorate([
    (0, common_1.Get)('post/:postId'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tip_dto_1.GetTipsQueryDto]),
    __metadata("design:returntype", Promise)
], TipController.prototype, "getTipsByPost", null);
__decorate([
    (0, common_1.Get)('user/:userId/received'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tip_dto_1.GetTipsQueryDto]),
    __metadata("design:returntype", Promise)
], TipController.prototype, "getTipsReceivedByUser", null);
exports.TipController = TipController = __decorate([
    (0, common_1.Controller)('tips'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tip_service_1.TipService])
], TipController);
//# sourceMappingURL=tip.controller.js.map