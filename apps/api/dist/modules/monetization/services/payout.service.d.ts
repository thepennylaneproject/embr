import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from './wallet.service';
import { TransactionService } from './transaction.service';
import { CreatePayoutRequestDto, ApprovePayoutDto, GetPayoutsQueryDto } from '../dto/payout.dto';
export declare class PayoutService {
    private prisma;
    private walletService;
    private transactionService;
    private readonly logger;
    private stripe;
    constructor(prisma: PrismaService, walletService: WalletService, transactionService: TransactionService);
    createPayoutRequest(userId: string, dto: CreatePayoutRequestDto): Promise<any>;
    approvePayout(adminId: string, dto: ApprovePayoutDto): Promise<any>;
    private processStripePayout;
    completePayout(stripePayoutId: string): Promise<any>;
    getPayouts(userId: string, query: GetPayoutsQueryDto): Promise<{
        payouts: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getPendingPayouts(): Promise<any[]>;
    getPayoutStats(userId: string): Promise<{
        totalPayouts: number;
        totalAmount: number;
        pendingAmount: number;
        lastPayoutDate?: Date;
    }>;
    private createAdminNotification;
}
