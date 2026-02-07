export declare class CreateCommentDto {
    content: string;
    parentId?: string;
}
export declare class UpdateCommentDto {
    content: string;
}
export declare class CommentQueryDto {
    page?: number;
    limit?: number;
    parentId?: string;
}
