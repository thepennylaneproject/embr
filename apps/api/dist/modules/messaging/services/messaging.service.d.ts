import { PrismaService } from '../../prisma/prisma.service';
import { SendMessageDto, MarkAsReadDto, GetConversationsDto, GetMessagesDto, SearchMessagesDto, CreateConversationDto, DeleteMessageDto, DeleteConversationDto } from '../dto/messaging.dto';
import { GetConversationsResponse, GetMessagesResponse, SearchMessagesResponse, SendMessageResponse, MarkAsReadResponse, CreateConversationResponse, GetUnreadCountResponse } from '../../../shared/types/messaging.types';
export declare class MessagingService {
    private prisma;
    constructor(prisma: PrismaService);
    getConversations(userId: string, dto: GetConversationsDto): Promise<GetConversationsResponse>;
    getOrCreateConversation(userId: string, dto: CreateConversationDto): Promise<CreateConversationResponse>;
    deleteConversation(userId: string, dto: DeleteConversationDto): Promise<{
        message: string;
    }>;
    sendMessage(userId: string, dto: SendMessageDto): Promise<SendMessageResponse>;
    getMessages(userId: string, dto: GetMessagesDto): Promise<GetMessagesResponse>;
    markAsRead(userId: string, dto: MarkAsReadDto): Promise<MarkAsReadResponse>;
    searchMessages(userId: string, dto: SearchMessagesDto): Promise<SearchMessagesResponse>;
    deleteMessage(userId: string, dto: DeleteMessageDto): Promise<{
        message: string;
    }>;
    getUnreadCount(userId: string): Promise<GetUnreadCountResponse>;
    private getUnreadCountForConversation;
}
