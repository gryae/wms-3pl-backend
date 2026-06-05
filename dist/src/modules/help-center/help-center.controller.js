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
exports.HelpCenterController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const help_center_service_1 = require("./help-center.service");
const create_article_dto_1 = require("./dto/create-article.dto");
const update_article_dto_1 = require("./dto/update-article.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let HelpCenterController = class HelpCenterController {
    constructor(helpService) {
        this.helpService = helpService;
    }
    findAllCategories() {
        return this.helpService.findAllCategories();
    }
    findArticles(query) {
        return this.helpService.findArticlesBySlugOrQuery(query);
    }
    findContextualHelp(pageRoute) {
        return this.helpService.findContextualHelp(pageRoute);
    }
    create(dto, currentUserId) {
        return this.helpService.create(dto, currentUserId);
    }
    findOne(id) {
        return this.helpService.findOne(id);
    }
    update(id, dto, currentUserId) {
        return this.helpService.update(id, dto, currentUserId);
    }
    remove(id, currentUserId) {
        return this.helpService.remove(id, currentUserId);
    }
};
exports.HelpCenterController = HelpCenterController;
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Get help categories listing with active sub-articles' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HelpCenterController.prototype, "findAllCategories", null);
__decorate([
    (0, common_1.Get)('articles'),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false, description: 'Bilingual text search query term' }),
    (0, swagger_1.ApiOperation)({ summary: 'Search active help articles catalog' }),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HelpCenterController.prototype, "findArticles", null);
__decorate([
    (0, common_1.Get)('context'),
    (0, swagger_1.ApiQuery)({ name: 'page', description: 'Contextual page router association, e.g., /inbound' }),
    (0, swagger_1.ApiOperation)({ summary: 'Get contextual help article associated with active layout page path' }),
    __param(0, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HelpCenterController.prototype, "findContextualHelp", null);
__decorate([
    (0, common_1.Post)('articles'),
    (0, permissions_decorator_1.RequirePermissions)('help.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new help center article (WMS Admin only)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_article_dto_1.CreateArticleDto, String]),
    __metadata("design:returntype", void 0)
], HelpCenterController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('articles/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get help article details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HelpCenterController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('articles/:id'),
    (0, permissions_decorator_1.RequirePermissions)('help.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Update help article (WMS Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_article_dto_1.UpdateArticleDto, String]),
    __metadata("design:returntype", void 0)
], HelpCenterController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('articles/:id'),
    (0, permissions_decorator_1.RequirePermissions)('help.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a help article (WMS Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], HelpCenterController.prototype, "remove", null);
exports.HelpCenterController = HelpCenterController = __decorate([
    (0, swagger_1.ApiTags)('Help Center'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('help-center'),
    __metadata("design:paramtypes", [help_center_service_1.HelpCenterService])
], HelpCenterController);
//# sourceMappingURL=help-center.controller.js.map