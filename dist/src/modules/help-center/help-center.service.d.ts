import { PrismaService } from '../../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AuditLogService } from '../../common/services/audit-log.service';
export declare class HelpCenterService {
    private prisma;
    private auditLogService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService);
    create(dto: CreateArticleDto, currentUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        order: number;
        page: string | null;
        tags: string[];
        categoryId: string;
        titleEn: string;
        titleId: string;
        contentEn: string;
        contentId: string;
        isPublished: boolean;
    }>;
    findAllCategories(): Promise<({
        articles: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            order: number;
            page: string | null;
            tags: string[];
            categoryId: string;
            titleEn: string;
            titleId: string;
            contentEn: string;
            contentId: string;
            isPublished: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        nameEn: string;
        nameId: string;
        icon: string | null;
        order: number;
    })[]>;
    findArticlesBySlugOrQuery(query?: string): Promise<({
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            nameEn: string;
            nameId: string;
            icon: string | null;
            order: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        order: number;
        page: string | null;
        tags: string[];
        categoryId: string;
        titleEn: string;
        titleId: string;
        contentEn: string;
        contentId: string;
        isPublished: boolean;
    })[]>;
    findContextualHelp(pageRoute: string): Promise<{
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            nameEn: string;
            nameId: string;
            icon: string | null;
            order: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        order: number;
        page: string | null;
        tags: string[];
        categoryId: string;
        titleEn: string;
        titleId: string;
        contentEn: string;
        contentId: string;
        isPublished: boolean;
    }>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            nameEn: string;
            nameId: string;
            icon: string | null;
            order: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        order: number;
        page: string | null;
        tags: string[];
        categoryId: string;
        titleEn: string;
        titleId: string;
        contentEn: string;
        contentId: string;
        isPublished: boolean;
    }>;
    update(id: string, dto: UpdateArticleDto, currentUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        order: number;
        page: string | null;
        tags: string[];
        categoryId: string;
        titleEn: string;
        titleId: string;
        contentEn: string;
        contentId: string;
        isPublished: boolean;
    }>;
    remove(id: string, currentUserId: string): Promise<{
        message: string;
    }>;
}
