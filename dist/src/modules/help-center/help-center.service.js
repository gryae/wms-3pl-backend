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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpCenterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../common/services/audit-log.service");
const client_1 = require("@prisma/client");
let HelpCenterService = class HelpCenterService {
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    async create(dto, currentUserId) {
        const { categoryId, slug, titleEn, titleId, contentEn, contentId, page, tags, isPublished, order } = dto;
        const category = await this.prisma.helpCategory.findUnique({ where: { id: categoryId } });
        if (!category) {
            throw new common_1.NotFoundException('Help category not found');
        }
        const existing = await this.prisma.helpArticle.findUnique({ where: { slug } });
        if (existing) {
            throw new common_1.BadRequestException(`Article slug ${slug} already exists`);
        }
        const article = await this.prisma.helpArticle.create({
            data: {
                categoryId,
                slug,
                titleEn,
                titleId,
                contentEn,
                contentId,
                page,
                tags,
                isPublished,
                order,
            },
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.CREATE,
            entity: 'help_articles',
            entityId: article.id,
            entityNo: article.slug,
            description: `Created help article: ${article.titleEn}`,
            after: article,
        });
        return article;
    }
    async findAllCategories() {
        return this.prisma.helpCategory.findMany({
            orderBy: { order: 'asc' },
            include: {
                articles: {
                    where: { isPublished: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
    }
    async findArticlesBySlugOrQuery(query) {
        const where = { isPublished: true };
        if (query && query.trim().length > 0) {
            const term = query.trim();
            where.OR = [
                { titleEn: { contains: term, mode: 'insensitive' } },
                { titleId: { contains: term, mode: 'insensitive' } },
                { contentEn: { contains: term, mode: 'insensitive' } },
                { contentId: { contains: term, mode: 'insensitive' } },
                { tags: { has: term } },
            ];
        }
        return this.prisma.helpArticle.findMany({
            where,
            orderBy: { order: 'asc' },
            include: { category: true },
        });
    }
    async findContextualHelp(pageRoute) {
        if (!pageRoute)
            return null;
        const article = await this.prisma.helpArticle.findFirst({
            where: {
                page: pageRoute,
                isPublished: true,
            },
            include: { category: true },
        });
        return article;
    }
    async findOne(id) {
        const article = await this.prisma.helpArticle.findUnique({
            where: { id },
            include: { category: true },
        });
        if (!article) {
            throw new common_1.NotFoundException('Help article not found');
        }
        return article;
    }
    async update(id, dto, currentUserId) {
        const article = await this.findOne(id);
        const before = { ...article };
        if (dto.slug && dto.slug !== article.slug) {
            const existing = await this.prisma.helpArticle.findUnique({ where: { slug: dto.slug } });
            if (existing) {
                throw new common_1.BadRequestException(`Article slug ${dto.slug} already exists`);
            }
        }
        const updated = await this.prisma.helpArticle.update({
            where: { id },
            data: dto,
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.UPDATE,
            entity: 'help_articles',
            entityId: id,
            entityNo: article.slug,
            description: `Updated help article info: ${article.slug}`,
            before,
            after: updated,
        });
        return updated;
    }
    async remove(id, currentUserId) {
        const article = await this.findOne(id);
        await this.prisma.helpArticle.delete({
            where: { id },
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.DELETE,
            entity: 'help_articles',
            entityId: id,
            entityNo: article.slug,
            description: `Deleted help article: ${article.slug}`,
            before: article,
        });
        return { message: 'Help article deleted successfully' };
    }
};
exports.HelpCenterService = HelpCenterService;
exports.HelpCenterService = HelpCenterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], HelpCenterService);
//# sourceMappingURL=help-center.service.js.map