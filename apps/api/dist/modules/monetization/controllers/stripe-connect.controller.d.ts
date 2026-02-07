import { StripeConnectService } from '../services/stripe-connect.service';
import { CreateStripeConnectAccountDto, GetStripeAccountLinkDto } from '../dto/wallet.dto';
export declare class StripeConnectController {
    private stripeConnectService;
    constructor(stripeConnectService: StripeConnectService);
    createAccount(req: any, dto: CreateStripeConnectAccountDto): Promise<{
        accountId: string;
        onboardingUrl: string;
    }>;
    getAccountStatus(req: any): Promise<{
        hasAccount: boolean;
        isOnboarded: boolean;
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
        requiresAction: boolean;
        accountId?: string;
    }>;
    getAccountDetails(req: any): Promise<any>;
    getAccountLink(req: any, dto: GetStripeAccountLinkDto): Promise<{
        url: string;
    }>;
    completeOnboarding(req: any): Promise<any>;
    deleteAccount(req: any): Promise<void>;
}
