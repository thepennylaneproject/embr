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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSignedUrlDto = exports.GenerateThumbnailDto = exports.AbortUploadDto = exports.CompleteMultipartUploadDto = exports.UploadPartDto = exports.CompleteUploadDto = exports.InitiateUploadDto = exports.UploadStatus = exports.ContentType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var ContentType;
(function (ContentType) {
    ContentType["IMAGE"] = "image";
    ContentType["VIDEO"] = "video";
    ContentType["DOCUMENT"] = "document";
})(ContentType || (exports.ContentType = ContentType = {}));
var UploadStatus;
(function (UploadStatus) {
    UploadStatus["UPLOADING"] = "uploading";
    UploadStatus["PROCESSING"] = "processing";
    UploadStatus["COMPLETED"] = "completed";
    UploadStatus["ERROR"] = "error";
    UploadStatus["ABORTED"] = "aborted";
    UploadStatus["CANCELLED"] = "cancelled";
    UploadStatus["DELETED"] = "deleted";
})(UploadStatus || (exports.UploadStatus = UploadStatus = {}));
class InitiateUploadDto {
}
exports.InitiateUploadDto = InitiateUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Original file name',
        example: 'vacation-video.mp4',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiateUploadDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'MIME type of the file',
        example: 'video/mp4',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiateUploadDto.prototype, "fileType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File size in bytes',
        example: 52428800,
        minimum: 1,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], InitiateUploadDto.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Content type category',
        enum: ContentType,
        example: ContentType.VIDEO,
    }),
    (0, class_validator_1.IsEnum)(ContentType),
    __metadata("design:type", String)
], InitiateUploadDto.prototype, "contentType", void 0);
class CompleteUploadDto {
}
exports.CompleteUploadDto = CompleteUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File key in S3',
        example: 'videos/2024/11/abc123-1700000000.mp4',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteUploadDto.prototype, "fileKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Original file name',
        example: 'vacation-video.mp4',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteUploadDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Content type category',
        enum: ContentType,
    }),
    (0, class_validator_1.IsEnum)(ContentType),
    __metadata("design:type", String)
], CompleteUploadDto.prototype, "contentType", void 0);
class UploadPartDto {
}
exports.UploadPartDto = UploadPartDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Part number (1-indexed)',
        example: 1,
        minimum: 1,
        maximum: 10000,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10000),
    __metadata("design:type", Number)
], UploadPartDto.prototype, "PartNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ETag returned from S3 after part upload',
        example: '"abc123def456"',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadPartDto.prototype, "ETag", void 0);
class CompleteMultipartUploadDto {
}
exports.CompleteMultipartUploadDto = CompleteMultipartUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Multipart upload ID',
        example: 'abc123def456',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteMultipartUploadDto.prototype, "uploadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File key in S3',
        example: 'videos/2024/11/abc123-1700000000.mp4',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteMultipartUploadDto.prototype, "fileKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Original file name',
        example: 'vacation-video.mp4',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteMultipartUploadDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Content type category',
        enum: ContentType,
    }),
    (0, class_validator_1.IsEnum)(ContentType),
    __metadata("design:type", String)
], CompleteMultipartUploadDto.prototype, "contentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of uploaded parts with ETags',
        type: [UploadPartDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => UploadPartDto),
    __metadata("design:type", Array)
], CompleteMultipartUploadDto.prototype, "parts", void 0);
class AbortUploadDto {
}
exports.AbortUploadDto = AbortUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Upload ID',
        example: 'abc123def456',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AbortUploadDto.prototype, "uploadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of upload to abort',
        enum: ['simple', 'multipart', 'mux'],
        example: 'multipart',
    }),
    (0, class_validator_1.IsEnum)(['simple', 'multipart', 'mux']),
    __metadata("design:type", String)
], AbortUploadDto.prototype, "uploadType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File key (for multipart uploads)',
        example: 'videos/2024/11/abc123-1700000000.mp4',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AbortUploadDto.prototype, "fileKey", void 0);
class GenerateThumbnailDto {
}
exports.GenerateThumbnailDto = GenerateThumbnailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Media ID to generate thumbnail for',
        example: 'media_abc123',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateThumbnailDto.prototype, "mediaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Thumbnail width in pixels',
        example: 640,
        required: false,
        minimum: 100,
        maximum: 4096,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(4096),
    __metadata("design:type", Number)
], GenerateThumbnailDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Thumbnail height in pixels',
        example: 360,
        required: false,
        minimum: 100,
        maximum: 4096,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(4096),
    __metadata("design:type", Number)
], GenerateThumbnailDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Time in seconds for video thumbnail',
        example: 5,
        required: false,
        minimum: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GenerateThumbnailDto.prototype, "time", void 0);
class GetSignedUrlDto {
}
exports.GetSignedUrlDto = GetSignedUrlDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Expiration time in seconds',
        example: 3600,
        required: false,
        minimum: 60,
        maximum: 604800,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(60),
    (0, class_validator_1.Max)(604800),
    __metadata("design:type", Number)
], GetSignedUrlDto.prototype, "expiresIn", void 0);
//# sourceMappingURL=media-upload.dto.js.map