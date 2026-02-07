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
exports.TipStatsDto = exports.GetTipsQueryDto = exports.CreateTipDto = exports.TipAmountPreset = void 0;
const class_validator_1 = require("class-validator");
var TipAmountPreset;
(function (TipAmountPreset) {
    TipAmountPreset["SMALL"] = "SMALL";
    TipAmountPreset["MEDIUM"] = "MEDIUM";
    TipAmountPreset["LARGE"] = "LARGE";
    TipAmountPreset["CUSTOM"] = "CUSTOM";
})(TipAmountPreset || (exports.TipAmountPreset = TipAmountPreset = {}));
class CreateTipDto {
}
exports.CreateTipDto = CreateTipDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTipDto.prototype, "recipientId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTipDto.prototype, "postId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.5),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], CreateTipDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipAmountPreset),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTipDto.prototype, "preset", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTipDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTipDto.prototype, "paymentMethodId", void 0);
class GetTipsQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.GetTipsQueryDto = GetTipsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['sent', 'received']),
    __metadata("design:type", String)
], GetTipsQueryDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GetTipsQueryDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GetTipsQueryDto.prototype, "postId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetTipsQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GetTipsQueryDto.prototype, "limit", void 0);
class TipStatsDto {
}
exports.TipStatsDto = TipStatsDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TipStatsDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TipStatsDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TipStatsDto.prototype, "endDate", void 0);
//# sourceMappingURL=tip.dto.js.map