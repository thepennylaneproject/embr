import { ApplicationsService } from '../services/applications.service';
import { CreateApplicationDto } from '../dto/gig.dto';
import { Application, PaginatedApplications, ApplicationWithDetails } from '../../../shared/types/gig.types';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    create(req: any, createApplicationDto: CreateApplicationDto): Promise<Application>;
    getMyApplications(req: any, page?: number, limit?: number): Promise<PaginatedApplications>;
    getGigApplications(req: any, gigId: string, page?: number, limit?: number): Promise<PaginatedApplications>;
    getStats(req: any): Promise<{
        totalApplications: number;
        pending: number;
        accepted: number;
        rejected: number;
        withdrawn: number;
    }>;
    findOne(id: string): Promise<ApplicationWithDetails>;
    accept(req: any, id: string): Promise<Application>;
    reject(req: any, id: string): Promise<Application>;
    withdraw(req: any, id: string): Promise<Application>;
}
