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
var ThumbnailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThumbnailService = void 0;
const common_1 = require("@nestjs/common");
const sharp = require("sharp");
const s3_multipart_service_1 = require("./s3-multipart.service");
const mux_video_service_1 = require("./mux-video.service");
const uuid_1 = require("uuid");
let ThumbnailService = ThumbnailService_1 = class ThumbnailService {
    constructor(s3Service, muxService) {
        this.s3Service = s3Service;
        this.muxService = muxService;
        this.logger = new common_1.Logger(ThumbnailService_1.name);
        this.DEFAULT_SIZES = {
            small: { width: 320, height: 180 },
            medium: { width: 640, height: 360 },
            large: { width: 1280, height: 720 },
        };
    }
    async generateImageThumbnail(imageBuffer, options = {}) {
        try {
            const { width = 640, height = 360, quality = 80, format = 'jpeg', fit = 'cover', } = options;
            const thumbnailBuffer = await sharp(imageBuffer)
                .resize(width, height, { fit })
                .toFormat(format, { quality })
                .toBuffer();
            const metadata = await sharp(thumbnailBuffer).metadata();
            const thumbnailKey = this.generateThumbnailKey(format);
            const thumbnailUrl = await this.uploadThumbnailToS3(thumbnailBuffer, thumbnailKey, `image/${format}`);
            this.logger.log(`Generated image thumbnail: ${thumbnailKey}`);
            return {
                thumbnailUrl,
                thumbnailKey,
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                size: thumbnailBuffer.length,
            };
        }
        catch (error) {
            this.logger.error('Failed to generate image thumbnail', error.stack);
            throw error;
        }
    }
    async generateImageThumbnailSet(imageBuffer, sizes = ['small', 'medium', 'large']) {
        const thumbnails = {};
        for (const size of sizes) {
            const dimensions = this.DEFAULT_SIZES[size];
            const thumbnail = await this.generateImageThumbnail(imageBuffer, {
                width: dimensions.width,
                height: dimensions.height,
                format: 'jpeg',
                quality: 85,
            });
            thumbnails[size] = thumbnail;
        }
        this.logger.log(`Generated ${sizes.length} thumbnail sizes`);
        return thumbnails;
    }
    async generateVideoThumbnail(muxPlaybackId, options = {}) {
        try {
            const { width = 640, height = 360, time = 0, format = 'jpeg', quality = 85, } = options;
            const muxThumbnailUrl = this.muxService.getThumbnailUrl(muxPlaybackId, {
                width,
                height,
                time,
                fitMode: 'smartcrop',
            });
            const response = await fetch(muxThumbnailUrl);
            const arrayBuffer = await response.arrayBuffer();
            const thumbnailBuffer = Buffer.from(arrayBuffer);
            const processedBuffer = await sharp(thumbnailBuffer)
                .toFormat(format, { quality })
                .toBuffer();
            const metadata = await sharp(processedBuffer).metadata();
            const thumbnailKey = this.generateThumbnailKey(format, 'video');
            const thumbnailUrl = await this.uploadThumbnailToS3(processedBuffer, thumbnailKey, `image/${format}`);
            this.logger.log(`Generated video thumbnail from Mux playback: ${muxPlaybackId}`);
            return {
                thumbnailUrl,
                thumbnailKey,
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                size: processedBuffer.length,
            };
        }
        catch (error) {
            this.logger.error('Failed to generate video thumbnail', error.stack);
            throw error;
        }
    }
    async generateVideoThumbnailTimeline(muxPlaybackId, duration, count = 5, options = {}) {
        const thumbnails = [];
        const interval = duration / (count + 1);
        for (let i = 1; i <= count; i++) {
            const time = Math.floor(interval * i);
            const thumbnail = await this.generateVideoThumbnail(muxPlaybackId, {
                ...options,
                time,
            });
            thumbnails.push(thumbnail);
        }
        this.logger.log(`Generated ${count} timeline thumbnails for video ${muxPlaybackId}`);
        return thumbnails;
    }
    async generateVideoGifPreview(muxPlaybackId, options) {
        try {
            const gifUrl = this.muxService.getAnimatedGifUrl(muxPlaybackId, options);
            this.logger.log(`Generated GIF preview URL for ${muxPlaybackId}`);
            return gifUrl;
        }
        catch (error) {
            this.logger.error('Failed to generate video GIF preview', error.stack);
            throw error;
        }
    }
    async extractDominantColors(imageBuffer, count = 5) {
        try {
            const smallImage = await sharp(imageBuffer)
                .resize(100, 100, { fit: 'cover' })
                .toBuffer();
            const { dominant } = await sharp(smallImage).stats();
            const hexColor = `#${dominant.r.toString(16).padStart(2, '0')}${dominant.g.toString(16).padStart(2, '0')}${dominant.b.toString(16).padStart(2, '0')}`;
            return [hexColor];
        }
        catch (error) {
            this.logger.error('Failed to extract dominant colors', error.stack);
            throw error;
        }
    }
    async generateBlurPlaceholder(imageBuffer) {
        try {
            const placeholder = await sharp(imageBuffer)
                .resize(20, 20, { fit: 'cover' })
                .blur(10)
                .jpeg({ quality: 10 })
                .toBuffer();
            const base64 = placeholder.toString('base64');
            return `data:image/jpeg;base64,${base64}`;
        }
        catch (error) {
            this.logger.error('Failed to generate blur placeholder', error.stack);
            throw error;
        }
    }
    async validateImage(imageBuffer, maxWidth = 4096, maxHeight = 4096, maxSizeMB = 10) {
        const errors = [];
        try {
            const metadata = await sharp(imageBuffer).metadata();
            const sizeMB = imageBuffer.length / (1024 * 1024);
            if (metadata.width > maxWidth) {
                errors.push(`Image width ${metadata.width}px exceeds maximum ${maxWidth}px`);
            }
            if (metadata.height > maxHeight) {
                errors.push(`Image height ${metadata.height}px exceeds maximum ${maxHeight}px`);
            }
            if (sizeMB > maxSizeMB) {
                errors.push(`Image size ${sizeMB.toFixed(2)}MB exceeds maximum ${maxSizeMB}MB`);
            }
            return {
                valid: errors.length === 0,
                width: metadata.width,
                height: metadata.height,
                size: imageBuffer.length,
                errors,
            };
        }
        catch (error) {
            errors.push('Invalid image format');
            return {
                valid: false,
                errors,
            };
        }
    }
    async uploadThumbnailToS3(buffer, key, contentType) {
        const fileUrl = `https://your-bucket.s3.amazonaws.com/${key}`;
        return fileUrl;
    }
    generateThumbnailKey(format, prefix = 'image') {
        const timestamp = Date.now();
        const uuid = (0, uuid_1.v4)();
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        return `thumbnails/${prefix}/${year}/${month}/${uuid}-${timestamp}.${format}`;
    }
};
exports.ThumbnailService = ThumbnailService;
exports.ThumbnailService = ThumbnailService = ThumbnailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [s3_multipart_service_1.S3MultipartService,
        mux_video_service_1.MuxVideoService])
], ThumbnailService);
//# sourceMappingURL=thumbnail.service.js.map