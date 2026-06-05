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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reports_service_1 = require("./reports.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    getInventory(paginationDto, sellerId) {
        return this.reportsService.getInventoryReport(paginationDto, sellerId);
    }
    async exportInventory(res, sellerId) {
        const buffer = await this.reportsService.exportInventoryExcel(sellerId);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=report_inventory.xlsx');
        res.send(buffer);
    }
    getInbounds(startDate, endDate, sellerId) {
        return this.reportsService.getInboundReport(startDate, endDate, sellerId);
    }
    async exportInbound(res, startDate, endDate, sellerId) {
        const buffer = await this.reportsService.exportInboundExcel(startDate, endDate, sellerId);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=report_inbound.xlsx');
        res.send(buffer);
    }
    getOutbounds(startDate, endDate, sellerId) {
        return this.reportsService.getOutboundReport(startDate, endDate, sellerId);
    }
    async exportOutbound(res, startDate, endDate, sellerId) {
        const buffer = await this.reportsService.exportOutboundExcel(startDate, endDate, sellerId);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=report_outbound.xlsx');
        res.send(buffer);
    }
    getReturns(startDate, endDate, sellerId) {
        return this.reportsService.getReturnReport(startDate, endDate, sellerId);
    }
    async exportReturn(res, startDate, endDate, sellerId) {
        const buffer = await this.reportsService.exportReturnExcel(startDate, endDate, sellerId);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=report_returns.xlsx');
        res.send(buffer);
    }
    getManifests(startDate, endDate, sellerId) {
        if (sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: Seller users do not have access to Manifest reports');
        }
        return this.reportsService.getManifestReport(startDate, endDate);
    }
    async exportManifest(res, startDate, endDate, sellerId) {
        if (sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: Seller users do not have access to Manifest reports');
        }
        const buffer = await this.reportsService.exportManifestExcel(startDate, endDate);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=report_manifests.xlsx');
        res.send(buffer);
    }
    getMovements(startDate, endDate, sellerId) {
        return this.reportsService.getStockMovementReport(startDate, endDate, sellerId);
    }
    async exportMovement(res, startDate, endDate, sellerId) {
        const buffer = await this.reportsService.exportMovementExcel(startDate, endDate, sellerId);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=report_movements.xlsx');
        res.send(buffer);
    }
    getOpnames(startDate, endDate, sellerId) {
        return this.reportsService.getStockOpnameReport(startDate, endDate, sellerId);
    }
    async exportOpnames(res, startDate, endDate, sellerId) {
        const buffer = await this.reportsService.exportOpnameExcel(startDate, endDate, sellerId);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=report_opname.xlsx');
        res.send(buffer);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('inventory'),
    (0, permissions_decorator_1.RequirePermissions)('reports.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Inventory Balance Summary list' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getInventory", null);
__decorate([
    (0, common_1.Get)('export/inventory'),
    (0, permissions_decorator_1.RequirePermissions)('reports.export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export Inventory Balance Summary to Excel' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportInventory", null);
__decorate([
    (0, common_1.Get)('inbound'),
    (0, permissions_decorator_1.RequirePermissions)('reports.view'),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Get Inbounds Receipts Summary' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getInbounds", null);
__decorate([
    (0, common_1.Get)('export/inbound'),
    (0, permissions_decorator_1.RequirePermissions)('reports.export'),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Export Inbounds Receipts to Excel' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportInbound", null);
__decorate([
    (0, common_1.Get)('outbound'),
    (0, permissions_decorator_1.RequirePermissions)('reports.view'),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Get Outbounds Orders Summary' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getOutbounds", null);
__decorate([
    (0, common_1.Get)('export/outbound'),
    (0, permissions_decorator_1.RequirePermissions)('reports.export'),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Export Outbounds Orders to Excel' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportOutbound", null);
__decorate([
    (0, common_1.Get)('returns'),
    (0, permissions_decorator_1.RequirePermissions)('reports.view'),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Get Returns Audit Summary' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getReturns", null);
__decorate([
    (0, common_1.Get)('export/returns'),
    (0, permissions_decorator_1.RequirePermissions)('reports.export'),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Export Returns to Excel' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportReturn", null);
__decorate([
    (0, common_1.Get)('manifests'),
    (0, permissions_decorator_1.RequirePermissions)('reports.view'),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Get Courier Manifests Handover list' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getManifests", null);
__decorate([
    (0, common_1.Get)('export/manifests'),
    (0, permissions_decorator_1.RequirePermissions)('reports.export'),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Export Courier Handover Manifests to Excel' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportManifest", null);
__decorate([
    (0, common_1.Get)('movements'),
    (0, permissions_decorator_1.RequirePermissions)('reports.view'),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Get Stock Movements Ledger log' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getMovements", null);
__decorate([
    (0, common_1.Get)('export/movements'),
    (0, permissions_decorator_1.RequirePermissions)('reports.export'),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Export Stock Movements Ledger to Excel' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportMovement", null);
__decorate([
    (0, common_1.Get)('opnames'),
    (0, permissions_decorator_1.RequirePermissions)('reports.view'),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Get Stock Opnames history' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getOpnames", null);
__decorate([
    (0, common_1.Get)('export/opnames'),
    (0, permissions_decorator_1.RequirePermissions)('reports.export'),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Export Stock Opname sessions to Excel' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportOpnames", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Reports'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map