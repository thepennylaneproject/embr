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
var MuxWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuxWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const mux_video_service_1 = require("../services/mux-video.service");
const media_service_1 = require("../services/media.service");
const thumbnail_service_1 = require("../services/thumbnail.service");
let MuxWebhookController = MuxWebhookController_1 = class MuxWebhookController {
    constructor(muxService, mediaService, thumbnailService) {
        this.muxService = muxService;
        this.mediaService = mediaService;
        this.thumbnailService = thumbnailService;
        this.logger = new common_1.Logger(MuxWebhookController_1.name);
    }
    async handleWebhook(request, signature, timestamp, body) {
        this.logger.log(`Received Mux webhook: ${body.type}`);
        const rawBody = request.rawBody?.toString('utf8') || JSON.stringify(body);
        const isValid = this.muxService.verifyWebhookSignature(rawBody, signature, timestamp);
        if (!isValid) {
            this.logger.error('Invalid webhook signature');
            throw new common_1.HttpException('Invalid signature', common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            await this.processWebhookEvent(body);
            return {
                success: true,
                message: 'Webhook processed',
            };
        }
        catch (error) {
            this.logger.error('Failed to process webhook', error.stack);
            throw new common_1.HttpException('Failed to process webhook', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async processWebhookEvent(event) {
        const eventType = event.type;
        const data = event.data;
        switch (eventType) {
            case 'video.asset.ready':
                await this.handleAssetReady(data);
                break;
            case 'video.asset.errored':
                await this.handleAssetErrored(data);
                break;
            case 'video.asset.deleted':
                await this.handleAssetDeleted(data);
                break;
            case 'video.upload.asset_created':
                await this.handleUploadAssetCreated(data);
                break;
            case 'video.upload.cancelled':
                await this.handleUploadCancelled(data);
                break;
            case 'video.upload.errored':
                await this.handleUploadErrored(data);
                break;
            default:
                this.logger.log(`Unhandled webhook event: ${eventType}`);
        }
    }
    async handleAssetReady(data) {
        const assetId = data.id;
        const playbackIds = data.playback_ids || [];
        this.logger.log(`Processing asset.ready for ${assetId}`);
        try {
            const media = await this.mediaService.getMediaByMuxAssetId(assetId);
            if (!media) {
                this.logger.warn(`No media record found for asset ${assetId}`);
                return;
            }
            const playbackId = playbackIds.find((p) => p.policy === 'public')?.id;
            if (!playbackId) {
                this.logger.error(`No public playback ID found for asset ${assetId}`);
                return;
            }
            const thumbnail = await this.thumbnailService.generateVideoThumbnail(playbackId, {
                width: 1280,
                height: 720,
                time: 0,
                format: 'jpeg',
                quality: 85,
            });
            await this.mediaService.updateMediaWithMuxData(media.id, {
                muxAssetId: assetId,
                muxPlaybackId: playbackId,
                playbackUrl: `https://stream.mux.com/${playbackId}.m3u8`,
                thumbnailUrl: thumbnail.thumbnailUrl,
                thumbnailKey: thumbnail.thumbnailKey,
                duration: data.duration,
                aspectRatio: data.aspect_ratio,
                status: 'completed',
                completedAt: new Date(),
            });
            this.logger.log(`Updated media ${media.id} with Mux data`);
        }
        catch (error) {
            this.logger.error(`Failed to process asset.ready for ${assetId}`, error.stack);
            throw error;
        }
    }
    async handleAssetErrored(data) {
        const assetId = data.id;
        const errors = data.errors || [];
        this.logger.error(`Asset errored: ${assetId}`, errors);
        try {
            const media = await this.mediaService.getMediaByMuxAssetId(assetId);
            if (media) {
                await this.mediaService.updateMediaStatus(media.id, 'error', {
                    errorMessage: JSON.stringify(errors),
                });
            }
        }
        catch (error) {
            this.logger.error(`Failed to process asset.errored for ${assetId}`, error.stack);
        }
    }
    async handleAssetDeleted(data) {
        const assetId = data.id;
        this.logger.log(`Asset deleted: ${assetId}`);
        try {
            const media = await this.mediaService.getMediaByMuxAssetId(assetId);
            if (media) {
                await this.mediaService.updateMediaStatus(media.id, 'deleted');
            }
        }
        catch (error) {
            this.logger.error(`Failed to process asset.deleted for ${assetId}`, error.stack);
        }
    }
    async handleUploadAssetCreated(data) {
        const uploadId = data.id;
        const assetId = data.asset_id;
        this.logger.log(`Upload asset created: ${uploadId} -> ${assetId}`);
        try {
            const media = await this.mediaService.getMediaByUploadId(uploadId);
            if (media) {
                await this.mediaService.updateMedia(media.id, {
                    muxAssetId: assetId,
                    status: 'processing',
                });
            }
        }
        catch (error) {
            this.logger.error(`Failed to process upload.asset_created for ${uploadId}`, error.stack);
        }
    }
    async handleUploadCancelled(data) {
        const uploadId = data.id;
        this.logger.log(`Upload cancelled: ${uploadId}`);
        try {
            const media = await this.mediaService.getMediaByUploadId(uploadId);
            if (media) {
                await this.mediaService.updateMediaStatus(media.id, 'cancelled');
            }
        }
        catch (error) {
            this.logger.error(`Failed to process upload.cancelled for ${uploadId}`, error.stack);
        }
    }
    async handleUploadErrored(data) {
        const uploadId = data.id;
        const error = data.error;
        this.logger.error(`Upload errored: ${uploadId}`, error);
        try {
            const media = await this.mediaService.getMediaByUploadId(uploadId);
            if (media) {
                await this.mediaService.updateMediaStatus(media.id, 'error', {
                    errorMessage: JSON.stringify(error),
                });
            }
        }
        catch (error) {
            this.logger.error(`Failed to process upload.errored for ${uploadId}`, error.stack);
        }
    }
};
exports.MuxWebhookController = MuxWebhookController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Mux webhook' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('mux-signature')),
    __param(2, (0, common_1.Headers)('mux-timestamp')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], MuxWebhookController.prototype, "handleWebhook", null);
exports.MuxWebhookController = MuxWebhookController = MuxWebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('Webhooks'),
    (0, common_1.Controller)('webhooks/mux'),
    __metadata("design:paramtypes", [mux_video_service_1.MuxVideoService,
        media_service_1.MediaService,
        thumbnail_service_1.ThumbnailService])
], MuxWebhookController);
//# sourceMappingURL=mux-webhook.controller.js.map