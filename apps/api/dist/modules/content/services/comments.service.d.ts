import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from '../dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class CommentsService {
    private readonly prisma;
    private readonly eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    createComment(postId: string, userId: string, createCommentDto: CreateCommentDto): Promise<{
        id: any;
        postId: any;
        authorId: any;
        author: {
            id: any;
            username: any;
            profile: {
                displayName: any;
                avatarUrl: any;
            };
        };
        content: any;
        parentId: any;
        likeCount: any;
        replyCount: any;
        isLiked: boolean;
        createdAt: any;
        updatedAt: any;
    }>;
    getComments(postId: string, params: {
        page: number;
        limit: number;
        parentId?: string;
    }, userId?: string): Promise<{
        data: {
            id: any;
            postId: any;
            authorId: any;
            author: {
                id: any;
                username: any;
                profile: {
                    displayName: any;
                    avatarUrl: any;
                };
            };
            content: any;
            parentId: any;
            likeCount: any;
            replyCount: any;
            isLiked: boolean;
            createdAt: any;
            updatedAt: any;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
        };
    }>;
    getReplies(postId: string, commentId: string, params: {
        page: number;
        limit: number;
    }, userId?: string): Promise<{
        data: {
            id: any;
            postId: any;
            authorId: any;
            author: {
                id: any;
                username: any;
                profile: {
                    displayName: any;
                    avatarUrl: any;
                };
            };
            content: any;
            parentId: any;
            likeCount: any;
            replyCount: any;
            isLiked: boolean;
            createdAt: any;
            updatedAt: any;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
        };
    }>;
    getComment(commentId: string, userId?: string): Promise<{
        id: any;
        postId: any;
        authorId: any;
        author: {
            id: any;
            username: any;
            profile: {
                displayName: any;
                avatarUrl: any;
            };
        };
        content: any;
        parentId: any;
        likeCount: any;
        replyCount: any;
        isLiked: boolean;
        createdAt: any;
        updatedAt: any;
    }>;
    updateComment(commentId: string, userId: string, updateCommentDto: UpdateCommentDto): Promise<{
        id: any;
        postId: any;
        authorId: any;
        author: {
            id: any;
            username: any;
            profile: {
                displayName: any;
                avatarUrl: any;
            };
        };
        content: any;
        parentId: any;
        likeCount: any;
        replyCount: any;
        isLiked: boolean;
        createdAt: any;
        updatedAt: any;
    }>;
    deleteComment(commentId: string, userId: string): Promise<void>;
    likeComment(commentId: string, userId: string): Promise<{
        message: string;
    }>;
    unlikeComment(commentId: string, userId: string): Promise<{
        message: string;
    }>;
    private formatComment;
}
