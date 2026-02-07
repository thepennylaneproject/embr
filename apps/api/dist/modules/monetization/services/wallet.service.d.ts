import { PrismaService } from '../../prisma/prisma.service';
import { TransactionService } from './transaction.service';
import { WalletBalanceDto } from '../dto/wallet.dto';
export declare class WalletService {
    private prisma;
    private transactionService;
    private readonly logger;
    constructor(prisma: PrismaService, transactionService: TransactionService);
    createWallet(userId: string): Promise<any>;
    getWallet(userId: string): Promise<any>;
    getWalletBalance(userId: string): Promise<WalletBalanceDto>;
    hasSufficientBalance(userId: string, amount: number): Promise<boolean>;
    addFunds(userId: string, amount: number, reason: string): Promise<any>;
    deductFunds(userId: string, amount: number, reason: string): Promise<any>;
    getWalletStats(userId: string): Promise<{
        totalReceived: number;
        totalSent: number;
        totalPayouts: number;
        numberOfTips: number;
        averageTipReceived: number;
    }>;
    getTopEarners(limit?: number, period?: 'day' | 'week' | 'month' | 'all'): Promise<any[]>;
}
