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
exports.ManifestsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const manifests_service_1 = require("./manifests.service");
const create_manifest_dto_1 = require("./dto/create-manifest.dto");
const add_shipments_dto_1 = require("./dto/add-shipments.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ManifestsController = class ManifestsController {
    constructor(manifestsService) {
        this.manifestsService = manifestsService;
    }
    create(dto, currentUserId, sellerId) {
        if (sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: Seller users are not authorized to build manifests');
        }
        return this.manifestsService.create(dto, currentUserId);
    }
    findAll(paginationDto, sellerId) {
        if (sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: Seller users are not authorized to view manifests list');
        }
        return this.manifestsService.findAll(paginationDto);
    }
    findOne(id, sellerId) {
        if (sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: Seller users are not authorized to view manifest sheets');
        }
        return this.manifestsService.findOne(id);
    }
    addShipments(id, dto, currentUserId) {
        return this.manifestsService.addShipments(id, dto, currentUserId);
    }
    closeManifest(id, currentUserId) {
        return this.manifestsService.closeManifest(id, currentUserId);
    }
    async getPdf(id, res) {
        const buffer = await this.manifestsService.generateManifestPdf(id);
        const manifest = await this.manifestsService.findOne(id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=manifest_${manifest.manifestNo}.pdf`);
        res.send(buffer);
    }
};
exports.ManifestsController = ManifestsController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('manifests.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Open a new manifest session for a courier brand' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_manifest_dto_1.CreateManifestDto, String, String]),
    __metadata("design:returntype", void 0)
], ManifestsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('manifests.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of manifests' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String]),
    __metadata("design:returntype", void 0)
], ManifestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('manifests.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details of a manifest and its assigned shipments' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ManifestsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/add'),
    (0, permissions_decorator_1.RequirePermissions)('manifests.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign ready outbound orders to an open manifest sheet' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_shipments_dto_1.AddShipmentsDto, String]),
    __metadata("design:returntype", void 0)
], ManifestsController.prototype, "addShipments", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, permissions_decorator_1.RequirePermissions)('manifests.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Close and finalize manifest handover to carrier driver' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ManifestsController.prototype, "closeManifest", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    (0, permissions_decorator_1.RequirePermissions)('manifests.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate and download standard courier dispatch manifest PDF sheet' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ManifestsController.prototype, "getPdf", null);
exports.ManifestsController = ManifestsController = __decorate([
    (0, swagger_1.ApiTags)('Manifests'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('manifests'),
    __metadata("design:paramtypes", [manifests_service_1.ManifestsService])
], ManifestsController);
//# sourceMappingURL=manifests.controller.js.map