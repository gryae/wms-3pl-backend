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
exports.UpdateOutboundDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const create_outbound_dto_1 = require("./create-outbound.dto");
class UpdateOutboundDto {
}
exports.UpdateOutboundDto = UpdateOutboundDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.OutboundType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.OutboundType),
    __metadata("design:type", String)
], UpdateOutboundDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Rini Andriyani' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOutboundDto.prototype, "recipientName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '085299887766' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOutboundDto.prototype, "recipientPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Jl. Merdeka No. 45, RT 02/05, Kel. Gambir' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOutboundDto.prototype, "recipientAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Jakarta Pusat' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOutboundDto.prototype, "recipientCity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'DKI Jakarta' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOutboundDto.prototype, "recipientProvince", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '10110' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOutboundDto.prototype, "recipientPostcode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'clh8123abc456def789' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOutboundDto.prototype, "courierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '0.00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateOutboundDto.prototype, "shippingCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '0.00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateOutboundDto.prototype, "codAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOutboundDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [create_outbound_dto_1.OutboundItemDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_outbound_dto_1.OutboundItemDto),
    __metadata("design:type", Array)
], UpdateOutboundDto.prototype, "items", void 0);
//# sourceMappingURL=update-outbound.dto.js.map