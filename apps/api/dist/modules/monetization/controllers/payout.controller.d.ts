import { PayoutService } from '../services/payout.service';
import { CreatePayoutRequestDto, ApprovePayoutDto, GetPayoutsQueryDto } from '../dto/payout.dto';
export declare class PayoutController {
    private payoutService;
    constructor(payoutService: PayoutService);
    createPayoutRequest(req: any, dto: CreatePayoutRequestDto): Promise<any>;
    getPayouts(req: any, query: GetPayoutsQueryDto): Promise<{
        payouts: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getPayoutStats(req: any): Promise<{
        totalPayouts: number;
        totalAmount: number;
        pendingAmount: number;
        lastPayoutDate?: Date;
    }>;
    getPendingPayouts(): Promise<any[]>;
    approvePayout(req: any, id: string, dto: Partial<ApprovePayoutDto>): Promise<any>;
    rejectPayout(req: any, id: string, reason?: string): Promise<any>;
    getPayout(req: any, id: string): Promise<{
        id: string;
    }>;
}
