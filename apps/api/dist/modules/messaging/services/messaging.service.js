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
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const messaging_types_1 = require("../../../shared/types/messaging.types");
let MessagingService = class MessagingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConversations(userId, dto) {
        const { page = 1, limit = 20, search } = dto;
        const skip = (page - 1) * limit;
        const where = {
            OR: [{ participant1Id: userId }, { participant2Id: userId }],
        };
        if (search) {
            where.OR = [
                {
                    participant1Id: userId,
                    participant2: {
                        OR: [
                            { username: { contains: search, mode: 'insensitive' } },
                            { profile: { displayName: { contains: search, mode: 'insensitive' } } },
                        ],
                    },
                },
                {
                    participant2Id: userId,
                    participant1: {
                        OR: [
                            { username: { contains: search, mode: 'insensitive' } },
                            { profile: { displayName: { contains: search, mode: 'insensitive' } } },
                        ],
                    },
                },
            ];
        }
        const total = await this.prisma.conversation.count({ where });
        const conversations = (await this.prisma.conversation.findMany({
            where,
            include: {
                participant1: {
                    include: {
                        profile: true,
                    },
                },
                participant2: {
                    include: {
                        profile: true,
                    },
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        sender: {
                            include: {
                                profile: true,
                            },
                        },
                    },
                },
            },
            orderBy: { lastMessageAt: 'desc' },
            take: limit,
            skip,
        }));
        const conversationPreviews = await Promise.all(conversations.map(async (conv) => {
            const otherUser = conv.participant1Id === userId ? conv.participant2 : conv.participant1;
            const unreadCount = await this.prisma.message.count({
                where: {
                    conversationId: conv.id,
                    senderId: { not: userId },
                    status: { not: messaging_types_1.MessageStatus.READ },
                },
            });
            return {
                id: conv.id,
                otherUser: {
                    id: otherUser.id,
                    username: otherUser.username,
                    profile: otherUser.profile,
                },
                lastMessage: conv.messages[0]
                    ? {
                        id: conv.messages[0].id,
                        conversationId: conv.messages[0].conversationId,
                        senderId: conv.messages[0].senderId,
                        content: conv.messages[0].content,
                        mediaUrl: conv.messages[0].mediaUrl,
                        mediaType: conv.messages[0].mediaType,
                        fileName: conv.messages[0].fileName,
                        fileSize: conv.messages[0].fileSize,
                        type: conv.messages[0].type,
                        status: conv.messages[0].status,
                        createdAt: conv.messages[0].createdAt.toISOString(),
                        readAt: conv.messages[0].readAt?.toISOString(),
                        metadata: conv.messages[0].metadata,
                        sender: {
                            id: conv.messages[0].sender.id,
                            username: conv.messages[0].sender.username,
                            profile: conv.messages[0].sender.profile,
                        },
                    }
                    : null,
                unreadCount,
                lastMessageAt: conv.lastMessageAt.toISOString(),
            };
        }));
        return {
            conversations: conversationPreviews,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + conversations.length < total,
        };
    }
    async getOrCreateConversation(userId, dto) {
        const { participantId, initialMessage } = dto;
        if (userId === participantId) {
            throw new common_1.BadRequestException('Cannot create conversation with yourself');
        }
        const participant = await this.prisma.user.findUnique({
            where: { id: participantId },
            include: {
                profile: true,
            },
        });
        if (!participant) {
            throw new common_1.NotFoundException('User not found');
        }
        const existingConversation = await this.prisma.conversation.findFirst({
            where: {
                OR: [
                    { participant1Id: userId, participant2Id: participantId },
                    { participant1Id: participantId, participant2Id: userId },
                ],
            },
            include: {
                participant1: {
                    include: {
                        profile: true,
                    },
                },
                participant2: {
                    include: {
                        profile: true,
                    },
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        let conversation;
        let message;
        if (existingConversation) {
            conversation = existingConversation;
        }
        else {
            conversation = await this.prisma.conversation.create({
                data: {
                    participant1Id: userId,
                    participant2Id: participantId,
                },
                include: {
                    participant1: {
                        include: {
                            profile: true,
                        },
                    },
                    participant2: {
                        include: {
                            profile: true,
                        },
                    },
                },
            });
        }
        if (initialMessage) {
            const newMessage = await this.prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    senderId: userId,
                    content: initialMessage,
                    type: client_1.MessageType.TEXT,
                    status: client_1.MessageStatus.SENT,
                },
                include: {
                    sender: {
                        include: {
                            profile: true,
                        },
                    },
                },
            });
            await this.prisma.conversation.update({
                where: { id: conversation.id },
                data: { lastMessageAt: new Date() },
            });
            message = {
                id: newMessage.id,
                conversationId: newMessage.conversationId,
                senderId: newMessage.senderId,
                content: newMessage.content,
                mediaUrl: newMessage.mediaUrl,
                mediaType: newMessage.mediaType,
                fileName: newMessage.fileName,
                fileSize: newMessage.fileSize,
                type: newMessage.type,
                status: newMessage.status,
                createdAt: newMessage.createdAt.toISOString(),
                readAt: newMessage.readAt?.toISOString(),
                metadata: newMessage.metadata,
                sender: {
                    id: newMessage.sender.id,
                    username: newMessage.sender.username,
                    profile: newMessage.sender.profile,
                },
            };
        }
        const conversationWithDetails = {
            id: conversation.id,
            participant1Id: conversation.participant1Id,
            participant2Id: conversation.participant2Id,
            lastMessageAt: conversation.lastMessageAt.toISOString(),
            createdAt: conversation.createdAt.toISOString(),
            participant1: {
                id: conversation.participant1.id,
                username: conversation.participant1.username,
                profile: conversation.participant1.profile,
            },
            participant2: {
                id: conversation.participant2.id,
                username: conversation.participant2.username,
                profile: conversation.participant2.profile,
            },
            lastMessage: message || conversation.messages[0],
            unreadCount: 0,
        };
        return {
            conversation: conversationWithDetails,
            message,
        };
    }
    async deleteConversation(userId, dto) {
        const { conversationId } = dto;
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.participant1Id !== userId &&
            conversation.participant2Id !== userId) {
            throw new common_1.ForbiddenException('You are not a participant in this conversation');
        }
        await this.prisma.conversation.delete({
            where: { id: conversationId },
        });
        return { message: 'Conversation deleted successfully' };
    }
    async sendMessage(userId, dto) {
        const { conversationId, recipientId, content, mediaUrl, type, metadata } = dto;
        if (!conversationId && !recipientId) {
            throw new common_1.BadRequestException('Must provide either conversationId or recipientId');
        }
        if (!content && !mediaUrl) {
            throw new common_1.BadRequestException('Message must have content or media');
        }
        let conversation;
        if (conversationId) {
            conversation = await this.prisma.conversation.findUnique({
                where: { id: conversationId },
                include: {
                    participant1: {
                        include: {
                            profile: true,
                        },
                    },
                    participant2: {
                        include: {
                            profile: true,
                        },
                    },
                },
            });
            if (!conversation) {
                throw new common_1.NotFoundException('Conversation not found');
            }
            if (conversation.participant1Id !== userId &&
                conversation.participant2Id !== userId) {
                throw new common_1.ForbiddenException('You are not a participant in this conversation');
            }
        }
        else if (recipientId) {
            const createResult = await this.getOrCreateConversation(userId, {
                participantId: recipientId,
            });
            conversation = createResult.conversation;
        }
        const message = await this.prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: userId,
                content,
                mediaUrl,
                mediaType: dto.mediaType,
                fileName: dto.fileName,
                fileSize: dto.fileSize,
                type,
                status: client_1.MessageStatus.SENT,
                metadata: metadata,
            },
            include: {
                sender: {
                    include: {
                        profile: true,
                    },
                },
            },
        });
        await this.prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() },
        });
        const messageWithSender = {
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            content: message.content,
            mediaUrl: message.mediaUrl,
            mediaType: message.mediaType,
            fileName: message.fileName,
            fileSize: message.fileSize,
            type: message.type,
            status: message.status,
            createdAt: message.createdAt.toISOString(),
            readAt: message.readAt?.toISOString(),
            metadata: message.metadata,
            sender: {
                id: message.sender.id,
                username: message.sender.username,
                profile: message.sender.profile,
            },
        };
        const unreadCount = await this.getUnreadCountForConversation(conversation.id, userId);
        const conversationWithDetails = {
            id: conversation.id,
            participant1Id: conversation.participant1Id,
            participant2Id: conversation.participant2Id,
            lastMessageAt: conversation.lastMessageAt.toISOString(),
            createdAt: conversation.createdAt.toISOString(),
            participant1: conversation.participant1,
            participant2: conversation.participant2,
            lastMessage: messageWithSender,
            unreadCount,
        };
        return {
            message: messageWithSender,
            conversation: conversationWithDetails,
        };
    }
    async getMessages(userId, dto) {
        const { conversationId, page = 1, limit = 50, before, after } = dto;
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.participant1Id !== userId &&
            conversation.participant2Id !== userId) {
            throw new common_1.ForbiddenException('You are not a participant in this conversation');
        }
        const where = { conversationId };
        if (before) {
            const beforeMessage = await this.prisma.message.findUnique({
                where: { id: before },
            });
            if (beforeMessage) {
                where.createdAt = { lt: beforeMessage.createdAt };
            }
        }
        if (after) {
            const afterMessage = await this.prisma.message.findUnique({
                where: { id: after },
            });
            if (afterMessage) {
                where.createdAt = { gt: afterMessage.createdAt };
            }
        }
        const total = await this.prisma.message.count({
            where: { conversationId },
        });
        const messages = await this.prisma.message.findMany({
            where,
            include: {
                sender: {
                    include: {
                        profile: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        const transformedMessages = messages.map((msg) => ({
            id: msg.id,
            conversationId: msg.conversationId,
            senderId: msg.senderId,
            content: msg.content,
            mediaUrl: msg.mediaUrl,
            mediaType: msg.mediaType,
            fileName: msg.fileName,
            fileSize: msg.fileSize,
            type: msg.type,
            status: msg.status,
            createdAt: msg.createdAt.toISOString(),
            readAt: msg.readAt?.toISOString(),
            metadata: msg.metadata,
            sender: {
                id: msg.sender.id,
                username: msg.sender.username,
                profile: msg.sender.profile,
            },
        }));
        const hasMoreBefore = before
            ? (await this.prisma.message.count({
                where: {
                    conversationId,
                    createdAt: { lt: messages[messages.length - 1]?.createdAt },
                },
            })) > 0
            : false;
        const hasMoreAfter = after
            ? (await this.prisma.message.count({
                where: {
                    conversationId,
                    createdAt: { gt: messages[0]?.createdAt },
                },
            })) > 0
            : false;
        return {
            messages: transformedMessages,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore: messages.length === limit,
            hasMoreBefore,
            hasMoreAfter,
        };
    }
    async markAsRead(userId, dto) {
        const { conversationId, messageIds } = dto;
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participant1: {
                    include: {
                        profile: true,
                    },
                },
                participant2: {
                    include: {
                        profile: true,
                    },
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        sender: {
                            include: {
                                profile: true,
                            },
                        },
                    },
                },
            },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.participant1Id !== userId &&
            conversation.participant2Id !== userId) {
            throw new common_1.ForbiddenException('You are not a participant in this conversation');
        }
        const where = {
            conversationId,
            senderId: { not: userId },
            status: { not: messaging_types_1.MessageStatus.READ },
        };
        if (messageIds && messageIds.length > 0) {
            where.id = { in: messageIds };
        }
        const result = await this.prisma.message.updateMany({
            where,
            data: {
                status: client_1.MessageStatus.READ,
                readAt: new Date(),
            },
        });
        const unreadCount = await this.getUnreadCountForConversation(conversationId, userId);
        const conversationWithDetails = {
            id: conversation.id,
            participant1Id: conversation.participant1Id,
            participant2Id: conversation.participant2Id,
            lastMessageAt: conversation.lastMessageAt.toISOString(),
            createdAt: conversation.createdAt.toISOString(),
            participant1: conversation.participant1,
            participant2: conversation.participant2,
            lastMessage: conversation.messages[0]
                ? {
                    id: conversation.messages[0].id,
                    conversationId: conversation.messages[0].conversationId,
                    senderId: conversation.messages[0].senderId,
                    content: conversation.messages[0].content,
                    mediaUrl: conversation.messages[0].mediaUrl,
                    mediaType: conversation.messages[0].mediaType,
                    fileName: conversation.messages[0].fileName,
                    fileSize: conversation.messages[0].fileSize,
                    type: conversation.messages[0].type,
                    status: conversation.messages[0].status,
                    createdAt: conversation.messages[0].createdAt.toISOString(),
                    readAt: conversation.messages[0].readAt?.toISOString(),
                    metadata: conversation.messages[0].metadata,
                    sender: {
                        id: conversation.messages[0].sender.id,
                        username: conversation.messages[0].sender.username,
                        profile: conversation.messages[0].sender.profile,
                    },
                }
                : null,
            unreadCount,
        };
        return {
            updatedCount: result.count,
            conversation: conversationWithDetails,
        };
    }
    async searchMessages(userId, dto) {
        const { conversationId, query, page = 1, limit = 20 } = dto;
        const skip = (page - 1) * limit;
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.participant1Id !== userId &&
            conversation.participant2Id !== userId) {
            throw new common_1.ForbiddenException('You are not a participant in this conversation');
        }
        const where = {
            conversationId,
            content: {
                contains: query,
                mode: 'insensitive',
            },
        };
        const total = await this.prisma.message.count({ where });
        const messages = await this.prisma.message.findMany({
            where,
            include: {
                sender: {
                    include: {
                        profile: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        const transformedMessages = messages.map((msg) => ({
            id: msg.id,
            conversationId: msg.conversationId,
            senderId: msg.senderId,
            content: msg.content,
            mediaUrl: msg.mediaUrl,
            mediaType: msg.mediaType,
            fileName: msg.fileName,
            fileSize: msg.fileSize,
            type: msg.type,
            status: msg.status,
            createdAt: msg.createdAt.toISOString(),
            readAt: msg.readAt?.toISOString(),
            metadata: msg.metadata,
            sender: {
                id: msg.sender.id,
                username: msg.sender.username,
                profile: msg.sender.profile,
            },
        }));
        return {
            messages: transformedMessages,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + messages.length < total,
        };
    }
    async deleteMessage(userId, dto) {
        const { messageId, conversationId } = dto;
        const message = await this.prisma.message.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        if (message.conversationId !== conversationId) {
            throw new common_1.BadRequestException('Message does not belong to this conversation');
        }
        if (message.senderId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own messages');
        }
        await this.prisma.message.update({
            where: { id: messageId },
            data: {
                content: 'This message has been deleted',
                mediaUrl: null,
                metadata: { deleted: true, deletedAt: new Date().toISOString() },
            },
        });
        return { message: 'Message deleted successfully' };
    }
    async getUnreadCount(userId) {
        const conversations = await this.prisma.conversation.findMany({
            where: {
                OR: [{ participant1Id: userId }, { participant2Id: userId }],
            },
            select: { id: true },
        });
        const conversationCounts = await Promise.all(conversations.map(async (conv) => ({
            conversationId: conv.id,
            unreadCount: await this.getUnreadCountForConversation(conv.id, userId),
        })));
        const totalUnread = conversationCounts.reduce((sum, conv) => sum + conv.unreadCount, 0);
        return {
            totalUnread,
            conversationCounts: conversationCounts.filter((c) => c.unreadCount > 0),
        };
    }
    async getUnreadCountForConversation(conversationId, userId) {
        return await this.prisma.message.count({
            where: {
                conversationId,
                senderId: { not: userId },
                status: { not: messaging_types_1.MessageStatus.READ },
            },
        });
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map