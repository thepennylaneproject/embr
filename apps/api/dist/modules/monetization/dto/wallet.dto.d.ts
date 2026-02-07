export declare enum TransactionType {
    TIP = "TIP",
    GIG_PAYMENT = "GIG_PAYMENT",
    GIG_REFUND = "GIG_REFUND",
    WITHDRAWAL = "WITHDRAWAL",
    DEPOSIT = "DEPOSIT",
    REFERRAL_REWARD = "REFERRAL_REWARD",
    SUBSCRIPTION = "SUBSCRIPTION",
    AD_PAYMENT = "AD_PAYMENT",
    PLATFORM_FEE = "PLATFORM_FEE"
}
export declare class GetTransactionsQueryDto {
    type?: TransactionType;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
export declare class CreateStripeConnectAccountDto {
    country: string;
    email: string;
    agreesToTerms?: boolean;
}
export declare class CompleteStripeOnboardingDto {
    accountId: string;
}
export declare class GetStripeAccountLinkDto {
    refreshUrl: string;
    returnUrl: string;
}
export declare class WalletBalanceDto {
    available: number;
    pending: number;
    total: number;
    currency: string;
}
