import { PrismaService } from '../../prisma/prisma.service';
import { TransactionType } from '../dto/wallet.dto';
export declare class TransactionService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private recordTransaction;
    recordTipTransaction(senderId: string, recipientId: string, amount: number, tipId: string): Promise<void>;
    recordPayoutTransaction(userId: string, amount: number, payoutId: string): Promise<void>;
    getUserTransactions(userId: string, filters: {
        type?: TransactionType;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        transactions: any[];
        total: number;
    }>;
    verifyWalletIntegrity(userId: string): Promise<{
        valid: boolean;
        reason: string;
        walletBalance?: undefined;
        computedBalance?: undefined;
        difference?: undefined;
    } | {
        valid: boolean;
        walletBalance: number;
        computedBalance: number;
        difference: number;
        reason?: undefined;
    }>;
    getFinancialSummary(userId: string, start: Date, end: Date): Promise<{
        totalIn: number;
        totalOut: number;
        net: number;
        count: number;
        start: Date;
        end: Date;
    }>;
}
