export declare class FollowUserDto {
    followingId: string;
}
export declare class GetFollowersDto {
    page?: number;
    limit?: number;
}
export declare class GetFollowingDto {
    page?: number;
    limit?: number;
}
export declare class CheckFollowDto {
    userId: string;
    targetUserId: string;
}
export declare class GetMutualConnectionsDto {
    userId: string;
    limit?: number;
}
export declare class BatchFollowCheckDto {
    userIds: string[];
}
