import { S3MultipartService } from './s3-multipart.service';
import { MuxVideoService } from './mux-video.service';
export interface ThumbnailOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}
export interface ThumbnailResult {
    thumbnailUrl: string;
    thumbnailKey: string;
    width: number;
    height: number;
    format: string;
    size: number;
}
export interface VideoThumbnailOptions extends ThumbnailOptions {
    time?: number;
    generateMultiple?: boolean;
}
export declare class ThumbnailService {
    private s3Service;
    private muxService;
    private readonly logger;
    private readonly DEFAULT_SIZES;
    constructor(s3Service: S3MultipartService, muxService: MuxVideoService);
    generateImageThumbnail(imageBuffer: Buffer, options?: ThumbnailOptions): Promise<ThumbnailResult>;
    generateImageThumbnailSet(imageBuffer: Buffer, sizes?: ('small' | 'medium' | 'large')[]): Promise<Record<string, ThumbnailResult>>;
    generateVideoThumbnail(muxPlaybackId: string, options?: VideoThumbnailOptions): Promise<ThumbnailResult>;
    generateVideoThumbnailTimeline(muxPlaybackId: string, duration: number, count?: number, options?: ThumbnailOptions): Promise<ThumbnailResult[]>;
    generateVideoGifPreview(muxPlaybackId: string, options?: {
        width?: number;
        height?: number;
        fps?: number;
        start?: number;
        end?: number;
    }): Promise<string>;
    extractDominantColors(imageBuffer: Buffer, count?: number): Promise<string[]>;
    generateBlurPlaceholder(imageBuffer: Buffer): Promise<string>;
    validateImage(imageBuffer: Buffer, maxWidth?: number, maxHeight?: number, maxSizeMB?: number): Promise<{
        valid: boolean;
        width?: number;
        height?: number;
        size?: number;
        errors: string[];
    }>;
    private uploadThumbnailToS3;
    private generateThumbnailKey;
}
