import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface MuxUploadResult {
    uploadId: string;
    uploadUrl: string;
    assetId?: string;
}
export interface MuxAssetDetails {
    assetId: string;
    playbackIds: string[];
    status: 'preparing' | 'ready' | 'errored';
    duration?: number;
    aspectRatio?: string;
    maxStoredResolution?: string;
    maxStoredFrameRate?: number;
    tracks: {
        type: string;
        maxWidth?: number;
        maxHeight?: number;
        maxFrameRate?: number;
    }[];
}
export interface MuxPlaybackInfo {
    playbackId: string;
    playbackUrl: string;
    thumbnailUrl: string;
    gifUrl: string;
    mp4Urls: {
        low: string;
        medium: string;
        high: string;
    };
}
export declare enum MuxWebhookEvent {
    VIDEO_ASSET_READY = "video.asset.ready",
    VIDEO_ASSET_ERRORED = "video.asset.errored",
    VIDEO_ASSET_DELETED = "video.asset.deleted",
    VIDEO_UPLOAD_ASSET_CREATED = "video.upload.asset_created",
    VIDEO_UPLOAD_CANCELLED = "video.upload.cancelled",
    VIDEO_UPLOAD_ERRORED = "video.upload.errored",
    VIDEO_LIVE_STREAM_ACTIVE = "video.live_stream.active",
    VIDEO_LIVE_STREAM_IDLE = "video.live_stream.idle"
}
export declare class MuxVideoService {
    private configService;
    private eventEmitter;
    private readonly logger;
    private readonly mux;
    private readonly webhookSecret;
    constructor(configService: ConfigService, eventEmitter: EventEmitter2);
    createDirectUpload(corsOrigin?: string, newAssetSettings?: {
        playbackPolicy?: ('public' | 'signed')[];
        mp4Support?: 'none' | 'standard' | 'audio-only';
        normalizeAudio?: boolean;
        maxResolution?: 'low' | 'medium' | 'high';
    }): Promise<MuxUploadResult>;
    createAssetFromUrl(url: string, playbackPolicy?: ('public' | 'signed')[]): Promise<string>;
    getAsset(assetId: string): Promise<MuxAssetDetails>;
    getPlaybackInfo(assetId: string, playbackPolicy?: 'public' | 'signed'): Promise<MuxPlaybackInfo>;
    getThumbnailUrl(playbackId: string, options?: {
        width?: number;
        height?: number;
        time?: number;
        fitMode?: 'preserve' | 'crop' | 'smartcrop' | 'pad';
    }): string;
    getAnimatedGifUrl(playbackId: string, options?: {
        width?: number;
        height?: number;
        fps?: number;
        start?: number;
        end?: number;
    }): string;
    deleteAsset(assetId: string): Promise<void>;
    verifyWebhookSignature(rawBody: string, signature: string, timestamp: string): boolean;
    processWebhook(event: any): Promise<void>;
    private handleAssetReady;
    private handleAssetErrored;
    private handleUploadAssetCreated;
    private handleUploadErrored;
    createSignedPlaybackUrl(playbackId: string, expiresIn?: number): Promise<string>;
}
