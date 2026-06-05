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
exports.PackingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const packing_service_1 = require("./packing.service");
const assign_packer_dto_1 = require("./dto/assign-packer.dto");
const confirm_pack_dto_1 = require("./dto/confirm-pack.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let PackingController = class PackingController {
    constructor(packingService) {
        this.packingService = packingService;
    }
    findAll(paginationDto) {
        return this.packingService.findAll(paginationDto);
    }
    findOne(id, sellerId) {
        return this.packingService.findOne(id, sellerId);
    }
    async assign(id, dto, currentUserId) {
        return this.packingService.assign(id, dto, currentUserId);
    }
    start(id, currentUserId) {
        return this.packingService.start(id, currentUserId);
    }
    confirm(id, dto, currentUserId) {
        return this.packingService.confirm(id, dto, currentUserId);
    }
};
exports.PackingController = PackingController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('packing.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of packing tasks' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], PackingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('packing.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details of a packing task' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PackingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, permissions_decorator_1.RequirePermissions)('packing.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a warehouse admin to a packing task' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_packer_dto_1.AssignPackerDto, String]),
    __metadata("design:returntype", Promise)
], PackingController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, permissions_decorator_1.RequirePermissions)('packing.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Packer logs start of packaging process' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PackingController.prototype, "start", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    (0, permissions_decorator_1.RequirePermissions)('packing.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Packer logs box details, weight and completes packaging' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, confirm_pack_dto_1.ConfirmPackDto, String]),
    __metadata("design:returntype", void 0)
], PackingController.prototype, "confirm", null);
exports.PackingController = PackingController = __decorate([
    (0, swagger_1.ApiTags)('Packing'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('packing'),
    __metadata("design:paramtypes", [packing_service_1.PackingService])
], PackingController);
//# sourceMappingURL=packing.controller.js.map