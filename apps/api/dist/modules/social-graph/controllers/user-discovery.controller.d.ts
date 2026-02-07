import { UserDiscoveryService } from '../services/user-discovery.service';
import { SearchUsersDto, GetRecommendedUsersDto, GetTrendingCreatorsDto, SimilarUsersDto } from '../dto/discovery.dto';
export declare class UserDiscoveryController {
    private readonly discoveryService;
    constructor(discoveryService: UserDiscoveryService);
    searchUsers(req: any, dto: SearchUsersDto): Promise<{
        users: any;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getRecommendedUsers(req: any, dto: GetRecommendedUsersDto): Promise<{
        recommendations: any[];
        context: "general" | "similar_interests" | "mutual_connections" | "trending";
    }>;
    getTrendingCreators(dto: GetTrendingCreatorsDto): Promise<{
        creators: any;
        timeframe: "day" | "week" | "month";
        category: string;
    }>;
    getSimilarUsers(req: any, dto: SimilarUsersDto): Promise<any[]>;
}
