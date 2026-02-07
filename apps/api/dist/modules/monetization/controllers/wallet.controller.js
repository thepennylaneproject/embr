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
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const wallet_service_1 = require("../services/wallet.service");
const transaction_service_1 = require("../services/transaction.service");
const wallet_dto_1 = require("../dto/wallet.dto");
let WalletController = class WalletController {
    constructor(walletService, transactionService) {
        this.walletService = walletService;
        this.transactionService = transactionService;
    }
    async getWallet(req) {
        return this.walletService.getWallet(req.user.id);
    }
    async getBalance(req) {
        return this.walletService.getWalletBalance(req.user.id);
    }
    async getStats(req) {
        return this.walletService.getWalletStats(req.user.id);
    }
    async getTransactions(req, query) {
        const filters = {
            type: query.type,
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
            page: query.page || 1,
            limit: query.limit || 20,
        };
        return this.transactionService.getUserTransactions(req.user.id, filters);
    }
    async verifyIntegrity(req) {
        return this.transactionService.verifyWalletIntegrity(req.user.id);
    }
    async getFinancialSummary(req, startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.transactionService.getFinancialSummary(req.user.id, start, end);
    }
    async getTopEarners(limit, period) {
        return this.walletService.getTopEarners(limit, period);
    }
    async addFunds(req, amount, reason) {
        return this.walletService.addFunds(req.user.id, amount, reason);
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Get)('balance'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.GetTransactionsQueryDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('verify-integrity'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "verifyIntegrity", null);
__decorate([
    (0, common_1.Get)('financial-summary'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getFinancialSummary", null);
__decorate([
    (0, common_1.Get)('top-earners'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getTopEarners", null);
__decorate([
    (0, common_1.Post)('add-funds'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('amount')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "addFunds", null);
exports.WalletController = WalletController = __decorate([
    (0, common_1.Controller)('wallet'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [wallet_service_1.WalletService,
        transaction_service_1.TransactionService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map