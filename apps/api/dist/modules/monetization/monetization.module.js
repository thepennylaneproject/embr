"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonetizationModule = void 0;
const common_1 = require("@nestjs/common");
const wallet_controller_1 = require("./controllers/wallet.controller");
const tip_controller_1 = require("./controllers/tip.controller");
const payout_controller_1 = require("./controllers/payout.controller");
const stripe_connect_controller_1 = require("./controllers/stripe-connect.controller");
const stripe_webhook_controller_1 = require("./webhooks/stripe-webhook.controller");
const wallet_service_1 = require("./services/wallet.service");
const tip_service_1 = require("./services/tip.service");
const payout_service_1 = require("./services/payout.service");
const stripe_connect_service_1 = require("./services/stripe-connect.service");
const transaction_service_1 = require("./services/transaction.service");
let MonetizationModule = class MonetizationModule {
};
exports.MonetizationModule = MonetizationModule;
exports.MonetizationModule = MonetizationModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            wallet_controller_1.WalletController,
            tip_controller_1.TipController,
            payout_controller_1.PayoutController,
            stripe_connect_controller_1.StripeConnectController,
            stripe_webhook_controller_1.StripeWebhookController,
        ],
        providers: [
            wallet_service_1.WalletService,
            tip_service_1.TipService,
            payout_service_1.PayoutService,
            stripe_connect_service_1.StripeConnectService,
            transaction_service_1.TransactionService,
        ],
        exports: [
            wallet_service_1.WalletService,
            tip_service_1.TipService,
            payout_service_1.PayoutService,
            stripe_connect_service_1.StripeConnectService,
            transaction_service_1.TransactionService,
        ],
    })
], MonetizationModule);
//# sourceMappingURL=monetization.module.js.map