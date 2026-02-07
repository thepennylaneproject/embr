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
var TipService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const wallet_service_1 = require("./wallet.service");
const transaction_service_1 = require("./transaction.service");
const stripe_1 = require("stripe");
let TipService = TipService_1 = class TipService {
    constructor(prisma, walletService, transactionService) {
        this.prisma = prisma;
        this.walletService = walletService;
        this.transactionService = transactionService;
        this.logger = new common_1.Logger(TipService_1.name);
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
    }
    async createTip(senderId, dto) {
        const { recipientId, postId, amount, message, paymentMethodId } = dto;
        if (senderId === recipientId) {
            throw new common_1.BadRequestException('Cannot tip yourself');
        }
        if (amount < 0.5) {
            throw new common_1.BadRequestException('Minimum tip amount is $0.50');
        }
        if (amount > 1000) {
            throw new common_1.BadRequestException('Maximum tip amount is $1,000');
        }
        const recipient = await this.prisma.user.findUnique({
            where: { id: recipientId },
            include: { profile: true },
        });
        if (!recipient) {
            throw new common_1.NotFoundException('Recipient not found');
        }
        if (postId) {
            const post = await this.prisma.post.findUnique({
                where: { id: postId },
            });
            if (!post) {
                throw new common_1.NotFoundException('Post not found');
            }
            if (post.authorId !== recipientId) {
                throw new common_1.BadRequestException('Post does not belong to recipient');
            }
        }
        const tip = await this.prisma.tip.create({
            data: {
                senderId,
                recipientId,
                postId,
                amount,
                message,
                status: 'PENDING',
            },
            include: {
                sender: {
                    select: {
                        user: {
                            select: {
                                username: true,
                                profile: {
                                    select: {
                                        displayName: true,
                                        avatarUrl: true,
                                    },
                                },
                            },
                        },
                    },
                },
                recipient: {
                    select: {
                        user: {
                            select: {
                                username: true,
                                profile: {
                                    select: {
                                        displayName: true,
                                        avatarUrl: true,
                                    },
                                },
                            },
                        },
                    },
                },
                post: postId
                    ? {
                        select: {
                            id: true,
                            content: true,
                            mediaUrl: true,
                        },
                    }
                    : undefined,
            },
        });
        try {
            const paymentIntent = await this.processStripePayment(amount, senderId, paymentMethodId, {
                tipId: tip.id,
                recipientId,
                postId,
            });
            await this.prisma.tip.update({
                where: { id: tip.id },
                data: {
                    stripePaymentIntentId: paymentIntent.id,
                    status: 'PROCESSING',
                },
            });
            if (paymentIntent.status === 'succeeded') {
                await this.completeTip(tip.id);
            }
            this.logger.log(`Tip created: ${amount} from ${senderId} to ${recipientId}`);
            return tip;
        }
        catch (error) {
            await this.prisma.tip.update({
                where: { id: tip.id },
                data: { status: 'FAILED' },
            });
            throw error;
        }
    }
    async processStripePayment(amount, userId, paymentMethodId, metadata) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const amountInCents = Math.round(amount * 100);
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await this.stripe.customers.create({
                email: user.email,
                metadata: { userId: user.id },
            });
            customerId = customer.id;
            await this.prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId: customerId },
            });
        }
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            customer: customerId,
            payment_method: paymentMethodId,
            confirm: !!paymentMethodId,
            metadata: {
                ...metadata,
                userId,
            },
            description: `Tip to creator`,
        });
        return paymentIntent;
    }
    async completeTip(tipId) {
        const tip = await this.prisma.tip.findUnique({
            where: { id: tipId },
        });
        if (!tip) {
            throw new common_1.NotFoundException('Tip not found');
        }
        if (tip.status === 'COMPLETED') {
            return tip;
        }
        const platformFee = tip.amount * 0.05;
        const netAmount = tip.amount - platformFee;
        await this.prisma.$transaction(async (tx) => {
            await tx.tip.update({
                where: { id: tipId },
                data: { status: 'COMPLETED', completedAt: new Date() },
            });
            await this.transactionService.recordTipTransaction(tip.senderId, tip.recipientId, tip.amount, tipId);
            await tx.wallet.upsert({
                where: { userId: tip.recipientId },
                create: {
                    userId: tip.recipientId,
                    balance: netAmount,
                    currency: 'USD',
                },
                update: {
                    balance: {
                        increment: netAmount,
                    },
                },
            });
            await tx.notification.create({
                data: {
                    userId: tip.recipientId,
                    type: 'TIP_RECEIVED',
                    title: 'You received a tip!',
                    message: tip.message || `Someone tipped you $${tip.amount.toFixed(2)}`,
                    referenceId: tipId,
                    referenceType: 'TIP',
                },
            });
        });
        this.logger.log(`Tip completed: ${tipId}`);
        return this.prisma.tip.findUnique({
            where: { id: tipId },
            include: {
                sender: {
                    select: {
                        user: {
                            select: {
                                username: true,
                                profile: { select: { displayName: true, avatarUrl: true } },
                            },
                        },
                    },
                },
                recipient: {
                    select: {
                        user: {
                            select: {
                                username: true,
                                profile: { select: { displayName: true, avatarUrl: true } },
                            },
                        },
                    },
                },
            },
        });
    }
    async getTips(userId, query) {
        const { type, postId, page = 1, limit = 20 } = query;
        const where = {};
        if (type === 'sent') {
            where.senderId = userId;
        }
        else if (type === 'received') {
            where.recipientId = userId;
        }
        else {
            where.OR = [{ senderId: userId }, { recipientId: userId }];
        }
        if (postId) {
            where.postId = postId;
        }
        const [tips, total] = await Promise.all([
            this.prisma.tip.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    sender: {
                        select: {
                            user: {
                                select: {
                                    username: true,
                                    profile: {
                                        select: {
                                            displayName: true,
                                            avatarUrl: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    recipient: {
                        select: {
                            user: {
                                select: {
                                    username: true,
                                    profile: {
                                        select: {
                                            displayName: true,
                                            avatarUrl: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    post: {
                        select: {
                            id: true,
                            content: true,
                            thumbnailUrl: true,
                        },
                    },
                },
            }),
            this.prisma.tip.count({ where }),
        ]);
        return {
            tips,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getTipStats(userId, startDate, endDate) {
        const where = {
            status: 'COMPLETED',
        };
        if (startDate || endDate) {
            where.completedAt = {};
            if (startDate)
                where.completedAt.gte = startDate;
            if (endDate)
                where.completedAt.lte = endDate;
        }
        const [received, sent] = await Promise.all([
            this.prisma.tip.aggregate({
                where: { ...where, recipientId: userId },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.tip.aggregate({
                where: { ...where, senderId: userId },
                _sum: { amount: true },
                _count: true,
            }),
        ]);
        const topTipperData = await this.prisma.tip.groupBy({
            by: ['senderId'],
            where: { ...where, recipientId: userId },
            _sum: { amount: true },
            orderBy: { _sum: { amount: 'desc' } },
            take: 1,
        });
        let topTipper = null;
        if (topTipperData.length > 0) {
            const topTipperUser = await this.prisma.user.findUnique({
                where: { id: topTipperData[0].senderId },
                select: {
                    id: true,
                    profile: {
                        select: { username: true, displayName: true, avatarUrl: true },
                    },
                },
            });
            topTipper = {
                user: topTipperUser,
                totalTipped: topTipperData[0]._sum.amount || 0,
            };
        }
        const totalReceived = received._sum.amount || 0;
        const totalSent = sent._sum.amount || 0;
        const tipsReceivedCount = received._count;
        const tipsSentCount = sent._count;
        return {
            totalReceived: parseFloat(totalReceived.toFixed(2)),
            totalSent: parseFloat(totalSent.toFixed(2)),
            tipsReceivedCount,
            tipsSentCount,
            topTipper,
            averageTipReceived: tipsReceivedCount > 0
                ? parseFloat((totalReceived / tipsReceivedCount).toFixed(2))
                : 0,
            averageTipSent: tipsSentCount > 0
                ? parseFloat((totalSent / tipsSentCount).toFixed(2))
                : 0,
        };
    }
    async refundTip(tipId, reason) {
        const tip = await this.prisma.tip.findUnique({
            where: { id: tipId },
        });
        if (!tip) {
            throw new common_1.NotFoundException('Tip not found');
        }
        if (tip.status !== 'COMPLETED') {
            throw new common_1.BadRequestException('Can only refund completed tips');
        }
        if (tip.stripePaymentIntentId) {
            try {
                await this.stripe.refunds.create({
                    payment_intent: tip.stripePaymentIntentId,
                    reason: 'requested_by_customer',
                });
            }
            catch (error) {
                this.logger.error(`Stripe refund failed: ${error.message}`);
            }
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.tip.update({
                where: { id: tipId },
                data: { status: 'REFUNDED', refundReason: reason },
            });
            const platformFee = tip.amount * 0.05;
            const netAmount = tip.amount - platformFee;
            const wallet = await tx.wallet.update({
                where: { userId: tip.recipientId },
                data: {
                    balance: {
                        decrement: netAmount,
                    },
                },
            });
            await tx.transaction.create({
                data: {
                    user: { connect: { id: tip.recipientId } },
                    wallet: { connect: { id: wallet.id } },
                    type: client_1.TransactionType.REFUND,
                    amount: -netAmount,
                    description: `Tip refund: ${reason}`,
                    referenceId: tipId,
                    referenceType: 'REFUND',
                },
            });
        });
        this.logger.log(`Tip refunded: ${tipId} - ${reason}`);
        return tip;
    }
};
exports.TipService = TipService;
exports.TipService = TipService = TipService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_service_1.WalletService,
        transaction_service_1.TransactionService])
], TipService);
//# sourceMappingURL=tip.service.js.map