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
exports.CouriersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const couriers_service_1 = require("./couriers.service");
const create_courier_dto_1 = require("./dto/create-courier.dto");
const update_courier_dto_1 = require("./dto/update-courier.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let CouriersController = class CouriersController {
    constructor(couriersService) {
        this.couriersService = couriersService;
    }
    create(createCourierDto, currentUserId) {
        return this.couriersService.create(createCourierDto, currentUserId);
    }
    findAll(paginationDto) {
        return this.couriersService.findAll(paginationDto);
    }
    findOne(id) {
        return this.couriersService.findOne(id);
    }
    update(id, updateCourierDto, currentUserId) {
        return this.couriersService.update(id, updateCourierDto, currentUserId);
    }
    remove(id, currentUserId) {
        return this.couriersService.remove(id, currentUserId);
    }
};
exports.CouriersController = CouriersController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('couriers.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new courier service (WMS Admin/Supervisor)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_courier_dto_1.CreateCourierDto, String]),
    __metadata("design:returntype", void 0)
], CouriersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('couriers.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of couriers' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], CouriersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('couriers.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get courier details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CouriersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('couriers.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Update courier details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_courier_dto_1.UpdateCourierDto, String]),
    __metadata("design:returntype", void 0)
], CouriersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('couriers.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate / Soft-delete a courier service' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CouriersController.prototype, "remove", null);
exports.CouriersController = CouriersController = __decorate([
    (0, swagger_1.ApiTags)('Couriers'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('couriers'),
    __metadata("design:paramtypes", [couriers_service_1.CouriersService])
], CouriersController);
//# sourceMappingURL=couriers.controller.js.map