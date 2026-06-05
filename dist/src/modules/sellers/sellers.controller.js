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
exports.SellersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sellers_service_1 = require("./sellers.service");
const create_seller_dto_1 = require("./dto/create-seller.dto");
const update_seller_dto_1 = require("./dto/update-seller.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let SellersController = class SellersController {
    constructor(sellersService) {
        this.sellersService = sellersService;
    }
    create(createSellerDto, currentUserId) {
        return this.sellersService.create(createSellerDto, currentUserId);
    }
    findAll(paginationDto) {
        return this.sellersService.findAll(paginationDto);
    }
    findOne(id, currentUserSellerId, role) {
        if (currentUserSellerId && currentUserSellerId !== id) {
            throw new common_1.ForbiddenException('Tenant Isolation: You cannot access other seller profiles');
        }
        return this.sellersService.findOne(id);
    }
    update(id, updateSellerDto, currentUserId, currentUserSellerId) {
        if (currentUserSellerId && currentUserSellerId !== id) {
            throw new common_1.ForbiddenException('Tenant Isolation: You cannot modify other seller profiles');
        }
        return this.sellersService.update(id, updateSellerDto, currentUserId);
    }
    remove(id, currentUserId) {
        return this.sellersService.remove(id, currentUserId);
    }
};
exports.SellersController = SellersController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('sellers.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new seller (WMS Admin only)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_seller_dto_1.CreateSellerDto, String]),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('sellers.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of sellers' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific seller details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a seller' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_seller_dto_1.UpdateSellerDto, String, String]),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('sellers.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a seller' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SellersController.prototype, "remove", null);
exports.SellersController = SellersController = __decorate([
    (0, swagger_1.ApiTags)('Sellers'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('sellers'),
    __metadata("design:paramtypes", [sellers_service_1.SellersService])
], SellersController);
//# sourceMappingURL=sellers.controller.js.map