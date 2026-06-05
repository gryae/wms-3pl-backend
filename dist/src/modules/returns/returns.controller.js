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
exports.ReturnsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const returns_service_1 = require("./returns.service");
const create_return_dto_1 = require("./dto/create-return.dto");
const inspect_return_dto_1 = require("./dto/inspect-return.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ReturnsController = class ReturnsController {
    constructor(returnsService) {
        this.returnsService = returnsService;
    }
    create(dto, currentUserId, tokenSellerId) {
        if (tokenSellerId && tokenSellerId !== dto.sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: You cannot file returns for other sellers');
        }
        return this.returnsService.create(dto, currentUserId);
    }
    findAll(paginationDto, sellerId) {
        return this.returnsService.findAll(paginationDto, sellerId);
    }
    findOne(id, sellerId) {
        return this.returnsService.findOne(id, sellerId);
    }
    async startInspecting(id, currentUserId, sellerId) {
        if (sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: Seller users are not authorized to write QC logs');
        }
        return this.returnsService.startInspecting(id, currentUserId);
    }
    async inspect(id, dto, currentUserId, sellerId) {
        if (sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: Seller users are not authorized to complete physical returns');
        }
        return this.returnsService.inspectAndComplete(id, dto, currentUserId);
    }
};
exports.ReturnsController = ReturnsController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('returns.create'),
    (0, swagger_1.ApiOperation)({ summary: 'File a new Customer Return document (SUBMITTED status)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_return_dto_1.CreateReturnDto, String, String]),
    __metadata("design:returntype", void 0)
], ReturnsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('returns.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of returns' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String]),
    __metadata("design:returntype", void 0)
], ReturnsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('returns.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details and timeline of a customer return shipment' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReturnsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, permissions_decorator_1.RequirePermissions)('returns.inspect'),
    (0, swagger_1.ApiOperation)({ summary: 'Start QC quality checks (Supervisor only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "startInspecting", null);
__decorate([
    (0, common_1.Post)(':id/inspect'),
    (0, permissions_decorator_1.RequirePermissions)('returns.inspect'),
    (0, swagger_1.ApiOperation)({ summary: 'Log checked physical conditions (Good, Damaged, Reject) and post restock movements' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inspect_return_dto_1.InspectReturnDto, String, String]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "inspect", null);
exports.ReturnsController = ReturnsController = __decorate([
    (0, swagger_1.ApiTags)('Returns'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('returns'),
    __metadata("design:paramtypes", [returns_service_1.ReturnsService])
], ReturnsController);
//# sourceMappingURL=returns.controller.js.map