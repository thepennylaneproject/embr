"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FollowsService = class FollowsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async followUser(followerId, dto) {
        if (followerId === dto.followingId) {
            throw new common_1.BadRequestException('Cannot follow yourself');
        }
        const targetUser = await this.prisma.user.findUnique({
            where: { id: dto.followingId },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException('User not found');
        }
        const existingFollow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId: dto.followingId,
                },
            },
        });
        if (existingFollow) {
            throw new common_1.ConflictException('Already following this user');
        }
        const follow = await this.prisma.follow.create({
            data: {
                followerId,
                followingId: dto.followingId,
            },
            include: {
                following: {
                    include: {
                        profile: true,
                    },
                },
            },
        });
        await Promise.all([
            this.prisma.profile.update({
                where: { userId: followerId },
                data: { followingCount: { increment: 1 } },
            }),
            this.prisma.profile.update({
                where: { userId: dto.followingId },
                data: { followerCount: { increment: 1 } },
            }),
        ]);
        await this.prisma.notification.create({
            data: {
                userId: dto.followingId,
                type: 'NEW_FOLLOWER',
                actorId: followerId,
                message: `started following you`,
            },
        }).catch(() => {
        });
        return {
            id: follow.id,
            followerId: follow.followerId,
            followingId: follow.followingId,
            createdAt: follow.createdAt,
            user: {
                id: follow.following.id,
                username: follow.following.username,
                profile: follow.following.profile,
            },
        };
    }
    async unfollowUser(followerId, followingId) {
        const follow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
        if (!follow) {
            throw new common_1.NotFoundException('Follow relationship not found');
        }
        await this.prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
        await Promise.all([
            this.prisma.profile.update({
                where: { userId: followerId },
                data: { followingCount: { decrement: 1 } },
            }),
            this.prisma.profile.update({
                where: { userId: followingId },
                data: { followerCount: { decrement: 1 } },
            }),
        ]);
        return { message: 'Successfully unfollowed user' };
    }
    async getFollowers(userId, dto) {
        const { page = 1, limit = 20 } = dto;
        const skip = (page - 1) * limit;
        const [followers, total] = await Promise.all([
            this.prisma.follow.findMany({
                where: { followingId: userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    follower: {
                        include: {
                            profile: true,
                        },
                    },
                },
            }),
            this.prisma.follow.count({
                where: { followingId: userId },
            }),
        ]);
        return {
            followers: followers.map(f => ({
                id: f.follower.id,
                username: f.follower.username,
                email: f.follower.email,
                profile: f.follower.profile,
                followedAt: f.createdAt,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getFollowing(userId, dto) {
        const { page = 1, limit = 20 } = dto;
        const skip = (page - 1) * limit;
        const [following, total] = await Promise.all([
            this.prisma.follow.findMany({
                where: { followerId: userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    following: {
                        include: {
                            profile: true,
                        },
                    },
                },
            }),
            this.prisma.follow.count({
                where: { followerId: userId },
            }),
        ]);
        return {
            following: following.map(f => ({
                id: f.following.id,
                username: f.following.username,
                email: f.following.email,
                profile: f.following.profile,
                followedAt: f.createdAt,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async checkFollowStatus(dto) {
        const follow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: dto.userId,
                    followingId: dto.targetUserId,
                },
            },
        });
        return {
            isFollowing: !!follow,
            followedAt: follow?.createdAt || null,
        };
    }
    async batchCheckFollowStatus(userId, dto) {
        const follows = await this.prisma.follow.findMany({
            where: {
                followerId: userId,
                followingId: { in: dto.userIds },
            },
            select: {
                followingId: true,
                createdAt: true,
            },
        });
        const followMap = new Map(follows.map(f => [f.followingId, f.createdAt]));
        return dto.userIds.map(id => ({
            userId: id,
            isFollowing: followMap.has(id),
            followedAt: followMap.get(id) || null,
        }));
    }
    async getMutualConnections(currentUserId, dto) {
        const { userId, limit = 10 } = dto;
        const mutualFollowing = await this.prisma.follow.findMany({
            where: {
                followerId: currentUserId,
                following: {
                    followers: {
                        some: {
                            followerId: userId,
                        },
                    },
                },
            },
            take: limit,
            include: {
                following: {
                    include: {
                        profile: true,
                    },
                },
            },
        });
        const mutualFollowers = await this.prisma.follow.findMany({
            where: {
                followingId: currentUserId,
                follower: {
                    following: {
                        some: {
                            followingId: userId,
                        },
                    },
                },
            },
            take: limit,
            include: {
                follower: {
                    include: {
                        profile: true,
                    },
                },
            },
        });
        return {
            mutualFollowing: mutualFollowing.map(f => ({
                id: f.following.id,
                username: f.following.username,
                profile: f.following.profile,
            })),
            mutualFollowers: mutualFollowers.map(f => ({
                id: f.follower.id,
                username: f.follower.username,
                profile: f.follower.profile,
            })),
            count: {
                following: mutualFollowing.length,
                followers: mutualFollowers.length,
            },
        };
    }
    async getFollowCounts(userId) {
        const [followerCount, followingCount] = await Promise.all([
            this.prisma.follow.count({ where: { followingId: userId } }),
            this.prisma.follow.count({ where: { followerId: userId } }),
        ]);
        return {
            followerCount,
            followingCount,
        };
    }
    async getSuggestedFromNetwork(userId, limit = 10) {
        const suggestions = await this.prisma.$queryRaw `
      SELECT 
        u.id,
        u.username,
        COUNT(DISTINCT f1.follower_id) as mutual_followers,
        p.avatar_url,
        p.full_name,
        p.bio,
        p.follower_count
      FROM users u
      INNER JOIN follows f2 ON f2.following_id = u.id
      INNER JOIN follows f1 ON f1.following_id = f2.follower_id
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE f1.follower_id = ${userId}
      AND f2.follower_id != ${userId}
      AND u.id != ${userId}
      AND NOT EXISTS (
        SELECT 1 FROM follows 
        WHERE follower_id = ${userId} 
        AND following_id = u.id
      )
      GROUP BY u.id, u.username, p.avatar_url, p.full_name, p.bio, p.follower_count
      ORDER BY mutual_followers DESC, p.follower_count DESC
      LIMIT ${limit}
    `;
        return suggestions.map(s => ({
            id: s.id,
            username: s.username,
            profile: {
                avatarUrl: s.avatar_url,
                fullName: s.full_name,
                bio: s.bio,
                followerCount: s.follower_count,
            },
            mutualFollowers: parseInt(s.mutual_followers),
        }));
    }
};
exports.FollowsService = FollowsService;
exports.FollowsService = FollowsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FollowsService);
//# sourceMappingURL=follows.service.js.map