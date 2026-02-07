import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from './wallet.service';
import { TransactionService } from './transaction.service';
import { CreateTipDto, GetTipsQueryDto } from '../dto/tip.dto';
export declare class TipService {
    private prisma;
    private walletService;
    private transactionService;
    private readonly logger;
    private stripe;
    constructor(prisma: PrismaService, walletService: WalletService, transactionService: TransactionService);
    createTip(senderId: string, dto: CreateTipDto): Promise<any>;
    private processStripePayment;
    completeTip(tipId: string): Promise<any>;
    getTips(userId: string, query: GetTipsQueryDto): Promise<{
        tips: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getTipStats(userId: string, startDate?: Date, endDate?: Date): Promise<{
        totalReceived: number;
        totalSent: number;
        tipsReceivedCount: number;
        tipsSentCount: number;
        topTipper?: any;
        averageTipReceived: number;
        averageTipSent: number;
    }>;
    refundTip(tipId: string, reason: string): Promise<any>;
}
