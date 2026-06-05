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
exports.UpdatePreferenceDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class UpdatePreferenceDto {
}
exports.UpdatePreferenceDto = UpdatePreferenceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.Language, default: client_1.Language.EN }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.Language),
    __metadata("design:type", String)
], UpdatePreferenceDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'light' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePreferenceDto.prototype, "theme", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'Asia/Jakarta' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePreferenceDto.prototype, "timezone", void 0);
//# sourceMappingURL=update-preference.dto.js.map