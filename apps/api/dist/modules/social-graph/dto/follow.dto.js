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
exports.BatchFollowCheckDto = exports.GetMutualConnectionsDto = exports.CheckFollowDto = exports.GetFollowingDto = exports.GetFollowersDto = exports.FollowUserDto = void 0;
const class_validator_1 = require("class-validator");
class FollowUserDto {
}
exports.FollowUserDto = FollowUserDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], FollowUserDto.prototype, "followingId", void 0);
class GetFollowersDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.GetFollowersDto = GetFollowersDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetFollowersDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetFollowersDto.prototype, "limit", void 0);
class GetFollowingDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.GetFollowingDto = GetFollowingDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetFollowingDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetFollowingDto.prototype, "limit", void 0);
class CheckFollowDto {
}
exports.CheckFollowDto = CheckFollowDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CheckFollowDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CheckFollowDto.prototype, "targetUserId", void 0);
class GetMutualConnectionsDto {
    constructor() {
        this.limit = 10;
    }
}
exports.GetMutualConnectionsDto = GetMutualConnectionsDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GetMutualConnectionsDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetMutualConnectionsDto.prototype, "limit", void 0);
class BatchFollowCheckDto {
}
exports.BatchFollowCheckDto = BatchFollowCheckDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(undefined, { each: true }),
    __metadata("design:type", Array)
], BatchFollowCheckDto.prototype, "userIds", void 0);
//# sourceMappingURL=follow.dto.js.map