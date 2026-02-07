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
var WalletService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const transaction_service_1 = require("./transaction.service");
let WalletService = WalletService_1 = class WalletService {
    constructor(prisma, transactionService) {
        this.prisma = prisma;
        this.transactionService = transactionService;
        this.logger = new common_1.Logger(WalletService_1.name);
    }
    async createWallet(userId) {
        try {
            const wallet = await this.prisma.wallet.create({
                data: {
                    userId,
                    balance: 0,
                    currency: 'USD',
                },
            });
            this.logger.log(`Wallet created for user ${userId}`);
            return wallet;
        }
        catch (error) {
            return this.getWallet(userId);
        }
    }
    async getWallet(userId) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                username: true,
                                displayName: true,
                            },
                        },
                    },
                },
            },
        });
        if (!wallet) {
            throw new common_1.NotFoundException(`Wallet not found for user ${userId}`);
        }
        return wallet;
    }
    async getWalletBalance(userId) {
        const wallet = await this.getWallet(userId);
        const pendingPayouts = await this.prisma.payout.aggregate({
            where: {
                userId,
                status: {
                    in: ['PENDING', 'APPROVED', 'PROCESSING'],
                },
            },
            _sum: {
                amount: true,
            },
        });
        const pending = pendingPayouts._sum.amount || 0;
        const available = Math.max(0, wallet.balance - pending);
        return {
            available: parseFloat(available.toFixed(2)),
            pending: parseFloat(pending.toFixed(2)),
            total: parseFloat(wallet.balance.toFixed(2)),
            currency: wallet.currency,
        };
    }
    async hasSufficientBalance(userId, amount) {
        const balance = await this.getWalletBalance(userId);
        return balance.available >= amount;
    }
    async addFunds(userId, amount, reason) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be positive');
        }
        const wallet = await this.prisma.wallet.update({
            where: { userId },
            data: {
                balance: {
                    increment: amount,
                },
            },
        });
        await this.prisma.transaction.create({
            data: {
                user: { connect: { id: userId } },
                wallet: { connect: { id: wallet.id } },
                type: client_1.TransactionType.CREDIT,
                amount,
                description: reason,
                referenceType: 'ADJUSTMENT',
            },
        });
        this.logger.log(`Added ${amount} to wallet for user ${userId}: ${reason}`);
        return wallet;
    }
    async deductFunds(userId, amount, reason) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be positive');
        }
        const hasFunds = await this.hasSufficientBalance(userId, amount);
        if (!hasFunds) {
            throw new common_1.BadRequestException('Insufficient balance');
        }
        const wallet = await this.prisma.wallet.update({
            where: { userId },
            data: {
                balance: {
                    decrement: amount,
                },
            },
        });
        await this.prisma.transaction.create({
            data: {
                user: { connect: { id: userId } },
                wallet: { connect: { id: wallet.id } },
                type: client_1.TransactionType.DEBIT,
                amount: -amount,
                description: reason,
                referenceType: 'ADJUSTMENT',
            },
        });
        this.logger.log(`Deducted ${amount} from wallet for user ${userId}: ${reason}`);
        return wallet;
    }
    async getWalletStats(userId) {
        const [tipsReceived, tipsSent, payouts] = await Promise.all([
            this.prisma.tip.aggregate({
                where: {
                    recipientId: userId,
                    status: 'COMPLETED',
                },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.tip.aggregate({
                where: {
                    senderId: userId,
                    status: 'COMPLETED',
                },
                _sum: { amount: true },
            }),
            this.prisma.payout.aggregate({
                where: {
                    userId,
                    status: 'COMPLETED',
                },
                _sum: { amount: true },
            }),
        ]);
        const totalReceived = tipsReceived._sum.amount || 0;
        const totalSent = tipsSent._sum.amount || 0;
        const totalPayouts = payouts._sum.amount || 0;
        const numberOfTips = tipsReceived._count;
        const averageTipReceived = numberOfTips > 0 ? totalReceived / numberOfTips : 0;
        return {
            totalReceived: parseFloat(totalReceived.toFixed(2)),
            totalSent: parseFloat(totalSent.toFixed(2)),
            totalPayouts: parseFloat(totalPayouts.toFixed(2)),
            numberOfTips,
            averageTipReceived: parseFloat(averageTipReceived.toFixed(2)),
        };
    }
    async getTopEarners(limit = 10, period = 'month') {
        const startDate = new Date();
        if (period === 'day') {
            startDate.setDate(startDate.getDate() - 1);
        }
        else if (period === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        }
        else if (period === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        }
        else {
            startDate.setFullYear(2000);
        }
        const tips = await this.prisma.tip.groupBy({
            by: ['recipientId'],
            where: {
                status: 'COMPLETED',
                createdAt: {
                    gte: startDate,
                },
            },
            _sum: {
                amount: true,
            },
            _count: true,
            orderBy: {
                _sum: {
                    amount: 'desc',
                },
            },
            take: limit,
        });
        const enrichedTips = await Promise.all(tips.map(async (tip) => {
            const user = await this.prisma.user.findUnique({
                where: { id: tip.recipientId },
                select: {
                    id: true,
                    profile: {
                        select: {
                            username: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                },
            });
            return {
                user,
                totalEarned: tip._sum.amount || 0,
                tipCount: tip._count,
            };
        }));
        return enrichedTips;
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = WalletService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transaction_service_1.TransactionService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map