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
var MediaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MediaService = MediaService_1 = class MediaService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MediaService_1.name);
    }
    async createMediaRecord(dto) {
        try {
            const media = await this.prisma.media.create({
                data: {
                    userId: dto.userId,
                    fileName: dto.fileName,
                    fileType: dto.fileType,
                    fileSize: dto.fileSize,
                    contentType: dto.contentType,
                    uploadId: dto.uploadId,
                    fileKey: dto.fileKey,
                    fileUrl: dto.fileUrl,
                    thumbnailUrl: dto.thumbnailUrl,
                    thumbnailKey: dto.thumbnailKey,
                    muxAssetId: dto.muxAssetId,
                    muxPlaybackId: dto.muxPlaybackId,
                    status: dto.status,
                },
            });
            this.logger.log(`Created media record: ${media.id}`);
            return media;
        }
        catch (error) {
            this.logger.error('Failed to create media record', error.stack);
            throw error;
        }
    }
    async getMediaById(mediaId) {
        return this.prisma.media.findUnique({
            where: { id: mediaId },
            include: {
                user: {
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
        });
    }
    async getMediaByUploadId(uploadId) {
        return this.prisma.media.findFirst({
            where: { uploadId },
        });
    }
    async getMediaByMuxAssetId(assetId) {
        return this.prisma.media.findFirst({
            where: { muxAssetId: assetId },
        });
    }
    async getMediaByFileKey(fileKey) {
        return this.prisma.media.findFirst({
            where: { fileKey },
        });
    }
    async getUserMedia(userId, options) {
        const { contentType, status, limit = 20, offset = 0 } = options || {};
        const where = {
            userId,
            deletedAt: null,
        };
        if (contentType) {
            where.contentType = contentType;
        }
        if (status) {
            where.status = status;
        }
        const [media, total] = await Promise.all([
            this.prisma.media.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            this.prisma.media.count({ where }),
        ]);
        return {
            media,
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
        };
    }
    async updateMediaStatus(mediaId, status, metadata) {
        try {
            const updateData = { status };
            if (metadata?.errorMessage) {
                updateData.errorMessage = metadata.errorMessage;
            }
            if (metadata?.completedAt) {
                updateData.completedAt = metadata.completedAt;
            }
            else if (status === 'completed') {
                updateData.completedAt = new Date();
            }
            const media = await this.prisma.media.update({
                where: { id: mediaId },
                data: updateData,
            });
            this.logger.log(`Updated media ${mediaId} status to ${status}`);
            return media;
        }
        catch (error) {
            this.logger.error(`Failed to update media status for ${mediaId}`, error.stack);
            throw error;
        }
    }
    async updateMediaWithMuxData(mediaId, dto) {
        try {
            const media = await this.prisma.media.update({
                where: { id: mediaId },
                data: {
                    muxAssetId: dto.muxAssetId,
                    muxPlaybackId: dto.muxPlaybackId,
                    playbackUrl: dto.playbackUrl,
                    thumbnailUrl: dto.thumbnailUrl,
                    thumbnailKey: dto.thumbnailKey,
                    duration: dto.duration,
                    aspectRatio: dto.aspectRatio,
                    status: dto.status,
                    completedAt: dto.completedAt,
                },
            });
            this.logger.log(`Updated media ${mediaId} with Mux data`);
            return media;
        }
        catch (error) {
            this.logger.error(`Failed to update media with Mux data for ${mediaId}`, error.stack);
            throw error;
        }
    }
    async updateMedia(mediaId, data) {
        try {
            const media = await this.prisma.media.update({
                where: { id: mediaId },
                data,
            });
            this.logger.log(`Updated media ${mediaId}`);
            return media;
        }
        catch (error) {
            this.logger.error(`Failed to update media ${mediaId}`, error.stack);
            throw error;
        }
    }
    async deleteMedia(mediaId) {
        try {
            const media = await this.prisma.media.update({
                where: { id: mediaId },
                data: {
                    deletedAt: new Date(),
                    status: 'deleted',
                },
            });
            this.logger.log(`Soft deleted media ${mediaId}`);
            return media;
        }
        catch (error) {
            this.logger.error(`Failed to delete media ${mediaId}`, error.stack);
            throw error;
        }
    }
    async hardDeleteMedia(mediaId) {
        try {
            await this.prisma.media.delete({
                where: { id: mediaId },
            });
            this.logger.log(`Hard deleted media ${mediaId}`);
        }
        catch (error) {
            this.logger.error(`Failed to hard delete media ${mediaId}`, error.stack);
            throw error;
        }
    }
    async checkMediaAccess(userId, mediaId) {
        const media = await this.prisma.media.findUnique({
            where: { id: mediaId },
            select: {
                userId: true,
                post: {
                    select: {
                        id: true,
                        authorId: true,
                        visibility: true,
                    },
                },
            },
        });
        if (!media) {
            return false;
        }
        if (media.userId === userId) {
            return true;
        }
        if (media.post && media.post.visibility === 'public') {
            return true;
        }
        return false;
    }
    async getMediaStats(userId) {
        const [totalCount, totalSize, byType, byStatus] = await Promise.all([
            this.prisma.media.count({
                where: { userId, deletedAt: null },
            }),
            this.prisma.media.aggregate({
                where: { userId, deletedAt: null },
                _sum: { fileSize: true },
            }),
            this.prisma.media.groupBy({
                by: ['contentType'],
                where: { userId, deletedAt: null },
                _count: true,
            }),
            this.prisma.media.groupBy({
                by: ['status'],
                where: { userId, deletedAt: null },
                _count: true,
            }),
        ]);
        return {
            totalFiles: totalCount,
            totalSize: totalSize._sum.fileSize || 0,
            byType: byType.map((t) => ({
                type: t.contentType,
                count: t._count,
            })),
            byStatus: byStatus.map((s) => ({
                status: s.status,
                count: s._count,
            })),
        };
    }
    async cleanupDeletedMedia(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const deletedMedia = await this.prisma.media.findMany({
            where: {
                deletedAt: {
                    lte: cutoffDate,
                },
            },
            select: {
                id: true,
                fileKey: true,
                thumbnailKey: true,
                muxAssetId: true,
            },
        });
        this.logger.log(`Found ${deletedMedia.length} media to cleanup`);
        return deletedMedia;
    }
    async getFailedUploads(userId, limit = 10) {
        return this.prisma.media.findMany({
            where: {
                userId,
                status: 'error',
                deletedAt: null,
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = MediaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MediaService);
//# sourceMappingURL=media.service.js.map