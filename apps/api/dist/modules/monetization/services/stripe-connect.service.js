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
var StripeConnectService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeConnectService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const stripe_1 = require("stripe");
let StripeConnectService = StripeConnectService_1 = class StripeConnectService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(StripeConnectService_1.name);
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
    }
    async createConnectAccount(userId, dto) {
        const { country, email } = dto;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { wallet: true, profile: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.wallet?.stripeConnectAccountId) {
            const account = await this.stripe.accounts.retrieve(user.wallet.stripeConnectAccountId);
            if (!account.details_submitted) {
                const accountLink = await this.createAccountLink(user.wallet.stripeConnectAccountId, `${process.env.FRONTEND_URL}/settings/payouts`, `${process.env.FRONTEND_URL}/settings/payouts/refresh`);
                return {
                    accountId: user.wallet.stripeConnectAccountId,
                    onboardingUrl: accountLink.url,
                };
            }
            return {
                accountId: user.wallet.stripeConnectAccountId,
                onboardingUrl: '',
            };
        }
        try {
            const account = await this.stripe.accounts.create({
                type: 'express',
                country,
                email: email || user.email,
                business_type: 'individual',
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    userId: user.id,
                    username: user.profile?.username || '',
                },
            });
            await this.prisma.wallet.upsert({
                where: { userId },
                create: {
                    userId,
                    stripeConnectAccountId: account.id,
                    payoutsEnabled: false,
                },
                update: {
                    stripeConnectAccountId: account.id,
                },
            });
            const accountLink = await this.createAccountLink(account.id, `${process.env.FRONTEND_URL}/settings/payouts`, `${process.env.FRONTEND_URL}/settings/payouts/refresh`);
            this.logger.log(`Stripe Connect account created for user ${userId}: ${account.id}`);
            return {
                accountId: account.id,
                onboardingUrl: accountLink.url,
            };
        }
        catch (error) {
            this.logger.error(`Failed to create Stripe Connect account: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to create payment account: ${error.message}`);
        }
    }
    async createAccountLink(accountId, returnUrl, refreshUrl) {
        return this.stripe.accountLinks.create({
            account: accountId,
            refresh_url: refreshUrl,
            return_url: returnUrl,
            type: 'account_onboarding',
        });
    }
    async getAccountLink(userId, dto) {
        const { returnUrl, refreshUrl } = dto;
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });
        if (!wallet?.stripeConnectAccountId) {
            throw new common_1.NotFoundException('No Stripe Connect account found');
        }
        const accountLink = await this.createAccountLink(wallet.stripeConnectAccountId, returnUrl, refreshUrl);
        return { url: accountLink.url };
    }
    async completeOnboarding(userId) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });
        if (!wallet?.stripeConnectAccountId) {
            throw new common_1.NotFoundException('No Stripe Connect account found');
        }
        const account = await this.stripe.accounts.retrieve(wallet.stripeConnectAccountId);
        const isComplete = account.details_submitted;
        const chargesEnabled = account.charges_enabled;
        const payoutsEnabled = account.payouts_enabled;
        await this.prisma.wallet.update({
            where: { userId },
            data: {
                onboardingCompleted: isComplete,
                chargesEnabled,
                payoutsEnabled,
            },
        });
        this.logger.log(`Onboarding ${isComplete ? 'completed' : 'pending'} for user ${userId}`);
        return {
            isComplete,
            chargesEnabled,
            payoutsEnabled,
            requiresAction: !isComplete,
        };
    }
    async getAccountStatus(userId) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });
        if (!wallet?.stripeConnectAccountId) {
            return {
                hasAccount: false,
                isOnboarded: false,
                chargesEnabled: false,
                payoutsEnabled: false,
                requiresAction: true,
            };
        }
        try {
            const account = await this.stripe.accounts.retrieve(wallet.stripeConnectAccountId);
            const isOnboarded = account.details_submitted || false;
            const chargesEnabled = account.charges_enabled || false;
            const payoutsEnabled = account.payouts_enabled || false;
            const requiresAction = !isOnboarded ||
                !chargesEnabled ||
                !payoutsEnabled ||
                (account.requirements?.currently_due?.length || 0) > 0;
            return {
                hasAccount: true,
                isOnboarded,
                chargesEnabled,
                payoutsEnabled,
                requiresAction,
                accountId: wallet.stripeConnectAccountId,
            };
        }
        catch (error) {
            this.logger.error(`Failed to retrieve Stripe account status: ${error.message}`);
            return {
                hasAccount: true,
                isOnboarded: false,
                chargesEnabled: false,
                payoutsEnabled: false,
                requiresAction: true,
                accountId: wallet.stripeConnectAccountId,
            };
        }
    }
    async getAccountDetails(userId) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });
        if (!wallet?.stripeConnectAccountId) {
            throw new common_1.NotFoundException('No Stripe Connect account found');
        }
        const account = await this.stripe.accounts.retrieve(wallet.stripeConnectAccountId);
        return {
            id: account.id,
            email: account.email,
            country: account.country,
            defaultCurrency: account.default_currency,
            detailsSubmitted: account.details_submitted,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            requirements: {
                currentlyDue: account.requirements?.currently_due || [],
                eventuallyDue: account.requirements?.eventually_due || [],
                pendingVerification: account.requirements?.pending_verification || [],
            },
            externalAccounts: account.external_accounts?.data.map((acc) => ({
                id: acc.id,
                object: acc.object,
                last4: acc.last4,
                bankName: acc.bank_name,
                country: acc.country,
                currency: acc.currency,
            })),
        };
    }
    async deleteAccount(userId) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });
        if (!wallet?.stripeConnectAccountId) {
            throw new common_1.NotFoundException('No Stripe Connect account found');
        }
        try {
            await this.stripe.accounts.del(wallet.stripeConnectAccountId);
            await this.prisma.wallet.update({
                where: { userId },
                data: {
                    stripeConnectAccountId: null,
                    onboardingCompleted: false,
                    chargesEnabled: false,
                    payoutsEnabled: false,
                },
            });
            this.logger.log(`Stripe Connect account deleted for user ${userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete Stripe Connect account: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to delete payment account: ${error.message}`);
        }
    }
    async handleAccountUpdate(accountId) {
        const wallet = await this.prisma.wallet.findFirst({
            where: { stripeConnectAccountId: accountId },
        });
        if (!wallet) {
            this.logger.warn(`No wallet record found for account ${accountId}`);
            return;
        }
        const account = await this.stripe.accounts.retrieve(accountId);
        await this.prisma.wallet.update({
            where: { id: wallet.id },
            data: {
                onboardingCompleted: account.details_submitted,
                chargesEnabled: account.charges_enabled,
                payoutsEnabled: account.payouts_enabled,
            },
        });
        if (account.details_submitted && !wallet.onboardingCompleted) {
            await this.prisma.notification.create({
                data: {
                    userId: wallet.userId,
                    type: 'STRIPE_ONBOARDING_COMPLETE',
                    title: 'Payment account ready',
                    message: 'Your payment account is now active. You can receive payouts!',
                    referenceId: accountId,
                    referenceType: 'PAYMENT',
                },
            });
        }
        this.logger.log(`Account updated: ${accountId}`);
    }
};
exports.StripeConnectService = StripeConnectService;
exports.StripeConnectService = StripeConnectService = StripeConnectService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StripeConnectService);
//# sourceMappingURL=stripe-connect.service.js.map