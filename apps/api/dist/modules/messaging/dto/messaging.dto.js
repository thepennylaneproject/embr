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
exports.MediaUploadDto = exports.TypingIndicatorDto = exports.DeleteConversationDto = exports.DeleteMessageDto = exports.CreateConversationDto = exports.SearchMessagesDto = exports.GetMessagesDto = exports.GetConversationsDto = exports.MarkAsReadDto = exports.SendMessageDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const messaging_types_1 = require("../../../shared/types/messaging.types");
class SendMessageDto {
}
exports.SendMessageDto = SendMessageDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Conversation ID (required if no recipientId)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Conversation ID must be a valid UUID' }),
    __metadata("design:type", String)
], SendMessageDto.prototype, "conversationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Recipient user ID (required if no conversationId)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Recipient ID must be a valid UUID' }),
    __metadata("design:type", String)
], SendMessageDto.prototype, "recipientId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Message text content',
        example: 'Hey! How are you?',
        maxLength: 5000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000, { message: 'Message content cannot exceed 5000 characters' }),
    __metadata("design:type", String)
], SendMessageDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL of uploaded media file',
        example: 'https://cdn.embr.com/files/abc123.jpg',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "mediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'MIME type of media file',
        example: 'image/jpeg',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "mediaType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Original filename',
        example: 'screenshot.png',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'File size in bytes',
        example: 1024000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SendMessageDto.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Message type',
        enum: messaging_types_1.MessageType,
        example: messaging_types_1.MessageType.TEXT,
    }),
    (0, class_validator_1.IsEnum)(messaging_types_1.MessageType, { message: 'Invalid message type' }),
    __metadata("design:type", String)
], SendMessageDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata',
        example: { replyToId: 'abc123' },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SendMessageDto.prototype, "metadata", void 0);
class MarkAsReadDto {
}
exports.MarkAsReadDto = MarkAsReadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Conversation ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Conversation ID must be a valid UUID' }),
    __metadata("design:type", String)
], MarkAsReadDto.prototype, "conversationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Specific message IDs to mark as read (if not provided, marks all unread)',
        example: ['123e4567-e89b-12d3-a456-426614174000'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true, message: 'Each message ID must be a valid UUID' }),
    __metadata("design:type", Array)
], MarkAsReadDto.prototype, "messageIds", void 0);
class GetConversationsDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.GetConversationsDto = GetConversationsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page number',
        example: 1,
        minimum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetConversationsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of conversations per page',
        example: 20,
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GetConversationsDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Search query to filter conversations',
        example: 'john',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], GetConversationsDto.prototype, "search", void 0);
class GetMessagesDto {
    constructor() {
        this.page = 1;
        this.limit = 50;
    }
}
exports.GetMessagesDto = GetMessagesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Conversation ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Conversation ID must be a valid UUID' }),
    __metadata("design:type", String)
], GetMessagesDto.prototype, "conversationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page number',
        example: 1,
        minimum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetMessagesDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of messages per page',
        example: 50,
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GetMessagesDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Get messages before this message ID (for pagination)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], GetMessagesDto.prototype, "before", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Get messages after this message ID (for pagination)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], GetMessagesDto.prototype, "after", void 0);
class SearchMessagesDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.SearchMessagesDto = SearchMessagesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Conversation ID to search within',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Conversation ID must be a valid UUID' }),
    __metadata("design:type", String)
], SearchMessagesDto.prototype, "conversationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Search query',
        example: 'project deadline',
        minLength: 1,
        maxLength: 100,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SearchMessagesDto.prototype, "query", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page number',
        example: 1,
        minimum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SearchMessagesDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of results per page',
        example: 20,
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], SearchMessagesDto.prototype, "limit", void 0);
class CreateConversationDto {
}
exports.CreateConversationDto = CreateConversationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user to start a conversation with',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Participant ID must be a valid UUID' }),
    __metadata("design:type", String)
], CreateConversationDto.prototype, "participantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional initial message',
        example: 'Hi! I saw your portfolio and wanted to connect.',
        maxLength: 5000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreateConversationDto.prototype, "initialMessage", void 0);
class DeleteMessageDto {
}
exports.DeleteMessageDto = DeleteMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Message ID to delete',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Message ID must be a valid UUID' }),
    __metadata("design:type", String)
], DeleteMessageDto.prototype, "messageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Conversation ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Conversation ID must be a valid UUID' }),
    __metadata("design:type", String)
], DeleteMessageDto.prototype, "conversationId", void 0);
class DeleteConversationDto {
}
exports.DeleteConversationDto = DeleteConversationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Conversation ID to delete',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Conversation ID must be a valid UUID' }),
    __metadata("design:type", String)
], DeleteConversationDto.prototype, "conversationId", void 0);
class TypingIndicatorDto {
}
exports.TypingIndicatorDto = TypingIndicatorDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Conversation ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Conversation ID must be a valid UUID' }),
    __metadata("design:type", String)
], TypingIndicatorDto.prototype, "conversationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether user is typing',
        example: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TypingIndicatorDto.prototype, "isTyping", void 0);
class MediaUploadDto {
}
exports.MediaUploadDto = MediaUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Conversation ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Conversation ID must be a valid UUID' }),
    __metadata("design:type", String)
], MediaUploadDto.prototype, "conversationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Media type',
        enum: messaging_types_1.MessageType,
        example: messaging_types_1.MessageType.IMAGE,
    }),
    (0, class_validator_1.IsEnum)(messaging_types_1.MessageType, { message: 'Invalid media type' }),
    __metadata("design:type", String)
], MediaUploadDto.prototype, "type", void 0);
//# sourceMappingURL=messaging.dto.js.map