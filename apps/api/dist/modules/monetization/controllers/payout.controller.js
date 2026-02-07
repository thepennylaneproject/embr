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
exports.PayoutController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const payout_service_1 = require("../services/payout.service");
const payout_dto_1 = require("../dto/payout.dto");
let PayoutController = class PayoutController {
    constructor(payoutService) {
        this.payoutService = payoutService;
    }
    async createPayoutRequest(req, dto) {
        return this.payoutService.createPayoutRequest(req.user.id, dto);
    }
    async getPayouts(req, query) {
        return this.payoutService.getPayouts(req.user.id, query);
    }
    async getPayoutStats(req) {
        return this.payoutService.getPayoutStats(req.user.id);
    }
    async getPendingPayouts() {
        return this.payoutService.getPendingPayouts();
    }
    async approvePayout(req, id, dto) {
        return this.payoutService.approvePayout(req.user.id, {
            payoutRequestId: id,
            ...dto,
        });
    }
    async rejectPayout(req, id, reason) {
        return this.payoutService.approvePayout(req.user.id, {
            payoutRequestId: id,
            approve: false,
            rejectionReason: reason,
        });
    }
    async getPayout(req, id) {
        return { id };
    }
};
exports.PayoutController = PayoutController;
__decorate([
    (0, common_1.Post)('request'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payout_dto_1.CreatePayoutRequestDto]),
    __metadata("design:returntype", Promise)
], PayoutController.prototype, "createPayoutRequest", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payout_dto_1.GetPayoutsQueryDto]),
    __metadata("design:returntype", Promise)
], PayoutController.prototype, "getPayouts", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayoutController.prototype, "getPayoutStats", null);
__decorate([
    (0, common_1.Get)('pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayoutController.prototype, "getPendingPayouts", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PayoutController.prototype, "approvePayout", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PayoutController.prototype, "rejectPayout", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PayoutController.prototype, "getPayout", null);
exports.PayoutController = PayoutController = __decorate([
    (0, common_1.Controller)('payouts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [payout_service_1.PayoutService])
], PayoutController);
//# sourceMappingURL=payout.controller.js.map