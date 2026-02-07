import { S3MultipartService } from '../services/s3-multipart.service';
import { MuxVideoService } from '../services/mux-video.service';
import { ThumbnailService } from '../services/thumbnail.service';
import { MediaService } from '../services/media.service';
import { InitiateUploadDto, CompleteUploadDto, CompleteMultipartUploadDto, AbortUploadDto } from '../dto/media-upload.dto';
export declare class MediaUploadController {
    private s3Service;
    private muxService;
    private thumbnailService;
    private mediaService;
    private readonly logger;
    constructor(s3Service: S3MultipartService, muxService: MuxVideoService, thumbnailService: ThumbnailService, mediaService: MediaService);
    initiateUpload(user: any, dto: InitiateUploadDto): Promise<{
        uploadType: string;
        uploadId: string;
        uploadUrl: string;
        assetId: string;
    } | {
        uploadType: string;
        uploadId: string;
        fileKey: string;
        partSize: number;
        totalParts: number;
        partUrls: {
            partNumber: number;
            url: string;
        }[];
    } | {
        uploadType: string;
        uploadId: string;
        uploadUrl: string;
        fileKey: string;
        expiresIn: number;
    }>;
    private initiateSimpleUpload;
    private initiateS3MultipartUpload;
    private initiateMuxUpload;
    completeUpload(user: any, dto: CompleteUploadDto): Promise<{
        success: boolean;
        media: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            userId: string;
            thumbnailUrl: string | null;
            muxAssetId: string | null;
            muxPlaybackId: string | null;
            duration: number | null;
            postId: string | null;
            fileKey: string;
            uploadId: string | null;
            fileUrl: string;
            contentType: string;
            status: string;
            aspectRatio: string | null;
            playbackUrl: string | null;
            thumbnailKey: string | null;
            fileName: string;
            fileType: string;
            fileSize: number;
            errorMessage: string | null;
            completedAt: Date | null;
        };
    }>;
    completeMultipartUpload(user: any, dto: CompleteMultipartUploadDto): Promise<{
        success: boolean;
        media: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            userId: string;
            thumbnailUrl: string | null;
            muxAssetId: string | null;
            muxPlaybackId: string | null;
            duration: number | null;
            postId: string | null;
            fileKey: string;
            uploadId: string | null;
            fileUrl: string;
            contentType: string;
            status: string;
            aspectRatio: string | null;
            playbackUrl: string | null;
            thumbnailKey: string | null;
            fileName: string;
            fileType: string;
            fileSize: number;
            errorMessage: string | null;
            completedAt: Date | null;
        };
    }>;
    abortUpload(user: any, dto: AbortUploadDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getUploadStatus(user: any, uploadId: string): Promise<{
        uploadId: string;
        status: string;
        fileUrl: string;
        thumbnailUrl: string;
        createdAt: Date;
        completedAt: Date;
    }>;
    deleteMedia(user: any, mediaId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getSignedUrl(user: any, mediaId: string, expiresIn?: number): Promise<{
        signedUrl: string;
        expiresIn: number;
        expiresAt: string;
    }>;
    private validateFileType;
    private generateImageThumbnail;
    private getFileUrl;
}
