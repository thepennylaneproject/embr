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
var PayoutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const wallet_service_1 = require("./wallet.service");
const transaction_service_1 = require("./transaction.service");
const client_1 = require("@prisma/client");
const stripe_1 = require("stripe");
let PayoutService = PayoutService_1 = class PayoutService {
    constructor(prisma, walletService, transactionService) {
        this.prisma = prisma;
        this.walletService = walletService;
        this.transactionService = transactionService;
        this.logger = new common_1.Logger(PayoutService_1.name);
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
    }
    async createPayoutRequest(userId, dto) {
        const { amount, note } = dto;
        if (amount < 10) {
            throw new common_1.BadRequestException('Minimum payout amount is $10');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { wallet: true, profile: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.wallet?.stripeConnectAccountId) {
            throw new common_1.BadRequestException('Please complete Stripe Connect onboarding first');
        }
        if (!user.wallet.payoutsEnabled) {
            throw new common_1.BadRequestException('Your account is not yet enabled for payouts');
        }
        const balance = await this.walletService.getWalletBalance(userId);
        if (balance.available < amount) {
            throw new common_1.BadRequestException(`Insufficient balance. Available: $${balance.available.toFixed(2)}`);
        }
        const pendingPayout = await this.prisma.payout.findFirst({
            where: {
                userId,
                status: {
                    in: [
                        client_1.PayoutStatus.PENDING,
                        client_1.PayoutStatus.APPROVED,
                        client_1.PayoutStatus.PROCESSING,
                    ],
                },
            },
        });
        if (pendingPayout) {
            throw new common_1.BadRequestException('You already have a pending payout request');
        }
        const payout = await this.prisma.payout.create({
            data: {
                user: { connect: { id: userId } },
                wallet: { connect: { userId } },
                amount,
                note,
                status: client_1.PayoutStatus.PENDING,
                currency: 'USD',
            },
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
        this.logger.log(`Payout request created: ${payout.id} for $${amount}`);
        await this.createAdminNotification('PAYOUT_REQUESTED', `New payout request from ${user.profile?.displayName || user.email}: $${amount}`, payout.id);
        return payout;
    }
    async approvePayout(adminId, dto) {
        const { payoutRequestId, approve, rejectionReason } = dto;
        const payout = await this.prisma.payout.findUnique({
            where: { id: payoutRequestId },
            include: {
                user: {
                    include: {
                        wallet: true,
                    },
                },
            },
        });
        if (!payout) {
            throw new common_1.NotFoundException('Payout request not found');
        }
        if (payout.status !== client_1.PayoutStatus.PENDING) {
            throw new common_1.BadRequestException(`Cannot process payout with status: ${payout.status}`);
        }
        if (approve) {
            await this.prisma.payout.update({
                where: { id: payoutRequestId },
                data: {
                    status: client_1.PayoutStatus.APPROVED,
                    approvedBy: adminId,
                    approvedAt: new Date(),
                },
            });
            try {
                await this.processStripePayout(payoutRequestId);
            }
            catch (error) {
                this.logger.error(`Stripe payout failed: ${error.message}`);
                await this.prisma.payout.update({
                    where: { id: payoutRequestId },
                    data: {
                        status: client_1.PayoutStatus.FAILED,
                        failureReason: error.message,
                    },
                });
                throw error;
            }
        }
        else {
            await this.prisma.payout.update({
                where: { id: payoutRequestId },
                data: {
                    status: client_1.PayoutStatus.REJECTED,
                    rejectedBy: adminId,
                    rejectedAt: new Date(),
                    rejectionReason,
                },
            });
            await this.prisma.notification.create({
                data: {
                    userId: payout.userId,
                    type: 'PAYOUT_REJECTED',
                    title: 'Payout request rejected',
                    message: rejectionReason || 'Your payout request was not approved',
                    referenceId: payoutRequestId,
                    referenceType: 'PAYOUT',
                },
            });
            this.logger.log(`Payout rejected: ${payoutRequestId}`);
        }
        return this.prisma.payout.findUnique({
            where: { id: payoutRequestId },
        });
    }
    async processStripePayout(payoutId) {
        const payout = await this.prisma.payout.findUnique({
            where: { id: payoutId },
            include: {
                user: {
                    include: {
                        wallet: true,
                        profile: true,
                    },
                },
            },
        });
        if (!payout) {
            throw new common_1.NotFoundException('Payout not found');
        }
        const stripeAccountId = payout.user.wallet?.stripeConnectAccountId;
        if (!stripeAccountId) {
            throw new common_1.BadRequestException('No Stripe Connect account found');
        }
        await this.prisma.payout.update({
            where: { id: payoutId },
            data: { status: client_1.PayoutStatus.PROCESSING },
        });
        try {
            const amountInCents = Math.round(payout.amount * 100);
            const stripePayout = await this.stripe.payouts.create({
                amount: amountInCents,
                currency: payout.currency.toLowerCase(),
                description: `Payout for ${payout.user.profile?.username || payout.user.email}`,
                metadata: {
                    payoutId: payout.id,
                    userId: payout.userId,
                },
            }, {
                stripeAccount: stripeAccountId,
            });
            await this.prisma.payout.update({
                where: { id: payoutId },
                data: {
                    stripePayoutId: stripePayout.id,
                    status: client_1.PayoutStatus.PROCESSING,
                    processedAt: new Date(),
                },
            });
            await this.walletService.deductFunds(payout.userId, payout.amount, `Payout to bank account`);
            await this.transactionService.recordPayoutTransaction(payout.userId, payout.amount, payoutId);
            await this.prisma.notification.create({
                data: {
                    userId: payout.userId,
                    type: 'PAYOUT_PROCESSING',
                    title: 'Payout is processing',
                    message: `Your payout of $${payout.amount.toFixed(2)} is being processed`,
                    referenceId: payoutId,
                    referenceType: 'PAYOUT',
                },
            });
            this.logger.log(`Stripe payout initiated: ${stripePayout.id} for payout ${payoutId}`);
        }
        catch (error) {
            await this.prisma.payout.update({
                where: { id: payoutId },
                data: {
                    status: 'FAILED',
                    failureReason: error.message,
                },
            });
            throw error;
        }
    }
    async completePayout(stripePayoutId) {
        const payout = await this.prisma.payout.findFirst({
            where: { stripePayoutId },
        });
        if (!payout) {
            throw new common_1.NotFoundException('Payout not found');
        }
        await this.prisma.payout.update({
            where: { id: payout.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
            },
        });
        await this.prisma.notification.create({
            data: {
                userId: payout.userId,
                type: 'PAYOUT_COMPLETED',
                title: 'Payout completed',
                message: `Your payout of $${payout.amount.toFixed(2)} has been sent to your bank`,
                referenceId: payout.id,
                referenceType: 'PAYOUT',
            },
        });
        this.logger.log(`Payout completed: ${payout.id}`);
        return payout;
    }
    async getPayouts(userId, query) {
        const { status, page = 1, limit = 20 } = query;
        const where = { userId };
        if (status) {
            where.status = status;
        }
        const [payouts, total] = await Promise.all([
            this.prisma.payout.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            profile: {
                                select: {
                                    username: true,
                                    displayName: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.payout.count({ where }),
        ]);
        return {
            payouts,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getPendingPayouts() {
        return this.prisma.payout.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'asc' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                username: true,
                                displayName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async getPayoutStats(userId) {
        const [completed, pending] = await Promise.all([
            this.prisma.payout.aggregate({
                where: {
                    userId,
                    status: 'COMPLETED',
                },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.payout.aggregate({
                where: {
                    userId,
                    status: {
                        in: ['PENDING', 'APPROVED', 'PROCESSING'],
                    },
                },
                _sum: { amount: true },
            }),
        ]);
        const lastPayout = await this.prisma.payout.findFirst({
            where: {
                userId,
                status: 'COMPLETED',
            },
            orderBy: { completedAt: 'desc' },
            select: { completedAt: true },
        });
        return {
            totalPayouts: completed._count,
            totalAmount: parseFloat((completed._sum.amount || 0).toFixed(2)),
            pendingAmount: parseFloat((pending._sum.amount || 0).toFixed(2)),
            lastPayoutDate: lastPayout?.completedAt,
        };
    }
    async createAdminNotification(type, message, referenceId) {
        const admins = await this.prisma.user.findMany({
            where: { role: 'ADMIN' },
        });
        await Promise.all(admins.map((admin) => this.prisma.notification.create({
            data: {
                userId: admin.id,
                type,
                title: 'Admin Action Required',
                message,
                referenceId,
                referenceType: 'PAYOUT',
            },
        })));
    }
};
exports.PayoutService = PayoutService;
exports.PayoutService = PayoutService = PayoutService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_service_1.WalletService,
        transaction_service_1.TransactionService])
], PayoutService);
//# sourceMappingURL=payout.service.js.map