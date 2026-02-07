import { CommentsService } from '../services/comments.service';
import { CreateCommentDto, UpdateCommentDto } from '../dto';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    createComment(postId: string, createCommentDto: CreateCommentDto, req: any): Promise<{
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
    getComments(postId: string, page?: number, limit?: number, parentId?: string, req?: any): Promise<{
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
    getReplies(postId: string, commentId: string, page?: number, limit?: number, req?: any): Promise<{
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
    getComment(postId: string, commentId: string, req?: any): Promise<{
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
    updateComment(postId: string, commentId: string, updateCommentDto: UpdateCommentDto, req: any): Promise<{
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
    deleteComment(postId: string, commentId: string, req: any): Promise<void>;
    likeComment(postId: string, commentId: string, req: any): Promise<{
        message: string;
    }>;
    unlikeComment(postId: string, commentId: string, req: any): Promise<void>;
}
