import { WalletService } from '../services/wallet.service';
import { TransactionService } from '../services/transaction.service';
import { GetTransactionsQueryDto } from '../dto/wallet.dto';
export declare class WalletController {
    private walletService;
    private transactionService;
    constructor(walletService: WalletService, transactionService: TransactionService);
    getWallet(req: any): Promise<any>;
    getBalance(req: any): Promise<import("../dto/wallet.dto").WalletBalanceDto>;
    getStats(req: any): Promise<{
        totalReceived: number;
        totalSent: number;
        totalPayouts: number;
        numberOfTips: number;
        averageTipReceived: number;
    }>;
    getTransactions(req: any, query: GetTransactionsQueryDto): Promise<{
        transactions: any[];
        total: number;
    }>;
    verifyIntegrity(req: any): Promise<{
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
    getFinancialSummary(req: any, startDate: string, endDate: string): Promise<{
        totalIn: number;
        totalOut: number;
        net: number;
        count: number;
        start: Date;
        end: Date;
    }>;
    getTopEarners(limit?: number, period?: 'day' | 'week' | 'month' | 'all'): Promise<any[]>;
    addFunds(req: any, amount: number, reason: string): Promise<any>;
}
