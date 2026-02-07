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
exports.SimilarUsersDto = exports.GetTrendingCreatorsDto = exports.GetRecommendedUsersDto = exports.SearchUsersDto = exports.AvailabilityFilter = exports.UserSearchSortBy = void 0;
const class_validator_1 = require("class-validator");
var UserSearchSortBy;
(function (UserSearchSortBy) {
    UserSearchSortBy["RELEVANCE"] = "relevance";
    UserSearchSortBy["FOLLOWERS"] = "followers";
    UserSearchSortBy["RECENT"] = "recent";
    UserSearchSortBy["ENGAGEMENT"] = "engagement";
})(UserSearchSortBy || (exports.UserSearchSortBy = UserSearchSortBy = {}));
var AvailabilityFilter;
(function (AvailabilityFilter) {
    AvailabilityFilter["AVAILABLE"] = "available";
    AvailabilityFilter["BUSY"] = "busy";
    AvailabilityFilter["ANY"] = "any";
})(AvailabilityFilter || (exports.AvailabilityFilter = AvailabilityFilter = {}));
class SearchUsersDto {
    constructor() {
        this.sortBy = UserSearchSortBy.RELEVANCE;
        this.page = 1;
        this.limit = 20;
    }
}
exports.SearchUsersDto = SearchUsersDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchUsersDto.prototype, "query", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchUsersDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SearchUsersDto.prototype, "skills", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(AvailabilityFilter),
    __metadata("design:type", String)
], SearchUsersDto.prototype, "availability", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SearchUsersDto.prototype, "verified", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(UserSearchSortBy),
    __metadata("design:type", String)
], SearchUsersDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SearchUsersDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SearchUsersDto.prototype, "limit", void 0);
class GetRecommendedUsersDto {
    constructor() {
        this.limit = 10;
    }
}
exports.GetRecommendedUsersDto = GetRecommendedUsersDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetRecommendedUsersDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetRecommendedUsersDto.prototype, "context", void 0);
class GetTrendingCreatorsDto {
    constructor() {
        this.timeframe = 'week';
        this.limit = 20;
    }
}
exports.GetTrendingCreatorsDto = GetTrendingCreatorsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['day', 'week', 'month']),
    __metadata("design:type", String)
], GetTrendingCreatorsDto.prototype, "timeframe", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetTrendingCreatorsDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetTrendingCreatorsDto.prototype, "limit", void 0);
class SimilarUsersDto {
    constructor() {
        this.limit = 10;
    }
}
exports.SimilarUsersDto = SimilarUsersDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SimilarUsersDto.prototype, "limit", void 0);
//# sourceMappingURL=discovery.dto.js.map