export declare enum TipAmountPreset {
    SMALL = "SMALL",
    MEDIUM = "MEDIUM",
    LARGE = "LARGE",
    CUSTOM = "CUSTOM"
}
export declare class CreateTipDto {
    recipientId: string;
    postId?: string;
    amount: number;
    preset?: TipAmountPreset;
    message?: string;
    paymentMethodId?: string;
}
export declare class GetTipsQueryDto {
    type?: 'sent' | 'received';
    userId?: string;
    postId?: string;
    page?: number;
    limit?: number;
}
export declare class TipStatsDto {
    userId: string;
    startDate?: string;
    endDate?: string;
}
