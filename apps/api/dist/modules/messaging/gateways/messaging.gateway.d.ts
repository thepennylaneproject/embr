import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagingService } from '../services/messaging.service';
import { SendMessageDto, MarkAsReadDto, TypingIndicatorDto } from '../dto/messaging.dto';
interface AuthenticatedSocket extends Socket {
    userId?: string;
    username?: string;
}
export declare class MessagingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private messagingService;
    private jwtService;
    server: Server;
    private readonly logger;
    private userSockets;
    private typingTimeouts;
    constructor(messagingService: MessagingService, jwtService: JwtService);
    afterInit(server: Server): void;
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    handleSendMessage(client: AuthenticatedSocket, dto: SendMessageDto): Promise<void>;
    handleMessageDelivered(client: AuthenticatedSocket, data: {
        messageId: string;
        conversationId: string;
    }): Promise<void>;
    handleMarkAsRead(client: AuthenticatedSocket, dto: MarkAsReadDto): Promise<void>;
    handleBulkMarkAsRead(client: AuthenticatedSocket, data: {
        conversationIds: string[];
    }): Promise<void>;
    handleTypingStart(client: AuthenticatedSocket, dto: TypingIndicatorDto): Promise<void>;
    handleTypingStop(client: AuthenticatedSocket, dto: TypingIndicatorDto): Promise<void>;
    private isUserOnline;
    sendToUser(userId: string, event: string, data: any): void;
    getOnlineUsers(): string[];
    getUserConnectionCount(userId: string): number;
}
export {};
