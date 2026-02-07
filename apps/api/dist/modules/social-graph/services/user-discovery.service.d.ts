import { PrismaService } from '../../prisma/prisma.service';
import { SearchUsersDto, GetRecommendedUsersDto, GetTrendingCreatorsDto, SimilarUsersDto } from '../dto/discovery.dto';
export declare class UserDiscoveryService {
    private prisma;
    constructor(prisma: PrismaService);
    searchUsers(currentUserId: string | null, dto: SearchUsersDto): Promise<{
        users: any;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    private calculateUserRelevanceScore;
    getRecommendedUsers(userId: string, dto: GetRecommendedUsersDto): Promise<{
        recommendations: any[];
        context: "general" | "similar_interests" | "mutual_connections" | "trending";
    }>;
    private getSimilarInterestUsers;
    private getMutualConnectionUsers;
    private getTrendingUsers;
    private getGeneralRecommendations;
    getTrendingCreators(dto: GetTrendingCreatorsDto): Promise<{
        creators: any;
        timeframe: "day" | "week" | "month";
        category: string;
    }>;
    getSimilarUsers(userId: string, dto: SimilarUsersDto): Promise<any[]>;
}
