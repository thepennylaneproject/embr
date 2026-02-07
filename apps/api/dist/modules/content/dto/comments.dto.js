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
exports.CommentQueryDto = exports.UpdateCommentDto = exports.CreateCommentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateCommentDto {
}
exports.CreateCommentDto = CreateCommentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Comment content',
        example: 'Great post! Really enjoyed this.',
        minLength: 1,
        maxLength: 500,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: 'Comment cannot be empty' }),
    (0, class_validator_1.MaxLength)(500, { message: 'Comment must be less than 500 characters' }),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Parent comment ID for nested replies',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Parent ID must be a valid UUID' }),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "parentId", void 0);
class UpdateCommentDto {
}
exports.UpdateCommentDto = UpdateCommentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Updated comment content',
        example: 'Great post! Really enjoyed this. (edited)',
        minLength: 1,
        maxLength: 500,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: 'Comment cannot be empty' }),
    (0, class_validator_1.MaxLength)(500, { message: 'Comment must be less than 500 characters' }),
    __metadata("design:type", String)
], UpdateCommentDto.prototype, "content", void 0);
class CommentQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.CommentQueryDto = CommentQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page number',
        example: 1,
        minimum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CommentQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of comments per page',
        example: 20,
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CommentQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Parent comment ID to filter replies',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], CommentQueryDto.prototype, "parentId", void 0);
//# sourceMappingURL=comments.dto.js.map