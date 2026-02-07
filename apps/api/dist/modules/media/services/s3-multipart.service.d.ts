import { ConfigService } from '@nestjs/config';
export interface PresignedUploadResult {
    uploadId: string;
    fileKey: string;
    uploadUrl: string;
    expiresIn: number;
}
export interface MultipartUploadInitResult {
    uploadId: string;
    fileKey: string;
    partSize: number;
    totalParts: number;
}
export interface PresignedPartUrls {
    uploadId: string;
    partUrls: {
        partNumber: number;
        url: string;
    }[];
}
export interface CompleteMultipartResult {
    fileUrl: string;
    fileKey: string;
    bucket: string;
}
export declare class S3MultipartService {
    private configService;
    private readonly logger;
    private readonly s3Client;
    private readonly bucket;
    private readonly region;
    private readonly cdnDomain?;
    private readonly PART_SIZE;
    private readonly MULTIPART_THRESHOLD;
    constructor(configService: ConfigService);
    getPresignedUploadUrl(fileName: string, fileType: string, contentType: 'image' | 'video' | 'document', expiresIn?: number): Promise<PresignedUploadResult>;
    initializeMultipartUpload(fileName: string, fileType: string, fileSize: number, contentType: 'image' | 'video' | 'document'): Promise<MultipartUploadInitResult>;
    getPresignedPartUrls(fileKey: string, uploadId: string, totalParts: number, expiresIn?: number): Promise<PresignedPartUrls>;
    completeMultipartUpload(fileKey: string, uploadId: string, parts: {
        PartNumber: number;
        ETag: string;
    }[]): Promise<CompleteMultipartResult>;
    abortMultipartUpload(fileKey: string, uploadId: string): Promise<void>;
    getSignedUrl(fileKey: string, expiresIn?: number): Promise<string>;
    deleteFile(fileKey: string): Promise<void>;
    fileExists(fileKey: string): Promise<boolean>;
    getFileMetadata(fileKey: string): Promise<{
        size: number;
        contentType: string;
        lastModified: Date;
    }>;
    private getFileUrl;
    private generateFileKey;
    shouldUseMultipart(fileSize: number): boolean;
}
