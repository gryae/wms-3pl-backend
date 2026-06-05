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
exports.InboundController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inbound_service_1 = require("./inbound.service");
const create_inbound_dto_1 = require("./dto/create-inbound.dto");
const receive_inbound_dto_1 = require("./dto/receive-inbound.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let InboundController = class InboundController {
    constructor(inboundService) {
        this.inboundService = inboundService;
    }
    create(dto, currentUserId, tokenSellerId) {
        if (tokenSellerId && tokenSellerId !== dto.sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: You cannot create inbound shipments for another seller');
        }
        return this.inboundService.create(dto, currentUserId);
    }
    findAll(paginationDto, sellerId) {
        return this.inboundService.findAll(paginationDto, sellerId);
    }
    findOne(id, sellerId) {
        return this.inboundService.findOne(id, sellerId);
    }
    async submit(id, currentUserId, sellerId) {
        await this.inboundService.findOne(id, sellerId);
        return this.inboundService.submit(id, currentUserId);
    }
    async startReceiving(id, currentUserId, sellerId) {
        if (sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: Seller users are not authorized to start physical receipts');
        }
        return this.inboundService.startReceiving(id, currentUserId);
    }
    async receive(id, dto, currentUserId, sellerId) {
        if (sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: Seller users are not authorized to write physical quantities');
        }
        return this.inboundService.receive(id, dto, currentUserId);
    }
    async complete(id, currentUserId, sellerId) {
        if (sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: Seller users are not authorized to complete inbound receipts');
        }
        return this.inboundService.complete(id, currentUserId);
    }
    async cancel(id, reason, currentUserId, sellerId) {
        if (!reason) {
            throw new common_1.BadRequestException('Cancellation reason is required');
        }
        await this.inboundService.findOne(id, sellerId);
        return this.inboundService.cancel(id, reason, currentUserId);
    }
};
exports.InboundController = InboundController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('inbound.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new Inbound shipment (DRAFT status)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_inbound_dto_1.CreateInboundDto, String, String]),
    __metadata("design:returntype", void 0)
], InboundController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('inbound.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of inbound shipments' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String]),
    __metadata("design:returntype", void 0)
], InboundController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('inbound.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details and history timeline of an inbound shipment' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InboundController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, permissions_decorator_1.RequirePermissions)('inbound.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit inbound shipment draft to warehouse' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], InboundController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, permissions_decorator_1.RequirePermissions)('inbound.receive'),
    (0, swagger_1.ApiOperation)({ summary: 'Start physical verification in warehouse (Supervisor only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], InboundController.prototype, "startReceiving", null);
__decorate([
    (0, common_1.Post)(':id/receive'),
    (0, permissions_decorator_1.RequirePermissions)('inbound.receive'),
    (0, swagger_1.ApiOperation)({ summary: 'Log checked physical quantities (Received vs Reject)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, receive_inbound_dto_1.ReceiveInboundDto, String, String]),
    __metadata("design:returntype", Promise)
], InboundController.prototype, "receive", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, permissions_decorator_1.RequirePermissions)('inbound.receive'),
    (0, swagger_1.ApiOperation)({ summary: 'Finalize receiving, post stock entries, and notify seller' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], InboundController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, permissions_decorator_1.RequirePermissions)('inbound.cancel'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['reason'],
            properties: {
                reason: { type: 'string', example: 'Shipment delayed indefinitely' },
            },
        },
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel inbound shipment' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], InboundController.prototype, "cancel", null);
exports.InboundController = InboundController = __decorate([
    (0, swagger_1.ApiTags)('Inbound'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('inbounds'),
    __metadata("design:paramtypes", [inbound_service_1.InboundService])
], InboundController);
//# sourceMappingURL=inbound.controller.js.map