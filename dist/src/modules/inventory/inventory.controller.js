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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inventory_service_1 = require("./inventory.service");
const inventory_adjustment_dto_1 = require("./dto/inventory-adjustment.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    getBalances(paginationDto, sellerId) {
        return this.inventoryService.getBalances(paginationDto, sellerId);
    }
    getMovements(paginationDto, sellerId) {
        return this.inventoryService.getMovements(paginationDto, sellerId);
    }
    async adjustStock(dto, currentUserId, tokenSellerId) {
        if (tokenSellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: Seller users are not authorized to make manual adjustments');
        }
        const product = await this.inventoryService.prisma.product.findUnique({
            where: { id: dto.productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return this.inventoryService.adjustStock({
            sellerId: product.sellerId,
            productId: dto.productId,
            adjustedBy: currentUserId,
            status: dto.status,
            quantity: dto.quantity,
            reason: dto.reason,
            notes: dto.notes,
        });
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)('balances'),
    (0, permissions_decorator_1.RequirePermissions)('inventory.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current inventory balances' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getBalances", null);
__decorate([
    (0, common_1.Get)('movements'),
    (0, permissions_decorator_1.RequirePermissions)('inventory.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit log of inventory ledger movements' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getMovements", null);
__decorate([
    (0, common_1.Post)('adjust'),
    (0, permissions_decorator_1.RequirePermissions)('inventory.adjust'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually adjust stock level for a product (WMS Admin/Supervisor)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_adjustment_dto_1.InventoryAdjustmentDto, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "adjustStock", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)('Inventory'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map