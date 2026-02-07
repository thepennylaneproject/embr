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
exports.UserDiscoveryController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const optional_jwt_auth_guard_1 = require("../../auth/guards/optional-jwt-auth.guard");
const user_discovery_service_1 = require("../services/user-discovery.service");
const discovery_dto_1 = require("../dto/discovery.dto");
let UserDiscoveryController = class UserDiscoveryController {
    constructor(discoveryService) {
        this.discoveryService = discoveryService;
    }
    async searchUsers(req, dto) {
        const userId = req.user?.id || null;
        return this.discoveryService.searchUsers(userId, dto);
    }
    async getRecommendedUsers(req, dto) {
        return this.discoveryService.getRecommendedUsers(req.user.id, dto);
    }
    async getTrendingCreators(dto) {
        return this.discoveryService.getTrendingCreators(dto);
    }
    async getSimilarUsers(req, dto) {
        return this.discoveryService.getSimilarUsers(req.user.id, dto);
    }
};
exports.UserDiscoveryController = UserDiscoveryController;
__decorate([
    (0, common_1.Get)('search'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, discovery_dto_1.SearchUsersDto]),
    __metadata("design:returntype", Promise)
], UserDiscoveryController.prototype, "searchUsers", null);
__decorate([
    (0, common_1.Get)('recommended'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, discovery_dto_1.GetRecommendedUsersDto]),
    __metadata("design:returntype", Promise)
], UserDiscoveryController.prototype, "getRecommendedUsers", null);
__decorate([
    (0, common_1.Get)('trending'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [discovery_dto_1.GetTrendingCreatorsDto]),
    __metadata("design:returntype", Promise)
], UserDiscoveryController.prototype, "getTrendingCreators", null);
__decorate([
    (0, common_1.Get)('similar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, discovery_dto_1.SimilarUsersDto]),
    __metadata("design:returntype", Promise)
], UserDiscoveryController.prototype, "getSimilarUsers", null);
exports.UserDiscoveryController = UserDiscoveryController = __decorate([
    (0, common_1.Controller)('discovery'),
    __metadata("design:paramtypes", [user_discovery_service_1.UserDiscoveryService])
], UserDiscoveryController);
//# sourceMappingURL=user-discovery.controller.js.map