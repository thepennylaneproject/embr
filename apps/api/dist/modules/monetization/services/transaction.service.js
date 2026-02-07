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
var TransactionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const wallet_dto_1 = require("../dto/wallet.dto");
const client_1 = require("@prisma/client");
let TransactionService = TransactionService_1 = class TransactionService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TransactionService_1.name);
    }
    async recordTransaction(params) {
        const { userId, type, amount, description, referenceId, referenceType, metadata } = params;
        await this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.upsert({
                where: { userId },
                create: {
                    userId,
                    balance: amount,
                    pendingBalance: 0,
                    totalEarned: 0,
                    totalWithdrawn: 0,
                    currency: 'USD',
                },
                update: {
                    balance: {
                        increment: amount,
                    },
                },
            });
            await tx.transaction.create({
                data: {
                    wallet: { connect: { id: wallet.id } },
                    user: { connect: { id: userId } },
                    type,
                    amount,
                    description,
                    referenceId,
                    referenceType,
                    metadata: metadata || {},
                },
            });
        });
    }
    async recordTipTransaction(senderId, recipientId, amount, tipId) {
        const platformFee = amount * 0.05;
        const netAmount = amount - platformFee;
        await this.recordTransaction({
            userId: senderId,
            type: client_1.TransactionType.TIP_SENT,
            amount: -Math.abs(amount),
            description: 'Tip sent',
            referenceId: tipId,
            referenceType: 'TIP',
            metadata: { grossAmount: amount, platformFee, netAmount },
        });
        await this.recordTransaction({
            userId: recipientId,
            type: client_1.TransactionType.TIP_RECEIVED,
            amount: Math.abs(netAmount),
            description: 'Tip received',
            referenceId: tipId,
            referenceType: 'TIP',
            metadata: { grossAmount: amount, platformFee, netAmount },
        });
        if (platformFee > 0) {
            await this.recordTransaction({
                userId: recipientId,
                type: client_1.TransactionType.PLATFORM_FEE,
                amount: -Math.abs(platformFee),
                description: 'Platform fee',
                referenceId: tipId,
                referenceType: 'FEE',
                metadata: { grossAmount: amount, platformFee, netAmount },
            });
        }
    }
    async recordPayoutTransaction(userId, amount, payoutId) {
        await this.recordTransaction({
            userId,
            type: client_1.TransactionType.PAYOUT,
            amount: -Math.abs(amount),
            description: 'Payout to bank account',
            referenceId: payoutId,
            referenceType: 'PAYOUT',
            metadata: { payoutId },
        });
    }
    async getUserTransactions(userId, filters) {
        const { type, startDate, endDate, page = 1, limit = 20 } = filters;
        const where = { userId };
        if (type) {
            switch (type) {
                case wallet_dto_1.TransactionType.TIP:
                    where.type = {
                        in: [
                            client_1.TransactionType.TIP_SENT,
                            client_1.TransactionType.TIP_RECEIVED,
                        ],
                    };
                    break;
                case wallet_dto_1.TransactionType.WITHDRAWAL:
                    where.type = client_1.TransactionType.PAYOUT;
                    break;
                case wallet_dto_1.TransactionType.GIG_REFUND:
                    where.type = client_1.TransactionType.REFUND;
                    break;
                case wallet_dto_1.TransactionType.PLATFORM_FEE:
                    where.type = client_1.TransactionType.PLATFORM_FEE;
                    break;
                case wallet_dto_1.TransactionType.GIG_PAYMENT:
                    where.type = client_1.TransactionType.GIG_PAYMENT;
                    break;
                default:
                    if (type in client_1.TransactionType) {
                        where.type = type;
                    }
                    break;
            }
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.transaction.count({ where }),
        ]);
        return { transactions, total };
    }
    async verifyWalletIntegrity(userId) {
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) {
            return { valid: false, reason: 'Wallet not found' };
        }
        const aggregate = await this.prisma.transaction.aggregate({
            where: { userId },
            _sum: { amount: true },
        });
        const computed = aggregate._sum.amount || 0;
        const diff = wallet.balance - computed;
        return {
            valid: Math.abs(diff) < 0.01,
            walletBalance: wallet.balance,
            computedBalance: computed,
            difference: diff,
        };
    }
    async getFinancialSummary(userId, start, end) {
        const transactions = await this.prisma.transaction.findMany({
            where: {
                userId,
                createdAt: { gte: start, lte: end },
            },
        });
        const totalIn = transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        const totalOut = transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        return {
            totalIn,
            totalOut,
            net: totalIn - totalOut,
            count: transactions.length,
            start,
            end,
        };
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = TransactionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map