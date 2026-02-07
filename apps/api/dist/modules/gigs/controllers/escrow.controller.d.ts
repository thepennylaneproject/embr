import { EscrowService } from '../services/escrow.service';
import { FundEscrowDto, ReleaseMilestoneDto } from '../dto/gig.dto';
import { Escrow, GigMilestone } from '../../../shared/types/gig.types';
export declare class EscrowController {
    private readonly escrowService;
    constructor(escrowService: EscrowService);
    getByApplication(applicationId: string): Promise<Escrow | null>;
    findOne(id: string): Promise<Escrow>;
    fund(req: any, id: string, fundEscrowDto: FundEscrowDto): Promise<Escrow>;
    releaseMilestone(req: any, id: string, releaseMilestoneDto: ReleaseMilestoneDto): Promise<{
        escrow: Escrow;
        milestone: GigMilestone;
    }>;
    getReleasedAmount(id: string): Promise<{
        amount: number;
    }>;
}
export declare class MilestonesController {
    private readonly escrowService;
    constructor(escrowService: EscrowService);
    getMilestones(applicationId: string): Promise<GigMilestone[]>;
    submit(req: any, id: string): Promise<GigMilestone>;
    approve(req: any, id: string, feedback?: string): Promise<GigMilestone>;
    reject(req: any, id: string, feedback: string): Promise<GigMilestone>;
}
