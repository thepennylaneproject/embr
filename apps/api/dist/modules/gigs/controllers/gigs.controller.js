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
exports.GigsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const gigs_service_1 = require("../services/gigs.service");
const gig_dto_1 = require("../dto/gig.dto");
let GigsController = class GigsController {
    constructor(gigsService) {
        this.gigsService = gigsService;
    }
    async create(req, createGigDto) {
        return await this.gigsService.create(req.user.id, createGigDto);
    }
    async publish(req, id) {
        return await this.gigsService.publish(id, req.user.id);
    }
    async findAll(searchDto) {
        return await this.gigsService.findAll(searchDto);
    }
    async getMyGigs(req, page, limit) {
        return await this.gigsService.findByCreator(req.user.id, page, limit);
    }
    async getRecommended(req, limit) {
        return await this.gigsService.getRecommendedGigs(req.user.id, limit);
    }
    async getStats(req) {
        return await this.gigsService.getCreatorStats(req.user.id);
    }
    async findOne(id) {
        this.gigsService.incrementViews(id).catch(() => { });
        return await this.gigsService.findOne(id);
    }
    async findByCreator(creatorId, page, limit) {
        return await this.gigsService.findByCreator(creatorId, page, limit);
    }
    async update(req, id, updateGigDto) {
        return await this.gigsService.update(id, req.user.id, updateGigDto);
    }
    async cancel(req, id) {
        return await this.gigsService.cancel(id, req.user.id);
    }
    async complete(req, id) {
        return await this.gigsService.markCompleted(id, req.user.id);
    }
    async remove(req, id) {
        return await this.gigsService.remove(id, req.user.id);
    }
};
exports.GigsController = GigsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, gig_dto_1.CreateGigDto]),
    __metadata("design:returntype", Promise)
], GigsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GigsController.prototype, "publish", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [gig_dto_1.GigSearchDto]),
    __metadata("design:returntype", Promise)
], GigsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-gigs'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], GigsController.prototype, "getMyGigs", null);
__decorate([
    (0, common_1.Get)('recommended'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], GigsController.prototype, "getRecommended", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GigsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GigsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('creator/:creatorId'),
    __param(0, (0, common_1.Param)('creatorId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], GigsController.prototype, "findByCreator", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, gig_dto_1.UpdateGigDto]),
    __metadata("design:returntype", Promise)
], GigsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GigsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GigsController.prototype, "complete", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GigsController.prototype, "remove", null);
exports.GigsController = GigsController = __decorate([
    (0, common_1.Controller)('gigs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [gigs_service_1.GigsService])
], GigsController);
//# sourceMappingURL=gigs.controller.js.map