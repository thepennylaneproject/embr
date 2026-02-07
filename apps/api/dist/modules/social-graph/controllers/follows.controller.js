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
exports.FollowsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const follows_service_1 = require("../services/follows.service");
const follow_dto_1 = require("../dto/follow.dto");
let FollowsController = class FollowsController {
    constructor(followsService) {
        this.followsService = followsService;
    }
    async followUser(req, dto) {
        return this.followsService.followUser(req.user.id, dto);
    }
    async unfollowUser(req, userId) {
        return this.followsService.unfollowUser(req.user.id, userId);
    }
    async getFollowers(userId, dto) {
        return this.followsService.getFollowers(userId, dto);
    }
    async getFollowing(userId, dto) {
        return this.followsService.getFollowing(userId, dto);
    }
    async checkFollowStatus(dto) {
        return this.followsService.checkFollowStatus(dto);
    }
    async batchCheckFollowStatus(req, dto) {
        return this.followsService.batchCheckFollowStatus(req.user.id, dto);
    }
    async getMutualConnections(req, dto) {
        return this.followsService.getMutualConnections(req.user.id, dto);
    }
    async getFollowCounts(userId) {
        return this.followsService.getFollowCounts(userId);
    }
    async getSuggestedFromNetwork(req, limit) {
        return this.followsService.getSuggestedFromNetwork(req.user.id, limit || 10);
    }
};
exports.FollowsController = FollowsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, follow_dto_1.FollowUserDto]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "followUser", null);
__decorate([
    (0, common_1.Delete)(':userId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "unfollowUser", null);
__decorate([
    (0, common_1.Get)('followers/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, follow_dto_1.GetFollowersDto]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getFollowers", null);
__decorate([
    (0, common_1.Get)('following/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, follow_dto_1.GetFollowingDto]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getFollowing", null);
__decorate([
    (0, common_1.Get)('check'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [follow_dto_1.CheckFollowDto]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "checkFollowStatus", null);
__decorate([
    (0, common_1.Post)('batch-check'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, follow_dto_1.BatchFollowCheckDto]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "batchCheckFollowStatus", null);
__decorate([
    (0, common_1.Get)('mutual'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, follow_dto_1.GetMutualConnectionsDto]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getMutualConnections", null);
__decorate([
    (0, common_1.Get)('counts/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getFollowCounts", null);
__decorate([
    (0, common_1.Get)('suggestions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getSuggestedFromNetwork", null);
exports.FollowsController = FollowsController = __decorate([
    (0, common_1.Controller)('follows'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [follows_service_1.FollowsService])
], FollowsController);
//# sourceMappingURL=follows.controller.js.map