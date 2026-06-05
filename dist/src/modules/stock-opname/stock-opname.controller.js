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
exports.StockOpnameController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stock_opname_service_1 = require("./stock-opname.service");
const create_opname_dto_1 = require("./dto/create-opname.dto");
const record_count_dto_1 = require("./dto/record-count.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let StockOpnameController = class StockOpnameController {
    constructor(opnameService) {
        this.opnameService = opnameService;
    }
    create(dto, currentUserId, sellerId) {
        if (sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: Seller users are not authorized to schedule stock count sessions');
        }
        return this.opnameService.create(dto, currentUserId);
    }
    findAll(paginationDto, sellerId) {
        return this.opnameService.findAll(paginationDto, sellerId);
    }
    findOne(id, sellerId) {
        return this.opnameService.findOne(id, sellerId);
    }
    startCounting(id, currentUserId) {
        return this.opnameService.startCounting(id, currentUserId);
    }
    recordCount(id, dto, currentUserId) {
        return this.opnameService.recordCount(id, dto, currentUserId);
    }
    complete(id, currentUserId) {
        return this.opnameService.complete(id, currentUserId);
    }
    cancel(id, currentUserId) {
        return this.opnameService.cancel(id, currentUserId);
    }
};
exports.StockOpnameController = StockOpnameController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('opname.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new stock count session (WMS Admin/Supervisor)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_opname_dto_1.CreateOpnameDto, String, String]),
    __metadata("design:returntype", void 0)
], StockOpnameController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('opname.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of stock count sessions' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String]),
    __metadata("design:returntype", void 0)
], StockOpnameController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('opname.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details of a stock opname count session' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StockOpnameController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, permissions_decorator_1.RequirePermissions)('opname.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Transition count session to COUNTING status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StockOpnameController.prototype, "startCounting", null);
__decorate([
    (0, common_1.Post)(':id/count'),
    (0, permissions_decorator_1.RequirePermissions)('opname.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Record physically checked quantities' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, record_count_dto_1.RecordCountDto, String]),
    __metadata("design:returntype", void 0)
], StockOpnameController.prototype, "recordCount", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, permissions_decorator_1.RequirePermissions)('opname.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Close counting session and execute automatic inventory adjustments based on variances' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StockOpnameController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, permissions_decorator_1.RequirePermissions)('opname.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel stock count session' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StockOpnameController.prototype, "cancel", null);
exports.StockOpnameController = StockOpnameController = __decorate([
    (0, swagger_1.ApiTags)('Stock Opname'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('stock-opnames'),
    __metadata("design:paramtypes", [stock_opname_service_1.StockOpnameService])
], StockOpnameController);
//# sourceMappingURL=stock-opname.controller.js.map