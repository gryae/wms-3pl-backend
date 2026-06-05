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
exports.OutboundController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const outbound_service_1 = require("./outbound.service");
const create_outbound_dto_1 = require("./dto/create-outbound.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let OutboundController = class OutboundController {
    constructor(outboundService) {
        this.outboundService = outboundService;
    }
    create(dto, currentUserId, tokenSellerId) {
        if (tokenSellerId && tokenSellerId !== dto.sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: You cannot create outbound orders for another seller');
        }
        return this.outboundService.create(dto, currentUserId);
    }
    findAll(paginationDto, sellerId) {
        return this.outboundService.findAll(paginationDto, sellerId);
    }
    findOne(id, sellerId) {
        return this.outboundService.findOne(id, sellerId);
    }
    async submit(id, currentUserId, sellerId) {
        await this.outboundService.findOne(id, sellerId);
        return this.outboundService.submit(id, currentUserId);
    }
    async ship(id, trackingNumber, currentUserId, sellerId) {
        if (sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: Seller users are not authorized to execute shipping logs');
        }
        return this.outboundService.ship(id, trackingNumber, currentUserId);
    }
    async complete(id, currentUserId, sellerId) {
        await this.outboundService.findOne(id, sellerId);
        return this.outboundService.complete(id, currentUserId);
    }
    async cancel(id, reason, currentUserId, sellerId) {
        if (!reason) {
            throw new common_1.BadRequestException('Cancellation reason is required');
        }
        await this.outboundService.findOne(id, sellerId);
        return this.outboundService.cancel(id, reason, currentUserId);
    }
};
exports.OutboundController = OutboundController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('outbound.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new Outbound order (DRAFT status)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_outbound_dto_1.CreateOutboundDto, String, String]),
    __metadata("design:returntype", void 0)
], OutboundController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('outbound.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of outbound orders' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String]),
    __metadata("design:returntype", void 0)
], OutboundController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('outbound.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details and timeline of an outbound order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], OutboundController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, permissions_decorator_1.RequirePermissions)('outbound.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit order for processing and allocate/reserve stock' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OutboundController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/ship'),
    (0, permissions_decorator_1.RequirePermissions)('packing.manage'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['trackingNumber'],
            properties: {
                trackingNumber: { type: 'string', example: 'JT123456789' },
            },
        },
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Hand order over to courier, input tracking number, and consume reserved stock' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('trackingNumber')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], OutboundController.prototype, "ship", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, permissions_decorator_1.RequirePermissions)('outbound.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete order lifecycle (Mark as delivered)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OutboundController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, permissions_decorator_1.RequirePermissions)('outbound.cancel'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['reason'],
            properties: {
                reason: { type: 'string', example: 'Customer cancelled the order' },
            },
        },
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel outbound order and automatically release reserved stock back to available pool' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], OutboundController.prototype, "cancel", null);
exports.OutboundController = OutboundController = __decorate([
    (0, swagger_1.ApiTags)('Outbound'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('outbounds'),
    __metadata("design:paramtypes", [outbound_service_1.OutboundService])
], OutboundController);
//# sourceMappingURL=outbound.controller.js.map