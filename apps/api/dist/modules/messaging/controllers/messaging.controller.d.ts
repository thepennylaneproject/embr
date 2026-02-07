import { MessagingService } from '../services/messaging.service';
import { UploadService } from '../../upload/upload.service';
import { SendMessageDto, MarkAsReadDto, GetConversationsDto, GetMessagesDto, SearchMessagesDto, CreateConversationDto, MediaUploadDto } from '../dto/messaging.dto';
export declare class MessagingController {
    private messagingService;
    private uploadService;
    constructor(messagingService: MessagingService, uploadService: UploadService);
    getConversations(req: any, dto: GetConversationsDto): Promise<import("../../../shared/types/messaging.types").GetConversationsResponse>;
    createConversation(req: any, dto: CreateConversationDto): Promise<import("../../../shared/types/messaging.types").CreateConversationResponse>;
    deleteConversation(req: any, conversationId: string): Promise<{
        message: string;
    }>;
    sendMessage(req: any, dto: SendMessageDto): Promise<import("../../../shared/types/messaging.types").SendMessageResponse>;
    getMessages(req: any, conversationId: string, query: Omit<GetMessagesDto, 'conversationId'>): Promise<import("../../../shared/types/messaging.types").GetMessagesResponse>;
    markAsRead(req: any, dto: MarkAsReadDto): Promise<import("../../../shared/types/messaging.types").MarkAsReadResponse>;
    deleteMessage(req: any, messageId: string, conversationId: string): Promise<{
        message: string;
    }>;
    searchMessages(req: any, conversationId: string, query: Omit<SearchMessagesDto, 'conversationId'>): Promise<import("../../../shared/types/messaging.types").SearchMessagesResponse>;
    getUnreadCount(req: any): Promise<import("../../../shared/types/messaging.types").GetUnreadCountResponse>;
    uploadMedia(req: any, file: Express.Multer.File, dto: MediaUploadDto): Promise<{
        url: string;
        mediaType: string;
        fileName: string;
        fileSize: number;
        type: "IMAGE" | "VIDEO" | "FILE";
        conversationId: string;
    }>;
    private getAllowedFileTypes;
}
