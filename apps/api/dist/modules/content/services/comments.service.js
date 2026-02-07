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
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let CommentsService = class CommentsService {
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async createComment(postId, userId, createCommentDto) {
        const { content, parentId } = createCommentDto;
        const post = await this.prisma.post.findUnique({
            where: { id: postId, deletedAt: null },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (parentId) {
            const parentComment = await this.prisma.comment.findUnique({
                where: { id: parentId, postId, deletedAt: null },
            });
            if (!parentComment) {
                throw new common_1.NotFoundException('Parent comment not found');
            }
        }
        const comment = await this.prisma.comment.create({
            data: {
                postId,
                authorId: userId,
                content,
                parentId,
            },
            include: {
                author: {
                    include: {
                        profile: {
                            select: {
                                displayName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });
        await this.prisma.post.update({
            where: { id: postId },
            data: { commentCount: { increment: 1 } },
        });
        this.eventEmitter.emit('comment.created', {
            commentId: comment.id,
            postId,
            authorId: userId,
            postAuthorId: post.authorId,
            parentId,
        });
        return this.formatComment(comment, userId);
    }
    async getComments(postId, params, userId) {
        const { page = 1, limit = 20, parentId } = params;
        const skip = (page - 1) * limit;
        const post = await this.prisma.post.findUnique({
            where: { id: postId, deletedAt: null },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        const where = {
            postId,
            parentId: parentId || null,
            deletedAt: null,
        };
        const [comments, total] = await Promise.all([
            this.prisma.comment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        include: {
                            profile: {
                                select: {
                                    displayName: true,
                                    avatarUrl: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            replies: {
                                where: { deletedAt: null },
                            },
                        },
                    },
                },
            }),
            this.prisma.comment.count({ where }),
        ]);
        const formattedComments = await Promise.all(comments.map((comment) => this.formatComment(comment, userId)));
        return {
            data: formattedComments,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + comments.length < total,
            },
        };
    }
    async getReplies(postId, commentId, params, userId) {
        const parentComment = await this.prisma.comment.findUnique({
            where: { id: commentId, postId, deletedAt: null },
        });
        if (!parentComment) {
            throw new common_1.NotFoundException('Parent comment not found');
        }
        return this.getComments(postId, { ...params, parentId: commentId }, userId);
    }
    async getComment(commentId, userId) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId, deletedAt: null },
            include: {
                author: {
                    include: {
                        profile: {
                            select: {
                                displayName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        replies: {
                            where: { deletedAt: null },
                        },
                    },
                },
            },
        });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        return this.formatComment(comment, userId);
    }
    async updateComment(commentId, userId, updateCommentDto) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId, deletedAt: null },
        });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        if (comment.authorId !== userId) {
            throw new common_1.ForbiddenException('Not authorized to update this comment');
        }
        const updatedComment = await this.prisma.comment.update({
            where: { id: commentId },
            data: { content: updateCommentDto.content },
            include: {
                author: {
                    include: {
                        profile: {
                            select: {
                                displayName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });
        return this.formatComment(updatedComment, userId);
    }
    async deleteComment(commentId, userId) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId, deletedAt: null },
        });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        if (comment.authorId !== userId) {
            throw new common_1.ForbiddenException('Not authorized to delete this comment');
        }
        await this.prisma.comment.update({
            where: { id: commentId },
            data: { deletedAt: new Date() },
        });
        await this.prisma.post.update({
            where: { id: comment.postId },
            data: { commentCount: { decrement: 1 } },
        });
        this.eventEmitter.emit('comment.deleted', {
            commentId,
            postId: comment.postId,
            authorId: userId,
        });
    }
    async likeComment(commentId, userId) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId, deletedAt: null },
        });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        const existingLike = await this.prisma.like.findUnique({
            where: {
                userId_commentId: {
                    userId,
                    commentId,
                },
            },
        });
        if (existingLike) {
            throw new common_1.BadRequestException('Comment already liked');
        }
        await this.prisma.like.create({
            data: {
                userId,
                commentId,
            },
        });
        await this.prisma.comment.update({
            where: { id: commentId },
            data: { likeCount: { increment: 1 } },
        });
        this.eventEmitter.emit('comment.liked', {
            commentId,
            userId,
            authorId: comment.authorId,
        });
        return { message: 'Comment liked successfully' };
    }
    async unlikeComment(commentId, userId) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId, deletedAt: null },
        });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        const like = await this.prisma.like.findUnique({
            where: {
                userId_commentId: {
                    userId,
                    commentId,
                },
            },
        });
        if (!like) {
            throw new common_1.BadRequestException('Comment not liked');
        }
        await this.prisma.like.delete({
            where: { id: like.id },
        });
        await this.prisma.comment.update({
            where: { id: commentId },
            data: { likeCount: { decrement: 1 } },
        });
        return { message: 'Comment unliked successfully' };
    }
    async formatComment(comment, userId) {
        const isLiked = userId
            ? await this.prisma.like.findUnique({
                where: {
                    userId_commentId: {
                        userId,
                        commentId: comment.id,
                    },
                },
            }).then(Boolean)
            : false;
        return {
            id: comment.id,
            postId: comment.postId,
            authorId: comment.authorId,
            author: {
                id: comment.author.id,
                username: comment.author.username,
                profile: {
                    displayName: comment.author.profile.displayName,
                    avatarUrl: comment.author.profile.avatarUrl,
                },
            },
            content: comment.content,
            parentId: comment.parentId,
            likeCount: comment.likeCount,
            replyCount: comment._count?.replies || 0,
            isLiked,
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString(),
        };
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], CommentsService);
//# sourceMappingURL=comments.service.js.map