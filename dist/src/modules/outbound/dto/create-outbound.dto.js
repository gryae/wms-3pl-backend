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
exports.CreateOutboundDto = exports.OutboundItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class OutboundItemDto {
}
exports.OutboundItemDto = OutboundItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clh8123abc456def789' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OutboundItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], OutboundItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OutboundItemDto.prototype, "notes", void 0);
class CreateOutboundDto {
    constructor() {
        this.type = client_1.OutboundType.MANUAL;
    }
}
exports.CreateOutboundDto = CreateOutboundDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clh8123abc456def789' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOutboundDto.prototype, "sellerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.OutboundType, default: client_1.OutboundType.MANUAL }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.OutboundType),
    __metadata("design:type", String)
], CreateOutboundDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Rini Andriyani' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOutboundDto.prototype, "recipientName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '085299887766' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOutboundDto.prototype, "recipientPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jl. Merdeka No. 45, RT 02/05, Kel. Gambir' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOutboundDto.prototype, "recipientAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Jakarta Pusat' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOutboundDto.prototype, "recipientCity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'DKI Jakarta' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOutboundDto.prototype, "recipientProvince", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '10110' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOutboundDto.prototype, "recipientPostcode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'clh8123abc456def789', description: 'Courier ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOutboundDto.prototype, "courierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '0.00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateOutboundDto.prototype, "shippingCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '0.00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateOutboundDto.prototype, "codAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOutboundDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [OutboundItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OutboundItemDto),
    __metadata("design:type", Array)
], CreateOutboundDto.prototype, "items", void 0);
//# sourceMappingURL=create-outbound.dto.js.map