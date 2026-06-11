import { HelpCenterService } from './help-center.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
export declare class HelpCenterController {
    private readonly helpService;
    constructor(helpService: HelpCenterService);
    findAllCategories(): Promise<({
        articles: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tags: string[];
            page: string | null;
            slug: string;
            order: number;
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
    findArticles(query?: string): Promise<({
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
        tags: string[];
        page: string | null;
        slug: string;
        order: number;
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
        tags: string[];
        page: string | null;
        slug: string;
        order: number;
        categoryId: string;
        titleEn: string;
        titleId: string;
        contentEn: string;
        contentId: string;
        isPublished: boolean;
    }>;
    create(dto: CreateArticleDto, currentUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        page: string | null;
        slug: string;
        order: number;
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
        tags: string[];
        page: string | null;
        slug: string;
        order: number;
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
        tags: string[];
        page: string | null;
        slug: string;
        order: number;
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
