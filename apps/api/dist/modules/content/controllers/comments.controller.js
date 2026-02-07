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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsController = void 0;
const common_1 = require("@nestjs/common");
const comments_service_1 = require("../services/comments.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const dto_1 = require("../dto");
const swagger_1 = require("@nestjs/swagger");
let CommentsController = class CommentsController {
    constructor(commentsService) {
        this.commentsService = commentsService;
    }
    async createComment(postId, createCommentDto, req) {
        return this.commentsService.createComment(postId, req.user.userId, createCommentDto);
    }
    async getComments(postId, page = 1, limit = 20, parentId, req) {
        const userId = req?.user?.userId;
        return this.commentsService.getComments(postId, { page, limit, parentId }, userId);
    }
    async getReplies(postId, commentId, page = 1, limit = 20, req) {
        const userId = req?.user?.userId;
        return this.commentsService.getReplies(postId, commentId, { page, limit }, userId);
    }
    async getComment(postId, commentId, req) {
        const userId = req?.user?.userId;
        return this.commentsService.getComment(commentId, userId);
    }
    async updateComment(postId, commentId, updateCommentDto, req) {
        return this.commentsService.updateComment(commentId, req.user.userId, updateCommentDto);
    }
    async deleteComment(postId, commentId, req) {
        await this.commentsService.deleteComment(commentId, req.user.userId);
    }
    async likeComment(postId, commentId, req) {
        return this.commentsService.likeComment(commentId, req.user.userId);
    }
    async unlikeComment(postId, commentId, req) {
        await this.commentsService.unlikeComment(commentId, req.user.userId);
    }
};
exports.CommentsController = CommentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new comment on a post' }),
    (0, swagger_1.ApiParam)({ name: 'postId', description: 'Post ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Comment created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Post not found' }),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateCommentDto, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "createComment", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get comments for a post' }),
    (0, swagger_1.ApiParam)({ name: 'postId', description: 'Post ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'parentId', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comments retrieved successfully' }),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('parentId')),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "getComments", null);
__decorate([
    (0, common_1.Get)(':commentId/replies'),
    (0, swagger_1.ApiOperation)({ summary: 'Get replies to a comment' }),
    (0, swagger_1.ApiParam)({ name: 'postId', description: 'Post ID' }),
    (0, swagger_1.ApiParam)({ name: 'commentId', description: 'Parent comment ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Replies retrieved successfully' }),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Param)('commentId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "getReplies", null);
__decorate([
    (0, common_1.Get)(':commentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific comment' }),
    (0, swagger_1.ApiParam)({ name: 'postId', description: 'Post ID' }),
    (0, swagger_1.ApiParam)({ name: 'commentId', description: 'Comment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comment retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Comment not found' }),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Param)('commentId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "getComment", null);
__decorate([
    (0, common_1.Patch)(':commentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a comment' }),
    (0, swagger_1.ApiParam)({ name: 'postId', description: 'Post ID' }),
    (0, swagger_1.ApiParam)({ name: 'commentId', description: 'Comment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comment updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not authorized to update this comment' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Comment not found' }),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Param)('commentId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateCommentDto, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "updateComment", null);
__decorate([
    (0, common_1.Delete)(':commentId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a comment' }),
    (0, swagger_1.ApiParam)({ name: 'postId', description: 'Post ID' }),
    (0, swagger_1.ApiParam)({ name: 'commentId', description: 'Comment ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Comment deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not authorized to delete this comment' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Comment not found' }),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Param)('commentId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.Post)(':commentId/like'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Like a comment' }),
    (0, swagger_1.ApiParam)({ name: 'postId', description: 'Post ID' }),
    (0, swagger_1.ApiParam)({ name: 'commentId', description: 'Comment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comment liked successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Comment not found' }),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Param)('commentId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "likeComment", null);
__decorate([
    (0, common_1.Delete)(':commentId/like'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Unlike a comment' }),
    (0, swagger_1.ApiParam)({ name: 'postId', description: 'Post ID' }),
    (0, swagger_1.ApiParam)({ name: 'commentId', description: 'Comment ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Comment unliked successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Comment not found' }),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Param)('commentId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "unlikeComment", null);
exports.CommentsController = CommentsController = __decorate([
    (0, swagger_1.ApiTags)('comments'),
    (0, common_1.Controller)('posts/:postId/comments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [comments_service_1.CommentsService])
], CommentsController);
//# sourceMappingURL=comments.controller.js.map