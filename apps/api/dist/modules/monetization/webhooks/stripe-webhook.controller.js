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
var StripeWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookController = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = require("stripe");
const tip_service_1 = require("../services/tip.service");
const payout_service_1 = require("../services/payout.service");
const stripe_connect_service_1 = require("../services/stripe-connect.service");
let StripeWebhookController = StripeWebhookController_1 = class StripeWebhookController {
    constructor(tipService, payoutService, stripeConnectService) {
        this.tipService = tipService;
        this.payoutService = payoutService;
        this.stripeConnectService = stripeConnectService;
        this.logger = new common_1.Logger(StripeWebhookController_1.name);
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
    }
    async handleWebhook(rawBody, signature) {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            this.logger.error('Stripe webhook secret not configured');
            throw new common_1.BadRequestException('Webhook secret not configured');
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        }
        catch (error) {
            this.logger.error(`Webhook signature verification failed: ${error.message}`);
            throw new common_1.BadRequestException('Invalid signature');
        }
        this.logger.log(`Received webhook: ${event.type}`);
        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentIntentSucceeded(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentIntentFailed(event.data.object);
                    break;
                case 'payout.paid':
                    await this.handlePayoutPaid(event.data.object);
                    break;
                case 'payout.failed':
                    await this.handlePayoutFailed(event.data.object);
                    break;
                case 'account.updated':
                    await this.handleAccountUpdated(event.data.object);
                    break;
                default:
                    this.logger.log(`Unhandled event type: ${event.type}`);
            }
            return { received: true };
        }
        catch (error) {
            this.logger.error(`Error processing webhook: ${error.message}`);
            throw error;
        }
    }
    async handlePaymentIntentSucceeded(paymentIntent) {
        const tipId = paymentIntent.metadata?.tipId;
        if (!tipId) {
            this.logger.warn('Payment intent has no tipId in metadata');
            return;
        }
        this.logger.log(`Payment succeeded for tip: ${tipId}`);
        try {
            await this.tipService.completeTip(tipId);
        }
        catch (error) {
            this.logger.error(`Failed to complete tip ${tipId}: ${error.message}`);
        }
    }
    async handlePaymentIntentFailed(paymentIntent) {
        const tipId = paymentIntent.metadata?.tipId;
        if (!tipId) {
            return;
        }
        this.logger.error(`Payment failed for tip: ${tipId}`);
    }
    async handlePayoutPaid(payout) {
        this.logger.log(`Payout completed: ${payout.id}`);
        try {
            await this.payoutService.completePayout(payout.id);
        }
        catch (error) {
            this.logger.error(`Failed to complete payout ${payout.id}: ${error.message}`);
        }
    }
    async handlePayoutFailed(payout) {
        this.logger.error(`Payout failed: ${payout.id}`);
    }
    async handleAccountUpdated(account) {
        this.logger.log(`Account updated: ${account.id}`);
        try {
            await this.stripeConnectService.handleAccountUpdate(account.id);
        }
        catch (error) {
            this.logger.error(`Failed to handle account update ${account.id}: ${error.message}`);
        }
    }
};
exports.StripeWebhookController = StripeWebhookController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Buffer, String]),
    __metadata("design:returntype", Promise)
], StripeWebhookController.prototype, "handleWebhook", null);
exports.StripeWebhookController = StripeWebhookController = StripeWebhookController_1 = __decorate([
    (0, common_1.Controller)('webhooks/stripe'),
    __metadata("design:paramtypes", [tip_service_1.TipService,
        payout_service_1.PayoutService,
        stripe_connect_service_1.StripeConnectService])
], StripeWebhookController);
//# sourceMappingURL=stripe-webhook.controller.js.map