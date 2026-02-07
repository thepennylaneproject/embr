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
var MessagingGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const messaging_service_1 = require("../services/messaging.service");
const messaging_dto_1 = require("../dto/messaging.dto");
const messaging_types_1 = require("../../../shared/types/messaging.types");
let MessagingGateway = MessagingGateway_1 = class MessagingGateway {
    constructor(messagingService, jwtService) {
        this.messagingService = messagingService;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(MessagingGateway_1.name);
        this.userSockets = new Map();
        this.typingTimeouts = new Map();
    }
    afterInit(server) {
        this.logger.log('Messaging WebSocket Gateway initialized');
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token ||
                client.handshake.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                this.logger.warn(`Client ${client.id} connection rejected: No token provided`);
                client.disconnect();
                return;
            }
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });
            client.userId = payload.sub;
            client.username = payload.username;
            if (!this.userSockets.has(client.userId)) {
                this.userSockets.set(client.userId, new Set());
            }
            this.userSockets.get(client.userId).add(client.id);
            client.join(`user:${client.userId}`);
            this.logger.log(`Client ${client.id} connected: ${client.username} (${client.userId})`);
            client.emit(messaging_types_1.WebSocketEvent.CONNECT, {
                userId: client.userId,
                username: client.username,
            });
        }
        catch (error) {
            this.logger.error(`Client ${client.id} connection error:`, error);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        if (client.userId) {
            const userSockets = this.userSockets.get(client.userId);
            if (userSockets) {
                userSockets.delete(client.id);
                if (userSockets.size === 0) {
                    this.userSockets.delete(client.userId);
                }
            }
            this.logger.log(`Client ${client.id} disconnected: ${client.username} (${client.userId})`);
        }
    }
    async handleSendMessage(client, dto) {
        try {
            if (!client.userId) {
                client.emit(messaging_types_1.WebSocketEvent.ERROR, {
                    code: 'UNAUTHORIZED',
                    message: 'Not authenticated',
                });
                return;
            }
            const result = await this.messagingService.sendMessage(client.userId, dto);
            this.server
                .to(`user:${client.userId}`)
                .emit(messaging_types_1.WebSocketEvent.MESSAGE_SEND, result);
            const recipientId = result.conversation.participant1Id === client.userId
                ? result.conversation.participant2Id
                : result.conversation.participant1Id;
            this.server
                .to(`user:${recipientId}`)
                .emit(messaging_types_1.WebSocketEvent.MESSAGE_RECEIVE, result);
            if (this.isUserOnline(recipientId)) {
                await this.handleMessageDelivered(client, {
                    messageId: result.message.id,
                    conversationId: result.conversation.id,
                });
            }
            this.logger.log(`Message sent: ${result.message.id} from ${client.userId} to ${recipientId}`);
        }
        catch (error) {
            this.logger.error('Error sending message:', error);
            client.emit(messaging_types_1.WebSocketEvent.ERROR, {
                code: 'MESSAGE_SEND_FAILED',
                message: error.message || 'Failed to send message',
            });
        }
    }
    async handleMessageDelivered(client, data) {
        try {
            const conversation = await this.messagingService.getConversations(client.userId, { conversationId: data.conversationId });
            if (conversation.conversations.length > 0) {
                const conv = conversation.conversations[0];
                const senderId = conv.otherUser.id === client.userId
                    ? conv.otherUser.id
                    : client.userId;
                this.server.to(`user:${senderId}`).emit(messaging_types_1.WebSocketEvent.MESSAGE_DELIVERED, {
                    messageId: data.messageId,
                    conversationId: data.conversationId,
                });
            }
        }
        catch (error) {
            this.logger.error('Error marking message as delivered:', error);
        }
    }
    async handleMarkAsRead(client, dto) {
        try {
            if (!client.userId) {
                client.emit(messaging_types_1.WebSocketEvent.ERROR, {
                    code: 'UNAUTHORIZED',
                    message: 'Not authenticated',
                });
                return;
            }
            const result = await this.messagingService.markAsRead(client.userId, dto);
            this.server
                .to(`user:${client.userId}`)
                .emit(messaging_types_1.WebSocketEvent.MESSAGE_READ, result);
            const senderId = result.conversation.participant1Id === client.userId
                ? result.conversation.participant2Id
                : result.conversation.participant1Id;
            this.server.to(`user:${senderId}`).emit(messaging_types_1.WebSocketEvent.MESSAGE_READ, {
                conversationId: dto.conversationId,
                messageIds: dto.messageIds,
                readBy: client.userId,
                readAt: new Date().toISOString(),
            });
            this.logger.log(`Messages marked as read in conversation ${dto.conversationId} by ${client.userId}`);
        }
        catch (error) {
            this.logger.error('Error marking messages as read:', error);
            client.emit(messaging_types_1.WebSocketEvent.ERROR, {
                code: 'MARK_READ_FAILED',
                message: error.message || 'Failed to mark messages as read',
            });
        }
    }
    async handleBulkMarkAsRead(client, data) {
        try {
            if (!client.userId) {
                client.emit(messaging_types_1.WebSocketEvent.ERROR, {
                    code: 'UNAUTHORIZED',
                    message: 'Not authenticated',
                });
                return;
            }
            const results = await Promise.all(data.conversationIds.map((conversationId) => this.messagingService.markAsRead(client.userId, { conversationId })));
            this.server.to(`user:${client.userId}`).emit(messaging_types_1.WebSocketEvent.MESSAGE_BULK_READ, {
                conversationIds: data.conversationIds,
                results,
            });
            this.logger.log(`Bulk read: ${data.conversationIds.length} conversations by ${client.userId}`);
        }
        catch (error) {
            this.logger.error('Error in bulk mark as read:', error);
            client.emit(messaging_types_1.WebSocketEvent.ERROR, {
                code: 'BULK_READ_FAILED',
                message: error.message || 'Failed to mark messages as read',
            });
        }
    }
    async handleTypingStart(client, dto) {
        try {
            if (!client.userId)
                return;
            const { conversationId } = dto;
            const conversations = await this.messagingService.getConversations(client.userId, {});
            const conversation = conversations.conversations.find((c) => c.id === conversationId);
            if (!conversation)
                return;
            const recipientId = conversation.otherUser.id;
            const timeoutKey = `${conversationId}-${client.userId}`;
            const existingTimeout = this.typingTimeouts.get(timeoutKey);
            if (existingTimeout) {
                clearTimeout(existingTimeout);
            }
            const typingIndicator = {
                conversationId,
                userId: client.userId,
                isTyping: true,
                timestamp: new Date().toISOString(),
            };
            this.server
                .to(`user:${recipientId}`)
                .emit(messaging_types_1.WebSocketEvent.TYPING_INDICATOR, typingIndicator);
            const timeout = setTimeout(() => {
                this.handleTypingStop(client, { conversationId, isTyping: false });
                this.typingTimeouts.delete(timeoutKey);
            }, 3004);
            this.typingTimeouts.set(timeoutKey, timeout);
        }
        catch (error) {
            this.logger.error('Error handling typing start:', error);
        }
    }
    async handleTypingStop(client, dto) {
        try {
            if (!client.userId)
                return;
            const { conversationId } = dto;
            const timeoutKey = `${conversationId}-${client.userId}`;
            const existingTimeout = this.typingTimeouts.get(timeoutKey);
            if (existingTimeout) {
                clearTimeout(existingTimeout);
                this.typingTimeouts.delete(timeoutKey);
            }
            const conversations = await this.messagingService.getConversations(client.userId, {});
            const conversation = conversations.conversations.find((c) => c.id === conversationId);
            if (!conversation)
                return;
            const recipientId = conversation.otherUser.id;
            const typingIndicator = {
                conversationId,
                userId: client.userId,
                isTyping: false,
                timestamp: new Date().toISOString(),
            };
            this.server
                .to(`user:${recipientId}`)
                .emit(messaging_types_1.WebSocketEvent.TYPING_INDICATOR, typingIndicator);
        }
        catch (error) {
            this.logger.error('Error handling typing stop:', error);
        }
    }
    isUserOnline(userId) {
        return this.userSockets.has(userId) && this.userSockets.get(userId).size > 0;
    }
    sendToUser(userId, event, data) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
    getOnlineUsers() {
        return Array.from(this.userSockets.keys());
    }
    getUserConnectionCount(userId) {
        return this.userSockets.get(userId)?.size || 0;
    }
};
exports.MessagingGateway = MessagingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)(messaging_types_1.WebSocketEvent.MESSAGE_SEND),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, messaging_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(messaging_types_1.WebSocketEvent.MESSAGE_DELIVERED),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleMessageDelivered", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(messaging_types_1.WebSocketEvent.MESSAGE_READ),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, messaging_dto_1.MarkAsReadDto]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleMarkAsRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(messaging_types_1.WebSocketEvent.MESSAGE_BULK_READ),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleBulkMarkAsRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(messaging_types_1.WebSocketEvent.TYPING_START),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, messaging_dto_1.TypingIndicatorDto]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(messaging_types_1.WebSocketEvent.TYPING_STOP),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, messaging_dto_1.TypingIndicatorDto]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleTypingStop", null);
exports.MessagingGateway = MessagingGateway = MessagingGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3004'],
            credentials: true,
        },
        namespace: '/messaging',
    }),
    __metadata("design:paramtypes", [messaging_service_1.MessagingService,
        jwt_1.JwtService])
], MessagingGateway);
//# sourceMappingURL=messaging.gateway.js.map