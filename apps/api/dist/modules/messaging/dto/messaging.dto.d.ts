import { MessageType } from '../../../shared/types/messaging.types';
export declare class SendMessageDto {
    conversationId?: string;
    recipientId?: string;
    content?: string;
    mediaUrl?: string;
    mediaType?: string;
    fileName?: string;
    fileSize?: number;
    type: MessageType;
    metadata?: Record<string, any>;
}
export declare class MarkAsReadDto {
    conversationId: string;
    messageIds?: string[];
}
export declare class GetConversationsDto {
    page?: number;
    limit?: number;
    search?: string;
}
export declare class GetMessagesDto {
    conversationId: string;
    page?: number;
    limit?: number;
    before?: string;
    after?: string;
}
export declare class SearchMessagesDto {
    conversationId: string;
    query: string;
    page?: number;
    limit?: number;
}
export declare class CreateConversationDto {
    participantId: string;
    initialMessage?: string;
}
export declare class DeleteMessageDto {
    messageId: string;
    conversationId: string;
}
export declare class DeleteConversationDto {
    conversationId: string;
}
export declare class TypingIndicatorDto {
    conversationId: string;
    isTyping: boolean;
}
export declare class MediaUploadDto {
    conversationId: string;
    type: MessageType;
}
