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
exports.UserDiscoveryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UserDiscoveryService = class UserDiscoveryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async searchUsers(currentUserId, dto) {
        const { query, location, skills, availability, verified, sortBy, page = 1, limit = 20 } = dto;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (query) {
            where.OR = [
                { username: { contains: query, mode: 'insensitive' } },
                { profile: { displayName: { contains: query, mode: 'insensitive' } } },
                { profile: { bio: { contains: query, mode: 'insensitive' } } },
            ];
        }
        if (location) {
            where.profile = {
                ...where.profile,
                location: { contains: location, mode: 'insensitive' },
            };
        }
        if (skills && skills.length > 0) {
            where.profile = {
                ...where.profile,
                skills: {
                    hasSome: skills,
                },
            };
        }
        if (availability && availability !== 'any') {
            where.profile = {
                ...where.profile,
                availability: availability === 'available' ? 'available' : 'busy',
            };
        }
        if (verified !== undefined) {
            where.isVerified = verified;
        }
        let orderBy = {};
        switch (sortBy) {
            case 'followers':
                orderBy = { profile: { followerCount: 'desc' } };
                break;
            case 'recent':
                orderBy = { createdAt: 'desc' };
                break;
            case 'engagement':
                orderBy = { createdAt: 'desc' };
                break;
            default:
                orderBy = { profile: { followerCount: 'desc' } };
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    profile: true,
                    _count: {
                        select: {
                            posts: true,
                            followers: true,
                            following: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        let rankedUsers = users;
        if (sortBy === 'engagement' || sortBy === 'relevance') {
            const usersWithScores = await Promise.all(users.map(async (user) => {
                const score = await this.calculateUserRelevanceScore(user, currentUserId);
                return { user, score };
            }));
            usersWithScores.sort((a, b) => b.score - a.score);
            rankedUsers = usersWithScores.map(u => u.user);
        }
        let followStatuses = new Map();
        if (currentUserId) {
            const follows = await this.prisma.follow.findMany({
                where: {
                    followerId: currentUserId,
                    followingId: { in: rankedUsers.map(u => u.id) },
                },
            });
            followStatuses = new Map(follows.map(f => [f.followingId, true]));
        }
        return {
            users: rankedUsers.map(user => ({
                id: user.id,
                username: user.username,
                verified: user.isVerified,
                profile: user.profile,
                stats: {
                    posts: user._count.posts,
                    followers: user._count.followers,
                    following: user._count.following,
                },
                isFollowing: currentUserId ? followStatuses.get(user.id) || false : false,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async calculateUserRelevanceScore(user, currentUserId) {
        let score = 0;
        const followerScore = Math.log10(user.profile?.followerCount || 1) * 10;
        score += followerScore;
        if (user._count.posts > 0) {
            const recentPosts = await this.prisma.post.findMany({
                where: {
                    authorId: user.id,
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                },
                select: {
                    likeCount: true,
                    commentCount: true,
                    shareCount: true,
                },
                take: 10,
            });
            const avgEngagement = recentPosts.reduce((sum, post) => {
                return sum + post.likeCount + post.commentCount * 2 + post.shareCount * 3;
            }, 0) / Math.max(recentPosts.length, 1);
            score += Math.log10(avgEngagement + 1) * 15;
        }
        if (user.isVerified) {
            score += 20;
        }
        const profile = user.profile;
        if (profile) {
            let completeness = 0;
            if (profile.avatarUrl)
                completeness += 20;
            if (profile.fullName)
                completeness += 10;
            if (profile.bio)
                completeness += 10;
            if (profile.location)
                completeness += 5;
            if (profile.skills?.length > 0)
                completeness += 10;
            score += completeness;
        }
        if (currentUserId) {
            const mutualCount = await this.prisma.follow.count({
                where: {
                    followerId: currentUserId,
                    following: {
                        followers: {
                            some: {
                                followerId: user.id,
                            },
                        },
                    },
                },
            });
            score += mutualCount * 5;
        }
        return score;
    }
    async getRecommendedUsers(userId, dto) {
        const { limit = 10, context = 'general' } = dto;
        let recommendations = [];
        switch (context) {
            case 'similar_interests':
                recommendations = await this.getSimilarInterestUsers(userId, limit);
                break;
            case 'mutual_connections':
                recommendations = await this.getMutualConnectionUsers(userId, limit);
                break;
            case 'trending':
                recommendations = await this.getTrendingUsers(limit);
                break;
            default:
                recommendations = await this.getGeneralRecommendations(userId, limit);
        }
        return {
            recommendations,
            context,
        };
    }
    async getSimilarInterestUsers(userId, limit) {
        const currentUser = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
        if (!currentUser?.profile?.skills || currentUser.profile.skills.length === 0) {
            return this.getGeneralRecommendations(userId, limit);
        }
        const users = await this.prisma.user.findMany({
            where: {
                id: { not: userId },
                profile: {
                    skills: {
                        hasSome: currentUser.profile.skills,
                    },
                },
                NOT: {
                    followers: {
                        some: {
                            followerId: userId,
                        },
                    },
                },
            },
            take: limit * 2,
            include: {
                profile: true,
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                    },
                },
            },
        });
        const scored = users.map(user => {
            const skillOverlap = user.profile?.skills?.filter(skill => currentUser.profile.skills.includes(skill)).length || 0;
            const score = skillOverlap * 10 +
                Math.log10(user._count.followers + 1) * 5 +
                (user._count.posts > 0 ? 10 : 0);
            return { user, score };
        });
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit).map(({ user }) => ({
            id: user.id,
            username: user.username,
            verified: user.isVerified,
            profile: user.profile,
            reason: 'Similar interests',
            stats: {
                followers: user._count.followers,
                posts: user._count.posts,
            },
        }));
    }
    async getMutualConnectionUsers(userId, limit) {
        const suggestions = await this.prisma.$queryRaw `
      SELECT 
        u.id,
        u.username,
        u.isVerified,
        COUNT(DISTINCT f1.follower_id) as mutual_count,
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
      GROUP BY u.id, u.username, u.isVerified, p.avatar_url, p.full_name, p.bio, p.follower_count
      ORDER BY mutual_count DESC, p.follower_count DESC
      LIMIT ${limit}
    `;
        return suggestions.map(s => ({
            id: s.id,
            username: s.username,
            verified: s.isVerified,
            profile: {
                avatarUrl: s.avatar_url,
                fullName: s.full_name,
                bio: s.bio,
                followerCount: s.follower_count,
            },
            reason: `${s.mutual_count} mutual connection${s.mutual_count > 1 ? 's' : ''}`,
            mutualCount: parseInt(s.mutual_count),
        }));
    }
    async getTrendingUsers(limit) {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const trending = await this.prisma.user.findMany({
            where: {
                posts: {
                    some: {
                        createdAt: { gte: sevenDaysAgo },
                    },
                },
            },
            take: limit * 2,
            include: {
                profile: true,
                posts: {
                    where: {
                        createdAt: { gte: sevenDaysAgo },
                    },
                    select: {
                        likeCount: true,
                        commentCount: true,
                        shareCount: true,
                        viewCount: true,
                    },
                },
                _count: {
                    select: {
                        followers: true,
                    },
                },
            },
        });
        const scored = trending.map(user => {
            const totalEngagement = user.posts.reduce((sum, post) => {
                return sum + post.likeCount + post.commentCount * 2 +
                    post.shareCount * 3 + post.viewCount * 0.1;
            }, 0);
            const score = totalEngagement + user._count.followers * 0.5;
            return { user, score, engagement: totalEngagement };
        });
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit).map(({ user, engagement }) => ({
            id: user.id,
            username: user.username,
            verified: user.isVerified,
            profile: user.profile,
            reason: 'Trending creator',
            stats: {
                followers: user._count.followers,
                recentEngagement: Math.round(engagement),
            },
        }));
    }
    async getGeneralRecommendations(userId, limit) {
        const recommendations = [];
        const [similar, mutual, trending] = await Promise.all([
            this.getSimilarInterestUsers(userId, Math.ceil(limit / 3)),
            this.getMutualConnectionUsers(userId, Math.ceil(limit / 3)),
            this.getTrendingUsers(Math.ceil(limit / 3)),
        ]);
        recommendations.push(...similar, ...mutual, ...trending);
        const seen = new Set();
        const unique = recommendations.filter(rec => {
            if (seen.has(rec.id))
                return false;
            seen.add(rec.id);
            return true;
        });
        for (let i = unique.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [unique[i], unique[j]] = [unique[j], unique[i]];
        }
        return unique.slice(0, limit);
    }
    async getTrendingCreators(dto) {
        const { timeframe = 'week', category, limit = 20 } = dto;
        const timeMap = {
            day: 1,
            week: 7,
            month: 30,
        };
        const days = timeMap[timeframe];
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const where = {
            posts: {
                some: {
                    createdAt: { gte: startDate },
                },
            },
        };
        if (category) {
            where.profile = {
                skills: {
                    has: category,
                },
            };
        }
        const creators = await this.prisma.user.findMany({
            where,
            take: limit * 2,
            include: {
                profile: true,
                posts: {
                    where: {
                        createdAt: { gte: startDate },
                    },
                    select: {
                        likeCount: true,
                        commentCount: true,
                        shareCount: true,
                        viewCount: true,
                    },
                },
                _count: {
                    select: {
                        followers: true,
                        posts: true,
                    },
                },
            },
        });
        const scored = creators.map(creator => {
            const engagement = creator.posts.reduce((sum, post) => {
                return sum + post.likeCount + post.commentCount * 2 +
                    post.shareCount * 3 + post.viewCount * 0.1;
            }, 0);
            const engagementRate = engagement / Math.max(creator._count.followers, 100);
            const score = engagement + engagementRate * 100;
            return { creator, score, engagement };
        });
        scored.sort((a, b) => b.score - a.score);
        return {
            creators: scored.slice(0, limit).map(({ creator, engagement }) => ({
                id: creator.id,
                username: creator.username,
                verified: creator.isVerified,
                profile: creator.profile,
                stats: {
                    followers: creator._count.followers,
                    posts: creator._count.posts,
                    recentEngagement: Math.round(engagement),
                },
                trending: {
                    timeframe,
                    engagementScore: Math.round(engagement),
                },
            })),
            timeframe,
            category: category || 'all',
        };
    }
    async getSimilarUsers(userId, dto) {
        const { limit = 10 } = dto;
        return this.getSimilarInterestUsers(userId, limit);
    }
};
exports.UserDiscoveryService = UserDiscoveryService;
exports.UserDiscoveryService = UserDiscoveryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserDiscoveryService);
//# sourceMappingURL=user-discovery.service.js.map