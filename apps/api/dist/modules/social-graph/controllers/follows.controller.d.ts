import { FollowsService } from '../services/follows.service';
import { FollowUserDto, GetFollowersDto, GetFollowingDto, CheckFollowDto, GetMutualConnectionsDto, BatchFollowCheckDto } from '../dto/follow.dto';
export declare class FollowsController {
    private readonly followsService;
    constructor(followsService: FollowsService);
    followUser(req: any, dto: FollowUserDto): Promise<{
        id: string;
        followerId: string;
        followingId: string;
        createdAt: Date;
        user: {
            id: string;
            username: string;
            profile: {
                username: string;
                id: string;
                isVerified: boolean;
                createdAt: Date;
                updatedAt: Date;
                displayName: string;
                bio: string | null;
                avatarUrl: string | null;
                bannerUrl: string | null;
                location: string | null;
                website: string | null;
                socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
                availability: string | null;
                skills: string[];
                categories: string[];
                isCreator: boolean;
                isPrivate: boolean;
                allowTips: boolean;
                notificationPreference: string;
                followerCount: number;
                followingCount: number;
                postCount: number;
                userId: string;
            };
        };
    }>;
    unfollowUser(req: any, userId: string): Promise<{
        message: string;
    }>;
    getFollowers(userId: string, dto: GetFollowersDto): Promise<{
        followers: {
            id: string;
            username: string;
            email: string;
            profile: {
                username: string;
                id: string;
                isVerified: boolean;
                createdAt: Date;
                updatedAt: Date;
                displayName: string;
                bio: string | null;
                avatarUrl: string | null;
                bannerUrl: string | null;
                location: string | null;
                website: string | null;
                socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
                availability: string | null;
                skills: string[];
                categories: string[];
                isCreator: boolean;
                isPrivate: boolean;
                allowTips: boolean;
                notificationPreference: string;
                followerCount: number;
                followingCount: number;
                postCount: number;
                userId: string;
            };
            followedAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getFollowing(userId: string, dto: GetFollowingDto): Promise<{
        following: {
            id: string;
            username: string;
            email: string;
            profile: {
                username: string;
                id: string;
                isVerified: boolean;
                createdAt: Date;
                updatedAt: Date;
                displayName: string;
                bio: string | null;
                avatarUrl: string | null;
                bannerUrl: string | null;
                location: string | null;
                website: string | null;
                socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
                availability: string | null;
                skills: string[];
                categories: string[];
                isCreator: boolean;
                isPrivate: boolean;
                allowTips: boolean;
                notificationPreference: string;
                followerCount: number;
                followingCount: number;
                postCount: number;
                userId: string;
            };
            followedAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    checkFollowStatus(dto: CheckFollowDto): Promise<{
        isFollowing: boolean;
        followedAt: Date;
    }>;
    batchCheckFollowStatus(req: any, dto: BatchFollowCheckDto): Promise<{
        userId: string;
        isFollowing: boolean;
        followedAt: Date;
    }[]>;
    getMutualConnections(req: any, dto: GetMutualConnectionsDto): Promise<{
        mutualFollowing: {
            id: string;
            username: string;
            profile: {
                username: string;
                id: string;
                isVerified: boolean;
                createdAt: Date;
                updatedAt: Date;
                displayName: string;
                bio: string | null;
                avatarUrl: string | null;
                bannerUrl: string | null;
                location: string | null;
                website: string | null;
                socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
                availability: string | null;
                skills: string[];
                categories: string[];
                isCreator: boolean;
                isPrivate: boolean;
                allowTips: boolean;
                notificationPreference: string;
                followerCount: number;
                followingCount: number;
                postCount: number;
                userId: string;
            };
        }[];
        mutualFollowers: {
            id: string;
            username: string;
            profile: {
                username: string;
                id: string;
                isVerified: boolean;
                createdAt: Date;
                updatedAt: Date;
                displayName: string;
                bio: string | null;
                avatarUrl: string | null;
                bannerUrl: string | null;
                location: string | null;
                website: string | null;
                socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
                availability: string | null;
                skills: string[];
                categories: string[];
                isCreator: boolean;
                isPrivate: boolean;
                allowTips: boolean;
                notificationPreference: string;
                followerCount: number;
                followingCount: number;
                postCount: number;
                userId: string;
            };
        }[];
        count: {
            following: number;
            followers: number;
        };
    }>;
    getFollowCounts(userId: string): Promise<{
        followerCount: number;
        followingCount: number;
    }>;
    getSuggestedFromNetwork(req: any, limit?: number): Promise<{
        id: any;
        username: any;
        profile: {
            avatarUrl: any;
            fullName: any;
            bio: any;
            followerCount: any;
        };
        mutualFollowers: number;
    }[]>;
}
