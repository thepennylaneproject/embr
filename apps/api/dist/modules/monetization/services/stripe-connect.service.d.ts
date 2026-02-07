import { PrismaService } from '../../prisma/prisma.service';
import { CreateStripeConnectAccountDto, GetStripeAccountLinkDto } from '../dto/wallet.dto';
export declare class StripeConnectService {
    private prisma;
    private readonly logger;
    private stripe;
    constructor(prisma: PrismaService);
    createConnectAccount(userId: string, dto: CreateStripeConnectAccountDto): Promise<{
        accountId: string;
        onboardingUrl: string;
    }>;
    private createAccountLink;
    getAccountLink(userId: string, dto: GetStripeAccountLinkDto): Promise<{
        url: string;
    }>;
    completeOnboarding(userId: string): Promise<any>;
    getAccountStatus(userId: string): Promise<{
        hasAccount: boolean;
        isOnboarded: boolean;
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
        requiresAction: boolean;
        accountId?: string;
    }>;
    getAccountDetails(userId: string): Promise<any>;
    deleteAccount(userId: string): Promise<void>;
    handleAccountUpdate(accountId: string): Promise<void>;
}
