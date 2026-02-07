import { PrismaService } from '../../prisma/prisma.service';
import { BlockUserDto, MuteUserDto, MuteKeywordDto } from '../dto/safety.dto';
export declare class BlockingService {
    private prisma;
    constructor(prisma: PrismaService);
    blockUser(userId: string, dto: BlockUserDto): Promise<{
        blocked: {
            profile: {
                displayName: string;
                avatarUrl: string;
            };
            username: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        reason: string | null;
        blockerId: string;
        blockedId: string;
    }>;
    unblockUser(userId: string, blockedUserId: string): Promise<{
        success: boolean;
    }>;
    getBlockedUsers(userId: string, page?: number, limit?: number): Promise<{
        blocks: {
            id: string;
            user: {
                profile: {
                    displayName: string;
                    avatarUrl: string;
                };
                username: string;
                id: string;
            };
            reason: string;
            blockedAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    isBlocked(userId: string, targetUserId: string): Promise<boolean>;
    muteUser(userId: string, dto: MuteUserDto): Promise<{
        muted: {
            profile: {
                displayName: string;
                avatarUrl: string;
            };
            username: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        expiresAt: Date | null;
        muterId: string;
        mutedId: string;
    }>;
    unmuteUser(userId: string, mutedUserId: string): Promise<{
        success: boolean;
    }>;
    getMutedUsers(userId: string, page?: number, limit?: number): Promise<{
        mutes: {
            id: string;
            user: {
                profile: {
                    displayName: string;
                    avatarUrl: string;
                };
                username: string;
                id: string;
            };
            expiresAt: Date;
            mutedAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    isMuted(userId: string, targetUserId: string): Promise<boolean>;
    addMutedKeyword(userId: string, dto: MuteKeywordDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        keyword: string;
        caseSensitive: boolean;
    }>;
    removeMutedKeyword(userId: string, keywordId: string): Promise<{
        success: boolean;
    }>;
    getMutedKeywords(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        keyword: string;
        caseSensitive: boolean;
    }[]>;
    checkMutedContent(userId: string, content: string): Promise<boolean>;
    filterContent(userId: string, contentItems: any[]): Promise<any[]>;
    cleanupExpiredMutes(): Promise<{
        cleaned: number;
    }>;
}
