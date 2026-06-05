import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AuditLogService } from '../../common/services/audit-log.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class HelpCenterService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async create(dto: CreateArticleDto, currentUserId: string) {
    const { categoryId, slug, titleEn, titleId, contentEn, contentId, page, tags, isPublished, order } = dto;

    const category = await this.prisma.helpCategory.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException('Help category not found');
    }

    const existing = await this.prisma.helpArticle.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException(`Article slug ${slug} already exists`);
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
      action: AuditAction.CREATE,
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

  async findArticlesBySlugOrQuery(query?: string) {
    const where: any = { isPublished: true };

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

  async findContextualHelp(pageRoute: string) {
    if (!pageRoute) return null;
    const article = await this.prisma.helpArticle.findFirst({
      where: {
        page: pageRoute,
        isPublished: true,
      },
      include: { category: true },
    });
    return article;
  }

  async findOne(id: string) {
    const article = await this.prisma.helpArticle.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!article) {
      throw new NotFoundException('Help article not found');
    }
    return article;
  }

  async update(id: string, dto: UpdateArticleDto, currentUserId: string) {
    const article = await this.findOne(id);
    const before = { ...article };

    if (dto.slug && dto.slug !== article.slug) {
      const existing = await this.prisma.helpArticle.findUnique({ where: { slug: dto.slug } });
      if (existing) {
        throw new BadRequestException(`Article slug ${dto.slug} already exists`);
      }
    }

    const updated = await this.prisma.helpArticle.update({
      where: { id },
      data: dto,
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.UPDATE,
      entity: 'help_articles',
      entityId: id,
      entityNo: article.slug,
      description: `Updated help article info: ${article.slug}`,
      before,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, currentUserId: string) {
    const article = await this.findOne(id);

    await this.prisma.helpArticle.delete({
      where: { id },
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.DELETE,
      entity: 'help_articles',
      entityId: id,
      entityNo: article.slug,
      description: `Deleted help article: ${article.slug}`,
      before: article,
    });

    return { message: 'Help article deleted successfully' };
  }
}
