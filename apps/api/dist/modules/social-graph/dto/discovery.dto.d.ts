export declare enum UserSearchSortBy {
    RELEVANCE = "relevance",
    FOLLOWERS = "followers",
    RECENT = "recent",
    ENGAGEMENT = "engagement"
}
export declare enum AvailabilityFilter {
    AVAILABLE = "available",
    BUSY = "busy",
    ANY = "any"
}
export declare class SearchUsersDto {
    query?: string;
    location?: string;
    skills?: string[];
    availability?: AvailabilityFilter;
    verified?: boolean;
    sortBy?: UserSearchSortBy;
    page?: number;
    limit?: number;
}
export declare class GetRecommendedUsersDto {
    limit?: number;
    context?: 'general' | 'similar_interests' | 'mutual_connections' | 'trending';
}
export declare class GetTrendingCreatorsDto {
    timeframe?: 'day' | 'week' | 'month';
    category?: string;
    limit?: number;
}
export declare class SimilarUsersDto {
    limit?: number;
}
