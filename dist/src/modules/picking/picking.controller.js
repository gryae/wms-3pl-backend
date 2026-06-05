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
exports.PickingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const picking_service_1 = require("./picking.service");
const assign_picker_dto_1 = require("./dto/assign-picker.dto");
const confirm_pick_dto_1 = require("./dto/confirm-pick.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let PickingController = class PickingController {
    constructor(pickingService) {
        this.pickingService = pickingService;
    }
    findAll(paginationDto) {
        return this.pickingService.findAll(paginationDto);
    }
    findOne(id, sellerId) {
        return this.pickingService.findOne(id, sellerId);
    }
    async assign(id, dto, currentUserId) {
        return this.pickingService.assign(id, dto, currentUserId);
    }
    start(id, currentUserId) {
        return this.pickingService.start(id, currentUserId);
    }
    confirm(id, dto, currentUserId) {
        return this.pickingService.confirm(id, dto, currentUserId);
    }
};
exports.PickingController = PickingController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('picking.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of picking tasks' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], PickingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('picking.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details of a picking task with layout locations' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PickingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, permissions_decorator_1.RequirePermissions)('picking.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a warehouse admin to a picking task' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_picker_dto_1.AssignPickerDto, String]),
    __metadata("design:returntype", Promise)
], PickingController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, permissions_decorator_1.RequirePermissions)('picking.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Picker logs picking start time' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PickingController.prototype, "start", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    (0, permissions_decorator_1.RequirePermissions)('picking.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Picker logs picked quantities and completes picking' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, confirm_pick_dto_1.ConfirmPickDto, String]),
    __metadata("design:returntype", void 0)
], PickingController.prototype, "confirm", null);
exports.PickingController = PickingController = __decorate([
    (0, swagger_1.ApiTags)('Picking'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('picking'),
    __metadata("design:paramtypes", [picking_service_1.PickingService])
], PickingController);
//# sourceMappingURL=picking.controller.js.map