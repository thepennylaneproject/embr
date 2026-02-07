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
exports.ProcessPayoutDto = exports.GetPayoutsQueryDto = exports.ApprovePayoutDto = exports.CreatePayoutRequestDto = exports.PayoutStatus = void 0;
const class_validator_1 = require("class-validator");
var PayoutStatus;
(function (PayoutStatus) {
    PayoutStatus["PENDING"] = "PENDING";
    PayoutStatus["APPROVED"] = "APPROVED";
    PayoutStatus["PROCESSING"] = "PROCESSING";
    PayoutStatus["COMPLETED"] = "COMPLETED";
    PayoutStatus["REJECTED"] = "REJECTED";
    PayoutStatus["FAILED"] = "FAILED";
})(PayoutStatus || (exports.PayoutStatus = PayoutStatus = {}));
class CreatePayoutRequestDto {
}
exports.CreatePayoutRequestDto = CreatePayoutRequestDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(10),
    __metadata("design:type", Number)
], CreatePayoutRequestDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePayoutRequestDto.prototype, "note", void 0);
class ApprovePayoutDto {
    constructor() {
        this.approve = true;
    }
}
exports.ApprovePayoutDto = ApprovePayoutDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApprovePayoutDto.prototype, "payoutRequestId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ApprovePayoutDto.prototype, "approve", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ApprovePayoutDto.prototype, "rejectionReason", void 0);
class GetPayoutsQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.GetPayoutsQueryDto = GetPayoutsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PayoutStatus),
    __metadata("design:type", String)
], GetPayoutsQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GetPayoutsQueryDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetPayoutsQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GetPayoutsQueryDto.prototype, "limit", void 0);
class ProcessPayoutDto {
}
exports.ProcessPayoutDto = ProcessPayoutDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProcessPayoutDto.prototype, "payoutId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProcessPayoutDto.prototype, "stripePayoutId", void 0);
//# sourceMappingURL=payout.dto.js.map