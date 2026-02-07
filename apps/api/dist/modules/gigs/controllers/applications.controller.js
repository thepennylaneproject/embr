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
exports.ApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const applications_service_1 = require("../services/applications.service");
const gig_dto_1 = require("../dto/gig.dto");
let ApplicationsController = class ApplicationsController {
    constructor(applicationsService) {
        this.applicationsService = applicationsService;
    }
    async create(req, createApplicationDto) {
        return await this.applicationsService.create(req.user.id, createApplicationDto);
    }
    async getMyApplications(req, page, limit) {
        return await this.applicationsService.findByApplicant(req.user.id, page, limit);
    }
    async getGigApplications(req, gigId, page, limit) {
        return await this.applicationsService.findByGig(gigId, req.user.id, page, limit);
    }
    async getStats(req) {
        return await this.applicationsService.getApplicantStats(req.user.id);
    }
    async findOne(id) {
        return await this.applicationsService.findOne(id);
    }
    async accept(req, id) {
        return await this.applicationsService.accept(id, req.user.id);
    }
    async reject(req, id) {
        return await this.applicationsService.reject(id, req.user.id);
    }
    async withdraw(req, id) {
        return await this.applicationsService.withdraw(id, req.user.id);
    }
};
exports.ApplicationsController = ApplicationsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, gig_dto_1.CreateApplicationDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my-applications'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getMyApplications", null);
__decorate([
    (0, common_1.Get)('gig/:gigId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('gigId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getGigApplications", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/accept'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "accept", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/withdraw'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "withdraw", null);
exports.ApplicationsController = ApplicationsController = __decorate([
    (0, common_1.Controller)('applications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService])
], ApplicationsController);
//# sourceMappingURL=applications.controller.js.map