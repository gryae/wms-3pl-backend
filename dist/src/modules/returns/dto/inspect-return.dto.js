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
exports.InspectReturnDto = exports.InspectReturnItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class InspectReturnItemDto {
}
exports.InspectReturnItemDto = InspectReturnItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clh8123abc456def789' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InspectReturnItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Good items restock to available' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InspectReturnItemDto.prototype, "goodQty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Damaged items restock to damaged' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InspectReturnItemDto.prototype, "damagedQty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, description: 'Reject items restock to reject' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InspectReturnItemDto.prototype, "rejectQty", void 0);
class InspectReturnDto {
}
exports.InspectReturnDto = InspectReturnDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [InspectReturnItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => InspectReturnItemDto),
    __metadata("design:type", Array)
], InspectReturnDto.prototype, "items", void 0);
//# sourceMappingURL=inspect-return.dto.js.map