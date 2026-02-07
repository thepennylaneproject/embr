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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MediaUploadController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaUploadController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const s3_multipart_service_1 = require("../services/s3-multipart.service");
const mux_video_service_1 = require("../services/mux-video.service");
const thumbnail_service_1 = require("../services/thumbnail.service");
const media_service_1 = require("../services/media.service");
const media_upload_dto_1 = require("../dto/media-upload.dto");
let MediaUploadController = MediaUploadController_1 = class MediaUploadController {
    constructor(s3Service, muxService, thumbnailService, mediaService) {
        this.s3Service = s3Service;
        this.muxService = muxService;
        this.thumbnailService = thumbnailService;
        this.mediaService = mediaService;
        this.logger = new common_1.Logger(MediaUploadController_1.name);
    }
    async initiateUpload(user, dto) {
        this.logger.log(`Initiating upload for user ${user.id}: ${dto.fileName} (${dto.fileSize} bytes)`);
        this.validateFileType(dto.fileType, dto.contentType);
        const useMultipart = this.s3Service.shouldUseMultipart(dto.fileSize);
        if (useMultipart && dto.contentType === 'video') {
            return this.initiateMuxUpload(user.id, dto);
        }
        else if (useMultipart) {
            return this.initiateS3MultipartUpload(user.id, dto);
        }
        else {
            return this.initiateSimpleUpload(user.id, dto);
        }
    }
    async initiateSimpleUpload(userId, dto) {
        const presignedResult = await this.s3Service.getPresignedUploadUrl(dto.fileName, dto.fileType, dto.contentType, 3600);
        return {
            uploadType: 'simple',
            uploadId: presignedResult.uploadId,
            uploadUrl: presignedResult.uploadUrl,
            fileKey: presignedResult.fileKey,
            expiresIn: presignedResult.expiresIn,
        };
    }
    async initiateS3MultipartUpload(userId, dto) {
        const multipartResult = await this.s3Service.initializeMultipartUpload(dto.fileName, dto.fileType, dto.fileSize, dto.contentType);
        const partUrls = await this.s3Service.getPresignedPartUrls(multipartResult.fileKey, multipartResult.uploadId, multipartResult.totalParts, 3600);
        return {
            uploadType: 'multipart',
            uploadId: multipartResult.uploadId,
            fileKey: multipartResult.fileKey,
            partSize: multipartResult.partSize,
            totalParts: multipartResult.totalParts,
            partUrls: partUrls.partUrls,
        };
    }
    async initiateMuxUpload(userId, dto) {
        const muxResult = await this.muxService.createDirectUpload('*', {
            playbackPolicy: ['public'],
            mp4Support: 'standard',
            normalizeAudio: true,
            maxResolution: 'high',
        });
        await this.mediaService.createMediaRecord({
            userId,
            fileName: dto.fileName,
            fileType: dto.fileType,
            fileSize: dto.fileSize,
            contentType: dto.contentType,
            uploadId: muxResult.uploadId,
            status: 'uploading',
        });
        return {
            uploadType: 'mux',
            uploadId: muxResult.uploadId,
            uploadUrl: muxResult.uploadUrl,
            assetId: muxResult.assetId,
        };
    }
    async completeUpload(user, dto) {
        this.logger.log(`Completing upload for user ${user.id}: ${dto.fileKey}`);
        const exists = await this.s3Service.fileExists(dto.fileKey);
        if (!exists) {
            throw new common_1.HttpException('File not found in storage', common_1.HttpStatus.NOT_FOUND);
        }
        const metadata = await this.s3Service.getFileMetadata(dto.fileKey);
        let thumbnail = null;
        if (dto.contentType === 'image') {
            thumbnail = await this.generateImageThumbnail(dto.fileKey);
        }
        const media = await this.mediaService.createMediaRecord({
            userId: user.id,
            fileName: dto.fileName,
            fileType: metadata.contentType,
            fileSize: metadata.size,
            contentType: dto.contentType,
            fileKey: dto.fileKey,
            fileUrl: this.getFileUrl(dto.fileKey),
            thumbnailUrl: thumbnail?.thumbnailUrl,
            status: 'completed',
        });
        return {
            success: true,
            media,
        };
    }
    async completeMultipartUpload(user, dto) {
        this.logger.log(`Completing multipart upload for user ${user.id}: ${dto.fileKey}`);
        const result = await this.s3Service.completeMultipartUpload(dto.fileKey, dto.uploadId, dto.parts);
        const metadata = await this.s3Service.getFileMetadata(dto.fileKey);
        let thumbnail = null;
        if (dto.contentType === 'image') {
            thumbnail = await this.generateImageThumbnail(dto.fileKey);
        }
        const media = await this.mediaService.createMediaRecord({
            userId: user.id,
            fileName: dto.fileName,
            fileType: metadata.contentType,
            fileSize: metadata.size,
            contentType: dto.contentType,
            fileKey: dto.fileKey,
            fileUrl: result.fileUrl,
            thumbnailUrl: thumbnail?.thumbnailUrl,
            status: 'completed',
        });
        return {
            success: true,
            media,
        };
    }
    async abortUpload(user, dto) {
        this.logger.log(`Aborting upload for user ${user.id}: ${dto.uploadId}`);
        if (dto.uploadType === 'multipart') {
            await this.s3Service.abortMultipartUpload(dto.fileKey, dto.uploadId);
        }
        await this.mediaService.updateMediaStatus(dto.uploadId, 'aborted');
        return {
            success: true,
            message: 'Upload aborted',
        };
    }
    async getUploadStatus(user, uploadId) {
        const media = await this.mediaService.getMediaByUploadId(uploadId);
        if (!media || media.userId !== user.id) {
            throw new common_1.HttpException('Upload not found', common_1.HttpStatus.NOT_FOUND);
        }
        return {
            uploadId: media.uploadId,
            status: media.status,
            fileUrl: media.fileUrl,
            thumbnailUrl: media.thumbnailUrl,
            createdAt: media.createdAt,
            completedAt: media.completedAt,
        };
    }
    async deleteMedia(user, mediaId) {
        const media = await this.mediaService.getMediaById(mediaId);
        if (!media || media.userId !== user.id) {
            throw new common_1.HttpException('Media not found', common_1.HttpStatus.FORBIDDEN);
        }
        if (media.fileKey) {
            await this.s3Service.deleteFile(media.fileKey);
        }
        if (media.muxAssetId) {
            await this.muxService.deleteAsset(media.muxAssetId);
        }
        if (media.thumbnailKey) {
            await this.s3Service.deleteFile(media.thumbnailKey);
        }
        await this.mediaService.deleteMedia(mediaId);
        return {
            success: true,
            message: 'Media deleted',
        };
    }
    async getSignedUrl(user, mediaId, expiresIn = 3600) {
        const media = await this.mediaService.getMediaById(mediaId);
        if (!media) {
            throw new common_1.HttpException('Media not found', common_1.HttpStatus.NOT_FOUND);
        }
        const hasAccess = await this.mediaService.checkMediaAccess(user.id, mediaId);
        if (!hasAccess) {
            throw new common_1.HttpException('Access denied', common_1.HttpStatus.FORBIDDEN);
        }
        let signedUrl;
        if (media.muxPlaybackId && media.contentType === 'video') {
            signedUrl = await this.muxService.createSignedPlaybackUrl(media.muxPlaybackId, expiresIn);
        }
        else if (media.fileKey) {
            signedUrl = await this.s3Service.getSignedUrl(media.fileKey, expiresIn);
        }
        else {
            throw new common_1.HttpException('Media not available', common_1.HttpStatus.NOT_FOUND);
        }
        return {
            signedUrl,
            expiresIn,
            expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
        };
    }
    validateFileType(fileType, contentType) {
        const allowedTypes = {
            image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            video: [
                'video/mp4',
                'video/quicktime',
                'video/x-msvideo',
                'video/webm',
            ],
            document: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
        };
        if (!allowedTypes[contentType]?.includes(fileType)) {
            throw new common_1.HttpException(`File type ${fileType} not allowed for ${contentType}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async generateImageThumbnail(fileKey) {
        return null;
    }
    getFileUrl(fileKey) {
        return `https://your-cdn.com/${fileKey}`;
    }
};
exports.MediaUploadController = MediaUploadController;
__decorate([
    (0, common_1.Post)('upload/initiate'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate media upload' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Upload initialized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, media_upload_dto_1.InitiateUploadDto]),
    __metadata("design:returntype", Promise)
], MediaUploadController.prototype, "initiateUpload", null);
__decorate([
    (0, common_1.Post)('upload/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete simple upload' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Upload completed' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, media_upload_dto_1.CompleteUploadDto]),
    __metadata("design:returntype", Promise)
], MediaUploadController.prototype, "completeUpload", null);
__decorate([
    (0, common_1.Post)('upload/complete-multipart'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete multipart upload' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Multipart upload completed' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, media_upload_dto_1.CompleteMultipartUploadDto]),
    __metadata("design:returntype", Promise)
], MediaUploadController.prototype, "completeMultipartUpload", null);
__decorate([
    (0, common_1.Post)('upload/abort'),
    (0, swagger_1.ApiOperation)({ summary: 'Abort upload' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Upload aborted' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, media_upload_dto_1.AbortUploadDto]),
    __metadata("design:returntype", Promise)
], MediaUploadController.prototype, "abortUpload", null);
__decorate([
    (0, common_1.Get)('upload/:uploadId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get upload status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Upload status retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('uploadId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MediaUploadController.prototype, "getUploadStatus", null);
__decorate([
    (0, common_1.Delete)(':mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete media' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Media deleted' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('mediaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MediaUploadController.prototype, "deleteMedia", null);
__decorate([
    (0, common_1.Get)(':mediaId/signed-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Get signed URL for private media' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Signed URL generated' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('mediaId')),
    __param(2, (0, common_1.Query)('expiresIn')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], MediaUploadController.prototype, "getSignedUrl", null);
exports.MediaUploadController = MediaUploadController = MediaUploadController_1 = __decorate([
    (0, swagger_1.ApiTags)('Media Upload'),
    (0, common_1.Controller)('media'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [s3_multipart_service_1.S3MultipartService,
        mux_video_service_1.MuxVideoService,
        thumbnail_service_1.ThumbnailService,
        media_service_1.MediaService])
], MediaUploadController);
//# sourceMappingURL=media-upload.controller.js.map