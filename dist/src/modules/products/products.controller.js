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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const platform_express_1 = require("@nestjs/platform-express");
let ProductsController = class ProductsController {
    constructor(productsService) {
        this.productsService = productsService;
    }
    create(createProductDto, currentUserId, sellerId) {
        if (sellerId && sellerId !== createProductDto.sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: You cannot create products for other sellers');
        }
        return this.productsService.create(createProductDto, currentUserId);
    }
    findAll(paginationDto, sellerId) {
        return this.productsService.findAll(paginationDto, sellerId);
    }
    async exportExcel(res, sellerId) {
        const buffer = await this.productsService.exportExcel(sellerId);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
        res.send(buffer);
    }
    importExcel(file, bodySellerId, currentUserId, tokenSellerId) {
        const activeSellerId = tokenSellerId || bodySellerId;
        if (!activeSellerId) {
            throw new common_1.ForbiddenException('Seller ID is required for import');
        }
        if (tokenSellerId && tokenSellerId !== activeSellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: You cannot import products to other sellers');
        }
        return this.productsService.importExcel(file.buffer, activeSellerId, currentUserId);
    }
    findOne(id, sellerId) {
        return this.productsService.findOne(id, sellerId);
    }
    update(id, updateProductDto, currentUserId, sellerId) {
        return this.productsService.update(id, updateProductDto, currentUserId, sellerId);
    }
    remove(id, currentUserId, sellerId) {
        return this.productsService.remove(id, currentUserId, sellerId);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('products.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new product SKU' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('products.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of products' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, permissions_decorator_1.RequirePermissions)('products.export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export products catalog to Excel' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "exportExcel", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, permissions_decorator_1.RequirePermissions)('products.import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                sellerId: { type: 'string', description: 'Seller ID to import products into (required for WMS admins)' },
            },
        },
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Import products from Excel sheet' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('sellerId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "importExcel", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('products.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details of a specific product' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('products.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product properties' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('products.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a product SKU' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
exports.ProductsController = ProductsController = __decorate([
    (0, swagger_1.ApiTags)('Products'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map