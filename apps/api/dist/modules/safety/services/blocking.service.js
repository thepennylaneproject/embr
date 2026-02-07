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
exports.BlockingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let BlockingService = class BlockingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async blockUser(userId, dto) {
        if (userId === dto.blockedUserId) {
            throw new common_1.BadRequestException('You cannot block yourself');
        }
        const userToBlock = await this.prisma.user.findUnique({
            where: { id: dto.blockedUserId },
        });
        if (!userToBlock) {
            throw new common_1.NotFoundException('User not found');
        }
        const existing = await this.prisma.blockedUser.findUnique({
            where: {
                blockerId_blockedId: {
                    blockerId: userId,
                    blockedId: dto.blockedUserId,
                },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('User is already blocked');
        }
        const block = await this.prisma.blockedUser.create({
            data: {
                blockerId: userId,
                blockedId: dto.blockedUserId,
                reason: dto.reason,
            },
            include: {
                blocked: {
                    select: {
                        id: true,
                        username: true,
                        profile: {
                            select: { displayName: true, avatarUrl: true },
                        },
                    },
                },
            },
        });
        await Promise.all([
            this.prisma.follow.deleteMany({
                where: {
                    OR: [
                        { followerId: userId, followingId: dto.blockedUserId },
                        { followerId: dto.blockedUserId, followingId: userId },
                    ],
                },
            }),
            this.prisma.conversation.deleteMany({
                where: {
                    OR: [
                        { participant1Id: userId, participant2Id: dto.blockedUserId },
                        { participant1Id: dto.blockedUserId, participant2Id: userId },
                    ],
                },
            }),
        ]);
        return block;
    }
    async unblockUser(userId, blockedUserId) {
        const block = await this.prisma.blockedUser.findUnique({
            where: {
                blockerId_blockedId: {
                    blockerId: userId,
                    blockedId: blockedUserId,
                },
            },
        });
        if (!block) {
            throw new common_1.NotFoundException('Block not found');
        }
        await this.prisma.blockedUser.delete({
            where: {
                blockerId_blockedId: {
                    blockerId: userId,
                    blockedId: blockedUserId,
                },
            },
        });
        return { success: true };
    }
    async getBlockedUsers(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [blocks, total] = await Promise.all([
            this.prisma.blockedUser.findMany({
                where: { blockerId: userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    blocked: {
                        select: {
                            id: true,
                            username: true,
                            profile: {
                                select: {
                                    displayName: true,
                                    avatarUrl: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.blockedUser.count({ where: { blockerId: userId } }),
        ]);
        return {
            blocks: blocks.map((b) => ({
                id: b.id,
                user: b.blocked,
                reason: b.reason,
                blockedAt: b.createdAt,
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async isBlocked(userId, targetUserId) {
        const block = await this.prisma.blockedUser.findFirst({
            where: {
                OR: [
                    { blockerId: userId, blockedId: targetUserId },
                    { blockerId: targetUserId, blockedId: userId },
                ],
            },
        });
        return !!block;
    }
    async muteUser(userId, dto) {
        if (userId === dto.mutedUserId) {
            throw new common_1.BadRequestException('You cannot mute yourself');
        }
        const userToMute = await this.prisma.user.findUnique({
            where: { id: dto.mutedUserId },
        });
        if (!userToMute) {
            throw new common_1.NotFoundException('User not found');
        }
        const existing = await this.prisma.mutedUser.findUnique({
            where: {
                muterId_mutedId: {
                    muterId: userId,
                    mutedId: dto.mutedUserId,
                },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('User is already muted');
        }
        let expiresAt = null;
        if (dto.duration) {
            expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + dto.duration);
        }
        const mute = await this.prisma.mutedUser.create({
            data: {
                muterId: userId,
                mutedId: dto.mutedUserId,
                expiresAt,
            },
            include: {
                muted: {
                    select: {
                        id: true,
                        username: true,
                        profile: {
                            select: { displayName: true, avatarUrl: true },
                        },
                    },
                },
            },
        });
        return mute;
    }
    async unmuteUser(userId, mutedUserId) {
        const mute = await this.prisma.mutedUser.findUnique({
            where: {
                muterId_mutedId: {
                    muterId: userId,
                    mutedId: mutedUserId,
                },
            },
        });
        if (!mute) {
            throw new common_1.NotFoundException('Mute not found');
        }
        await this.prisma.mutedUser.delete({
            where: {
                muterId_mutedId: {
                    muterId: userId,
                    mutedId: mutedUserId,
                },
            },
        });
        return { success: true };
    }
    async getMutedUsers(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [mutes, total] = await Promise.all([
            this.prisma.mutedUser.findMany({
                where: { muterId: userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    muted: {
                        select: {
                            id: true,
                            username: true,
                            profile: {
                                select: {
                                    displayName: true,
                                    avatarUrl: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.mutedUser.count({ where: { muterId: userId } }),
        ]);
        return {
            mutes: mutes.map((m) => ({
                id: m.id,
                user: m.muted,
                expiresAt: m.expiresAt,
                mutedAt: m.createdAt,
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async isMuted(userId, targetUserId) {
        const mute = await this.prisma.mutedUser.findUnique({
            where: {
                muterId_mutedId: {
                    muterId: userId,
                    mutedId: targetUserId,
                },
            },
        });
        if (mute && mute.expiresAt && mute.expiresAt < new Date()) {
            await this.prisma.mutedUser.delete({
                where: { id: mute.id },
            });
            return false;
        }
        return !!mute;
    }
    async addMutedKeyword(userId, dto) {
        const existing = await this.prisma.mutedKeyword.findFirst({
            where: {
                userId,
                keyword: dto.caseSensitive
                    ? dto.keyword
                    : { equals: dto.keyword, mode: 'insensitive' },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Keyword already muted');
        }
        const mutedKeyword = await this.prisma.mutedKeyword.create({
            data: {
                userId,
                keyword: dto.keyword,
                caseSensitive: dto.caseSensitive,
            },
        });
        return mutedKeyword;
    }
    async removeMutedKeyword(userId, keywordId) {
        const keyword = await this.prisma.mutedKeyword.findUnique({
            where: { id: keywordId },
        });
        if (!keyword || keyword.userId !== userId) {
            throw new common_1.NotFoundException('Muted keyword not found');
        }
        await this.prisma.mutedKeyword.delete({
            where: { id: keywordId },
        });
        return { success: true };
    }
    async getMutedKeywords(userId) {
        const keywords = await this.prisma.mutedKeyword.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return keywords;
    }
    async checkMutedContent(userId, content) {
        const keywords = await this.prisma.mutedKeyword.findMany({
            where: { userId },
        });
        return keywords.some((kw) => {
            if (kw.caseSensitive) {
                return content.includes(kw.keyword);
            }
            else {
                return content.toLowerCase().includes(kw.keyword.toLowerCase());
            }
        });
    }
    async filterContent(userId, contentItems) {
        const [blocked, muted] = await Promise.all([
            this.prisma.blockedUser.findMany({
                where: {
                    OR: [{ blockerId: userId }, { blockedId: userId }],
                },
                select: {
                    blockerId: true,
                    blockedId: true,
                },
            }),
            this.prisma.mutedUser.findMany({
                where: {
                    muterId: userId,
                    OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
                },
                select: {
                    mutedId: true,
                },
            }),
        ]);
        const blockedUserIds = new Set([
            ...blocked.map((b) => (b.blockerId === userId ? b.blockedId : b.blockerId)),
        ]);
        const mutedUserIds = new Set(muted.map((m) => m.mutedId));
        return contentItems.filter((item) => {
            const authorId = item.authorId || item.userId;
            return !blockedUserIds.has(authorId) && !mutedUserIds.has(authorId);
        });
    }
    async cleanupExpiredMutes() {
        const result = await this.prisma.mutedUser.deleteMany({
            where: {
                expiresAt: { lte: new Date() },
            },
        });
        return { cleaned: result.count };
    }
};
exports.BlockingService = BlockingService;
exports.BlockingService = BlockingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BlockingService);
//# sourceMappingURL=blocking.service.js.map