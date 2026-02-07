export declare enum PayoutStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    REJECTED = "REJECTED",
    FAILED = "FAILED"
}
export declare class CreatePayoutRequestDto {
    amount: number;
    note?: string;
}
export declare class ApprovePayoutDto {
    payoutRequestId: string;
    approve?: boolean;
    rejectionReason?: string;
}
export declare class GetPayoutsQueryDto {
    status?: PayoutStatus;
    userId?: string;
    page?: number;
    limit?: number;
}
export declare class ProcessPayoutDto {
    payoutId: string;
    stripePayoutId: string;
}
