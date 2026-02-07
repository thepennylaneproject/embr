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
exports.StripeConnectController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const stripe_connect_service_1 = require("../services/stripe-connect.service");
const wallet_dto_1 = require("../dto/wallet.dto");
let StripeConnectController = class StripeConnectController {
    constructor(stripeConnectService) {
        this.stripeConnectService = stripeConnectService;
    }
    async createAccount(req, dto) {
        return this.stripeConnectService.createConnectAccount(req.user.id, dto);
    }
    async getAccountStatus(req) {
        return this.stripeConnectService.getAccountStatus(req.user.id);
    }
    async getAccountDetails(req) {
        return this.stripeConnectService.getAccountDetails(req.user.id);
    }
    async getAccountLink(req, dto) {
        return this.stripeConnectService.getAccountLink(req.user.id, dto);
    }
    async completeOnboarding(req) {
        return this.stripeConnectService.completeOnboarding(req.user.id);
    }
    async deleteAccount(req) {
        await this.stripeConnectService.deleteAccount(req.user.id);
    }
};
exports.StripeConnectController = StripeConnectController;
__decorate([
    (0, common_1.Post)('account'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.CreateStripeConnectAccountDto]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "createAccount", null);
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "getAccountStatus", null);
__decorate([
    (0, common_1.Get)('account'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "getAccountDetails", null);
__decorate([
    (0, common_1.Post)('account-link'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.GetStripeAccountLinkDto]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "getAccountLink", null);
__decorate([
    (0, common_1.Post)('complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "completeOnboarding", null);
__decorate([
    (0, common_1.Delete)('account'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "deleteAccount", null);
exports.StripeConnectController = StripeConnectController = __decorate([
    (0, common_1.Controller)('stripe-connect'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [stripe_connect_service_1.StripeConnectService])
], StripeConnectController);
//# sourceMappingURL=stripe-connect.controller.js.map