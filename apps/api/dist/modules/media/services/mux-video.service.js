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
var MuxVideoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuxVideoService = exports.MuxWebhookEvent = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mux_node_1 = require("@mux/mux-node");
const event_emitter_1 = require("@nestjs/event-emitter");
var MuxWebhookEvent;
(function (MuxWebhookEvent) {
    MuxWebhookEvent["VIDEO_ASSET_READY"] = "video.asset.ready";
    MuxWebhookEvent["VIDEO_ASSET_ERRORED"] = "video.asset.errored";
    MuxWebhookEvent["VIDEO_ASSET_DELETED"] = "video.asset.deleted";
    MuxWebhookEvent["VIDEO_UPLOAD_ASSET_CREATED"] = "video.upload.asset_created";
    MuxWebhookEvent["VIDEO_UPLOAD_CANCELLED"] = "video.upload.cancelled";
    MuxWebhookEvent["VIDEO_UPLOAD_ERRORED"] = "video.upload.errored";
    MuxWebhookEvent["VIDEO_LIVE_STREAM_ACTIVE"] = "video.live_stream.active";
    MuxWebhookEvent["VIDEO_LIVE_STREAM_IDLE"] = "video.live_stream.idle";
})(MuxWebhookEvent || (exports.MuxWebhookEvent = MuxWebhookEvent = {}));
let MuxVideoService = MuxVideoService_1 = class MuxVideoService {
    constructor(configService, eventEmitter) {
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(MuxVideoService_1.name);
        const tokenId = this.configService.get('MUX_TOKEN_ID');
        const tokenSecret = this.configService.get('MUX_TOKEN_SECRET');
        this.webhookSecret = this.configService.get('MUX_WEBHOOK_SECRET');
        if (!tokenId || !tokenSecret) {
            this.logger.warn('Mux credentials not configured');
        }
        this.mux = new mux_node_1.default({
            tokenId,
            tokenSecret,
        });
    }
    async createDirectUpload(corsOrigin = '*', newAssetSettings) {
        try {
            const upload = await this.mux.video.uploads.create({
                cors_origin: corsOrigin,
                new_asset_settings: {
                    playback_policy: newAssetSettings?.playbackPolicy || ['public'],
                    mp4_support: newAssetSettings?.mp4Support || 'standard',
                    normalize_audio: newAssetSettings?.normalizeAudio ?? true,
                    max_resolution_tier: newAssetSettings?.maxResolution === 'low'
                        ? '720p'
                        : newAssetSettings?.maxResolution === 'medium'
                            ? '1080p'
                            : '1440p',
                },
            });
            this.logger.log(`Created Mux direct upload: ${upload.id}`);
            return {
                uploadId: upload.id,
                uploadUrl: upload.url,
                assetId: upload.asset_id,
            };
        }
        catch (error) {
            this.logger.error('Failed to create Mux upload', error.stack);
            throw error;
        }
    }
    async createAssetFromUrl(url, playbackPolicy = ['public']) {
        try {
            const asset = await this.mux.video.assets.create({
                input: [{ url }],
                playback_policy: playbackPolicy,
                mp4_support: 'standard',
                normalize_audio: true,
            });
            this.logger.log(`Created Mux asset from URL: ${asset.id}`);
            return asset.id;
        }
        catch (error) {
            this.logger.error('Failed to create Mux asset from URL', error.stack);
            throw error;
        }
    }
    async getAsset(assetId) {
        try {
            const asset = await this.mux.video.assets.retrieve(assetId);
            return {
                assetId: asset.id,
                playbackIds: asset.playback_ids?.map((p) => p.id) || [],
                status: asset.status,
                duration: asset.duration,
                aspectRatio: asset.aspect_ratio,
                maxStoredResolution: asset.max_stored_resolution,
                maxStoredFrameRate: asset.max_stored_frame_rate,
                tracks: asset.tracks || [],
            };
        }
        catch (error) {
            this.logger.error(`Failed to get Mux asset ${assetId}`, error.stack);
            throw error;
        }
    }
    async getPlaybackInfo(assetId, playbackPolicy = 'public') {
        try {
            const asset = await this.mux.video.assets.retrieve(assetId);
            const playbackId = asset.playback_ids?.find((p) => p.policy === playbackPolicy)?.id;
            if (!playbackId) {
                throw new Error(`No ${playbackPolicy} playback ID found for asset`);
            }
            return {
                playbackId,
                playbackUrl: `https://stream.mux.com/${playbackId}.m3u8`,
                thumbnailUrl: this.getThumbnailUrl(playbackId),
                gifUrl: this.getAnimatedGifUrl(playbackId),
                mp4Urls: {
                    low: `https://stream.mux.com/${playbackId}/low.mp4`,
                    medium: `https://stream.mux.com/${playbackId}/medium.mp4`,
                    high: `https://stream.mux.com/${playbackId}/high.mp4`,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to get playback info for ${assetId}`, error.stack);
            throw error;
        }
    }
    getThumbnailUrl(playbackId, options) {
        const params = new URLSearchParams();
        if (options?.width)
            params.append('width', options.width.toString());
        if (options?.height)
            params.append('height', options.height.toString());
        if (options?.time)
            params.append('time', options.time.toString());
        if (options?.fitMode)
            params.append('fit_mode', options.fitMode);
        const queryString = params.toString();
        return `https://image.mux.com/${playbackId}/thumbnail.jpg${queryString ? `?${queryString}` : ''}`;
    }
    getAnimatedGifUrl(playbackId, options) {
        const params = new URLSearchParams();
        if (options?.width)
            params.append('width', options.width.toString());
        if (options?.height)
            params.append('height', options.height.toString());
        if (options?.fps)
            params.append('fps', options.fps.toString());
        if (options?.start)
            params.append('start', options.start.toString());
        if (options?.end)
            params.append('end', options.end.toString());
        const queryString = params.toString();
        return `https://image.mux.com/${playbackId}/animated.gif${queryString ? `?${queryString}` : ''}`;
    }
    async deleteAsset(assetId) {
        try {
            await this.mux.video.assets.delete(assetId);
            this.logger.log(`Deleted Mux asset: ${assetId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete Mux asset ${assetId}`, error.stack);
            throw error;
        }
    }
    verifyWebhookSignature(rawBody, signature, timestamp) {
        try {
            return mux_node_1.default.webhooks.verifyHeader(rawBody, signature, this.webhookSecret, timestamp);
        }
        catch (error) {
            this.logger.error('Failed to verify webhook signature', error.stack);
            return false;
        }
    }
    async processWebhook(event) {
        const eventType = event.type;
        const data = event.data;
        this.logger.log(`Processing Mux webhook: ${eventType}`);
        switch (eventType) {
            case MuxWebhookEvent.VIDEO_ASSET_READY:
                await this.handleAssetReady(data);
                break;
            case MuxWebhookEvent.VIDEO_ASSET_ERRORED:
                await this.handleAssetErrored(data);
                break;
            case MuxWebhookEvent.VIDEO_UPLOAD_ASSET_CREATED:
                await this.handleUploadAssetCreated(data);
                break;
            case MuxWebhookEvent.VIDEO_UPLOAD_ERRORED:
                await this.handleUploadErrored(data);
                break;
            default:
                this.logger.log(`Unhandled webhook event: ${eventType}`);
        }
    }
    async handleAssetReady(data) {
        const assetId = data.id;
        const playbackIds = data.playback_ids?.map((p) => p.id) || [];
        this.logger.log(`Asset ready: ${assetId}`);
        this.eventEmitter.emit('mux.asset.ready', {
            assetId,
            playbackIds,
            duration: data.duration,
            aspectRatio: data.aspect_ratio,
        });
    }
    async handleAssetErrored(data) {
        const assetId = data.id;
        const errors = data.errors || [];
        this.logger.error(`Asset errored: ${assetId}`, errors);
        this.eventEmitter.emit('mux.asset.errored', {
            assetId,
            errors,
        });
    }
    async handleUploadAssetCreated(data) {
        const uploadId = data.id;
        const assetId = data.asset_id;
        this.logger.log(`Upload asset created: ${uploadId} -> ${assetId}`);
        this.eventEmitter.emit('mux.upload.completed', {
            uploadId,
            assetId,
        });
    }
    async handleUploadErrored(data) {
        const uploadId = data.id;
        const error = data.error;
        this.logger.error(`Upload errored: ${uploadId}`, error);
        this.eventEmitter.emit('mux.upload.errored', {
            uploadId,
            error,
        });
    }
    async createSignedPlaybackUrl(playbackId, expiresIn = 3600) {
        try {
            const token = await this.mux.jwt.signPlaybackId(playbackId, {
                type: 'video',
                expiration: Math.floor(Date.now() / 1000) + expiresIn,
            });
            return `https://stream.mux.com/${playbackId}.m3u8?token=${token}`;
        }
        catch (error) {
            this.logger.error('Failed to create signed playback URL', error.stack);
            throw error;
        }
    }
};
exports.MuxVideoService = MuxVideoService;
exports.MuxVideoService = MuxVideoService = MuxVideoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        event_emitter_1.EventEmitter2])
], MuxVideoService);
//# sourceMappingURL=mux-video.service.js.map