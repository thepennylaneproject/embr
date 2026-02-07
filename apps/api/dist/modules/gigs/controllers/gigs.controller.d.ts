import { GigsService } from '../services/gigs.service';
import { CreateGigDto, UpdateGigDto, GigSearchDto } from '../dto/gig.dto';
import { Gig, PaginatedGigs, GigWithDetails, GigStats } from '../../../shared/types/gig.types';
export declare class GigsController {
    private readonly gigsService;
    constructor(gigsService: GigsService);
    create(req: any, createGigDto: CreateGigDto): Promise<Gig>;
    publish(req: any, id: string): Promise<Gig>;
    findAll(searchDto: GigSearchDto): Promise<PaginatedGigs>;
    getMyGigs(req: any, page?: number, limit?: number): Promise<PaginatedGigs>;
    getRecommended(req: any, limit?: number): Promise<Gig[]>;
    getStats(req: any): Promise<GigStats>;
    findOne(id: string): Promise<GigWithDetails>;
    findByCreator(creatorId: string, page?: number, limit?: number): Promise<PaginatedGigs>;
    update(req: any, id: string, updateGigDto: UpdateGigDto): Promise<Gig>;
    cancel(req: any, id: string): Promise<Gig>;
    complete(req: any, id: string): Promise<Gig>;
    remove(req: any, id: string): Promise<void>;
}
