export declare enum ContentType {
    IMAGE = "image",
    VIDEO = "video",
    DOCUMENT = "document"
}
export declare enum UploadStatus {
    UPLOADING = "uploading",
    PROCESSING = "processing",
    COMPLETED = "completed",
    ERROR = "error",
    ABORTED = "aborted",
    CANCELLED = "cancelled",
    DELETED = "deleted"
}
export declare class InitiateUploadDto {
    fileName: string;
    fileType: string;
    fileSize: number;
    contentType: ContentType;
}
export declare class CompleteUploadDto {
    fileKey: string;
    fileName: string;
    contentType: ContentType;
}
export declare class UploadPartDto {
    PartNumber: number;
    ETag: string;
}
export declare class CompleteMultipartUploadDto {
    uploadId: string;
    fileKey: string;
    fileName: string;
    contentType: ContentType;
    parts: UploadPartDto[];
}
export declare class AbortUploadDto {
    uploadId: string;
    uploadType: 'simple' | 'multipart' | 'mux';
    fileKey?: string;
}
export declare class GenerateThumbnailDto {
    mediaId: string;
    width?: number;
    height?: number;
    time?: number;
}
export declare class GetSignedUrlDto {
    expiresIn?: number;
}
export interface CreateMediaRecordDto {
    userId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    contentType: string;
    uploadId?: string;
    fileKey?: string;
    fileUrl?: string;
    thumbnailUrl?: string;
    thumbnailKey?: string;
    muxAssetId?: string;
    muxPlaybackId?: string;
    status: string;
}
export interface UpdateMediaMuxDataDto {
    muxAssetId: string;
    muxPlaybackId: string;
    playbackUrl: string;
    thumbnailUrl?: string;
    thumbnailKey?: string;
    duration?: number;
    aspectRatio?: string;
    status: string;
    completedAt: Date;
}
