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
var S3MultipartService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3MultipartService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
let S3MultipartService = S3MultipartService_1 = class S3MultipartService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(S3MultipartService_1.name);
        this.PART_SIZE = 10 * 1024 * 1024;
        this.MULTIPART_THRESHOLD = 5 * 1024 * 1024;
        this.region = this.configService.get('AWS_REGION', 'us-east-1');
        this.bucket = this.configService.get('AWS_S3_BUCKET');
        this.cdnDomain = this.configService.get('AWS_CLOUDFRONT_DOMAIN');
        this.s3Client = new client_s3_1.S3Client({
            region: this.region,
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
            },
        });
    }
    async getPresignedUploadUrl(fileName, fileType, contentType, expiresIn = 3600) {
        const fileExtension = fileName.split('.').pop();
        const fileKey = this.generateFileKey(contentType, fileExtension);
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: fileKey,
            ContentType: fileType,
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
        this.logger.log(`Generated presigned URL for ${fileKey}`);
        return {
            uploadId: (0, uuid_1.v4)(),
            fileKey,
            uploadUrl,
            expiresIn,
        };
    }
    async initializeMultipartUpload(fileName, fileType, fileSize, contentType) {
        const fileExtension = fileName.split('.').pop();
        const fileKey = this.generateFileKey(contentType, fileExtension);
        const command = new client_s3_1.CreateMultipartUploadCommand({
            Bucket: this.bucket,
            Key: fileKey,
            ContentType: fileType,
            Metadata: {
                originalName: fileName,
                uploadedAt: new Date().toISOString(),
            },
        });
        const result = await this.s3Client.send(command);
        const totalParts = Math.ceil(fileSize / this.PART_SIZE);
        this.logger.log(`Initialized multipart upload for ${fileKey} with ${totalParts} parts`);
        return {
            uploadId: result.UploadId,
            fileKey,
            partSize: this.PART_SIZE,
            totalParts,
        };
    }
    async getPresignedPartUrls(fileKey, uploadId, totalParts, expiresIn = 3600) {
        const partUrls = [];
        for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
            const command = new client_s3_1.UploadPartCommand({
                Bucket: this.bucket,
                Key: fileKey,
                UploadId: uploadId,
                PartNumber: partNumber,
            });
            const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
            partUrls.push({ partNumber, url });
        }
        this.logger.log(`Generated ${totalParts} presigned part URLs for ${fileKey}`);
        return {
            uploadId,
            partUrls,
        };
    }
    async completeMultipartUpload(fileKey, uploadId, parts) {
        const sortedParts = parts.sort((a, b) => a.PartNumber - b.PartNumber);
        const command = new client_s3_1.CompleteMultipartUploadCommand({
            Bucket: this.bucket,
            Key: fileKey,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: sortedParts,
            },
        });
        await this.s3Client.send(command);
        const fileUrl = this.getFileUrl(fileKey);
        this.logger.log(`Completed multipart upload for ${fileKey}`);
        return {
            fileUrl,
            fileKey,
            bucket: this.bucket,
        };
    }
    async abortMultipartUpload(fileKey, uploadId) {
        const command = new client_s3_1.AbortMultipartUploadCommand({
            Bucket: this.bucket,
            Key: fileKey,
            UploadId: uploadId,
        });
        await this.s3Client.send(command);
        this.logger.log(`Aborted multipart upload for ${fileKey}`);
    }
    async getSignedUrl(fileKey, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: fileKey,
        });
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
        this.logger.log(`Generated signed URL for ${fileKey}`);
        return signedUrl;
    }
    async deleteFile(fileKey) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucket,
            Key: fileKey,
        });
        await this.s3Client.send(command);
        this.logger.log(`Deleted file ${fileKey}`);
    }
    async fileExists(fileKey) {
        try {
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: this.bucket,
                Key: fileKey,
            });
            await this.s3Client.send(command);
            return true;
        }
        catch (error) {
            if (error.name === 'NotFound') {
                return false;
            }
            throw error;
        }
    }
    async getFileMetadata(fileKey) {
        const command = new client_s3_1.HeadObjectCommand({
            Bucket: this.bucket,
            Key: fileKey,
        });
        const response = await this.s3Client.send(command);
        return {
            size: response.ContentLength,
            contentType: response.ContentType,
            lastModified: response.LastModified,
        };
    }
    getFileUrl(fileKey) {
        if (this.cdnDomain) {
            return `https://${this.cdnDomain}/${fileKey}`;
        }
        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileKey}`;
    }
    generateFileKey(contentType, extension) {
        const timestamp = Date.now();
        const uuid = (0, uuid_1.v4)();
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        return `${contentType}s/${year}/${month}/${uuid}-${timestamp}.${extension}`;
    }
    shouldUseMultipart(fileSize) {
        return fileSize >= this.MULTIPART_THRESHOLD;
    }
};
exports.S3MultipartService = S3MultipartService;
exports.S3MultipartService = S3MultipartService = S3MultipartService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3MultipartService);
//# sourceMappingURL=s3-multipart.service.js.map