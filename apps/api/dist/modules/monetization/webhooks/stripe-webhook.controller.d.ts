import { TipService } from '../services/tip.service';
import { PayoutService } from '../services/payout.service';
import { StripeConnectService } from '../services/stripe-connect.service';
export declare class StripeWebhookController {
    private tipService;
    private payoutService;
    private stripeConnectService;
    private readonly logger;
    private stripe;
    constructor(tipService: TipService, payoutService: PayoutService, stripeConnectService: StripeConnectService);
    handleWebhook(rawBody: Buffer, signature: string): Promise<{
        received: boolean;
    }>;
    private handlePaymentIntentSucceeded;
    private handlePaymentIntentFailed;
    private handlePayoutPaid;
    private handlePayoutFailed;
    private handleAccountUpdated;
}
