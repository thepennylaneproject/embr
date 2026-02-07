import { RawBodyRequest } from '@nestjs/common';
import { MuxVideoService } from '../services/mux-video.service';
import { MediaService } from '../services/media.service';
import { ThumbnailService } from '../services/thumbnail.service';
import { Request } from 'express';
export declare class MuxWebhookController {
    private muxService;
    private mediaService;
    private thumbnailService;
    private readonly logger;
    constructor(muxService: MuxVideoService, mediaService: MediaService, thumbnailService: ThumbnailService);
    handleWebhook(request: RawBodyRequest<Request>, signature: string, timestamp: string, body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    private processWebhookEvent;
    private handleAssetReady;
    private handleAssetErrored;
    private handleAssetDeleted;
    private handleUploadAssetCreated;
    private handleUploadCancelled;
    private handleUploadErrored;
}
