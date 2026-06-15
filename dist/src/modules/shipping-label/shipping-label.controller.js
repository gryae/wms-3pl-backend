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
exports.ShippingLabelController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shipping_label_service_1 = require("./shipping-label.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ShippingLabelController = class ShippingLabelController {
    constructor(labelService) {
        this.labelService = labelService;
    }
    async getLabel(outboundId, res, sellerId) {
        const outbound = await this.labelService.generateLabelPdf(outboundId);
        const checkOutbound = await this.labelService['prisma'].outbound.findUnique({
            where: { id: outboundId },
        });
        if (sellerId && checkOutbound?.sellerId !== sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: You cannot access shipping labels for another seller');
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=label_${checkOutbound?.outboundNo}.pdf`);
        res.send(outbound);
    }
    async getBulkLabels(body, res, sellerId) {
        if (sellerId) {
            const outbounds = await this.labelService['prisma'].outbound.findMany({
                where: { id: { in: body.outboundIds } },
                select: { sellerId: true, outboundNo: true },
            });
            const unauthorized = outbounds.filter((o) => o.sellerId !== sellerId);
            if (unauthorized.length > 0) {
                throw new common_1.ForbiddenException('Tenant Isolation: You cannot access shipping labels for another seller');
            }
        }
        const pdfBuffer = await this.labelService.generateBulkLabelPdf(body.outboundIds);
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=bulk_labels_${timestamp}_${body.outboundIds.length}orders.pdf`);
        res.send(pdfBuffer);
    }
};
exports.ShippingLabelController = ShippingLabelController;
__decorate([
    (0, common_1.Get)(':outboundId'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate and download standard 4x6 shipping label PDF' }),
    __param(0, (0, common_1.Param)('outboundId')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ShippingLabelController.prototype, "getLabel", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk download shipping labels as a single merged PDF (one label per page)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], ShippingLabelController.prototype, "getBulkLabels", null);
exports.ShippingLabelController = ShippingLabelController = __decorate([
    (0, swagger_1.ApiTags)('Outbound'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('shipping-label'),
    __metadata("design:paramtypes", [shipping_label_service_1.ShippingLabelService])
], ShippingLabelController);
//# sourceMappingURL=shipping-label.controller.js.map