import { TipService } from '../services/tip.service';
import { CreateTipDto, GetTipsQueryDto } from '../dto/tip.dto';
export declare class TipController {
    private tipService;
    constructor(tipService: TipService);
    createTip(req: any, dto: CreateTipDto): Promise<any>;
    getTips(req: any, query: GetTipsQueryDto): Promise<{
        tips: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getTipStats(req: any, startDate?: string, endDate?: string): Promise<{
        totalReceived: number;
        totalSent: number;
        tipsReceivedCount: number;
        tipsSentCount: number;
        topTipper?: any;
        averageTipReceived: number;
        averageTipSent: number;
    }>;
    getTip(id: string): Promise<{
        id: string;
    }>;
    refundTip(id: string, reason: string): Promise<any>;
    getTipsByPost(postId: string, query: GetTipsQueryDto): Promise<{
        tips: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getTipsReceivedByUser(userId: string, query: GetTipsQueryDto): Promise<{
        tips: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
}
