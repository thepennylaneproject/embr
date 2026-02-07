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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const messaging_service_1 = require("../services/messaging.service");
const upload_service_1 = require("../../upload/upload.service");
const messaging_dto_1 = require("../dto/messaging.dto");
const messaging_types_1 = require("../../../shared/types/messaging.types");
let MessagingController = class MessagingController {
    constructor(messagingService, uploadService) {
        this.messagingService = messagingService;
        this.uploadService = uploadService;
    }
    async getConversations(req, dto) {
        return this.messagingService.getConversations(req.user.id, dto);
    }
    async createConversation(req, dto) {
        return this.messagingService.getOrCreateConversation(req.user.id, dto);
    }
    async deleteConversation(req, conversationId) {
        return this.messagingService.deleteConversation(req.user.id, {
            conversationId,
        });
    }
    async sendMessage(req, dto) {
        return this.messagingService.sendMessage(req.user.id, dto);
    }
    async getMessages(req, conversationId, query) {
        const dto = {
            conversationId,
            page: query.page,
            limit: query.limit,
            before: query.before,
            after: query.after,
        };
        return this.messagingService.getMessages(req.user.id, dto);
    }
    async markAsRead(req, dto) {
        return this.messagingService.markAsRead(req.user.id, dto);
    }
    async deleteMessage(req, messageId, conversationId) {
        if (!conversationId) {
            throw new common_1.BadRequestException('conversationId query parameter is required');
        }
        return this.messagingService.deleteMessage(req.user.id, {
            messageId,
            conversationId,
        });
    }
    async searchMessages(req, conversationId, query) {
        const dto = {
            conversationId,
            query: query.query,
            page: query.page,
            limit: query.limit,
        };
        return this.messagingService.searchMessages(req.user.id, dto);
    }
    async getUnreadCount(req) {
        return this.messagingService.getUnreadCount(req.user.id);
    }
    async uploadMedia(req, file, dto) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (file.size > messaging_types_1.MESSAGE_CONSTRAINTS.MAX_FILE_SIZE) {
            throw new common_1.BadRequestException(`File size exceeds maximum of ${messaging_types_1.MESSAGE_CONSTRAINTS.MAX_FILE_SIZE / 1024 / 1024}MB`);
        }
        const allowedTypes = this.getAllowedFileTypes(dto.type);
        if (!allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Invalid file type. Allowed types for ${dto.type}: ${allowedTypes.join(', ')}`);
        }
        let uploadResult;
        switch (dto.type) {
            case messaging_types_1.MessageType.IMAGE:
                uploadResult = await this.uploadService.uploadImage(file);
                break;
            case messaging_types_1.MessageType.VIDEO:
                uploadResult = await this.uploadService.uploadVideo(file);
                break;
            case messaging_types_1.MessageType.FILE:
                uploadResult = await this.uploadService.uploadFile(file);
                break;
            default:
                throw new common_1.BadRequestException('Invalid message type for upload');
        }
        return {
            url: uploadResult.url,
            mediaType: file.mimetype,
            fileName: file.originalname,
            fileSize: file.size,
            type: dto.type,
            conversationId: dto.conversationId,
        };
    }
    getAllowedFileTypes(messageType) {
        switch (messageType) {
            case messaging_types_1.MessageType.IMAGE:
                return [...messaging_types_1.MESSAGE_CONSTRAINTS.ALLOWED_IMAGE_TYPES];
            case messaging_types_1.MessageType.VIDEO:
                return [...messaging_types_1.MESSAGE_CONSTRAINTS.ALLOWED_VIDEO_TYPES];
            case messaging_types_1.MessageType.FILE:
                return [...messaging_types_1.MESSAGE_CONSTRAINTS.ALLOWED_FILE_TYPES];
            default:
                return [];
        }
    }
};
exports.MessagingController = MessagingController;
__decorate([
    (0, common_1.Get)('conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user conversations with pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns list of conversations' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, messaging_dto_1.GetConversationsDto]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Post)('conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Create or get existing conversation' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Conversation created or retrieved' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, messaging_dto_1.CreateConversationDto]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Delete)('conversations/:conversationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a conversation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversation deleted' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "deleteConversation", null);
__decorate([
    (0, common_1.Post)('messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a message' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Message sent successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, messaging_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('conversations/:conversationId/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get messages in a conversation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns list of messages' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('messages/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark messages as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Messages marked as read' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, messaging_dto_1.MarkAsReadDto]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Delete)('messages/:messageId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a message' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message deleted' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('messageId')),
    __param(2, (0, common_1.Query)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Get)('conversations/:conversationId/search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search messages within a conversation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns matching messages' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "searchMessages", null);
__decorate([
    (0, common_1.Get)('unread'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unread message count' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns unread counts' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Post)('media/upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload media for messaging' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Media uploaded successfully' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, messaging_dto_1.MediaUploadDto]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "uploadMedia", null);
exports.MessagingController = MessagingController = __decorate([
    (0, swagger_1.ApiTags)('Messaging'),
    (0, common_1.Controller)('messaging'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [messaging_service_1.MessagingService,
        upload_service_1.UploadService])
], MessagingController);
//# sourceMappingURL=messaging.controller.js.map