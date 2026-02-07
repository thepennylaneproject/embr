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
exports.MilestonesController = exports.EscrowController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const escrow_service_1 = require("../services/escrow.service");
const gig_dto_1 = require("../dto/gig.dto");
let EscrowController = class EscrowController {
    constructor(escrowService) {
        this.escrowService = escrowService;
    }
    async getByApplication(applicationId) {
        return await this.escrowService.findByApplication(applicationId);
    }
    async findOne(id) {
        return await this.escrowService.findOne(id);
    }
    async fund(req, id, fundEscrowDto) {
        return await this.escrowService.fund(id, req.user.id, fundEscrowDto);
    }
    async releaseMilestone(req, id, releaseMilestoneDto) {
        return await this.escrowService.releaseMilestone(id, req.user.id, releaseMilestoneDto);
    }
    async getReleasedAmount(id) {
        const amount = await this.escrowService.getReleasedAmount(id);
        return { amount };
    }
};
exports.EscrowController = EscrowController;
__decorate([
    (0, common_1.Get)('application/:applicationId'),
    __param(0, (0, common_1.Param)('applicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EscrowController.prototype, "getByApplication", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EscrowController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/fund'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, gig_dto_1.FundEscrowDto]),
    __metadata("design:returntype", Promise)
], EscrowController.prototype, "fund", null);
__decorate([
    (0, common_1.Post)(':id/release-milestone'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, gig_dto_1.ReleaseMilestoneDto]),
    __metadata("design:returntype", Promise)
], EscrowController.prototype, "releaseMilestone", null);
__decorate([
    (0, common_1.Get)(':id/released-amount'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EscrowController.prototype, "getReleasedAmount", null);
exports.EscrowController = EscrowController = __decorate([
    (0, common_1.Controller)('escrow'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [escrow_service_1.EscrowService])
], EscrowController);
let MilestonesController = class MilestonesController {
    constructor(escrowService) {
        this.escrowService = escrowService;
    }
    async getMilestones(applicationId) {
        return await this.escrowService.getMilestones(applicationId);
    }
    async submit(req, id) {
        return await this.escrowService.submitMilestone(id, req.user.id);
    }
    async approve(req, id, feedback) {
        return await this.escrowService.approveMilestone(id, req.user.id, feedback);
    }
    async reject(req, id, feedback) {
        return await this.escrowService.rejectMilestone(id, req.user.id, feedback);
    }
};
exports.MilestonesController = MilestonesController;
__decorate([
    (0, common_1.Get)('application/:applicationId'),
    __param(0, (0, common_1.Param)('applicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "getMilestones", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('feedback')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('feedback')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "reject", null);
exports.MilestonesController = MilestonesController = __decorate([
    (0, common_1.Controller)('milestones'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [escrow_service_1.EscrowService])
], MilestonesController);
//# sourceMappingURL=escrow.controller.js.map