export declare class CreateArticleDto {
    categoryId: string;
    slug: string;
    titleEn: string;
    titleId: string;
    contentEn: string;
    contentId: string;
    page?: string;
    tags?: string[];
    isPublished?: boolean;
    order?: number;
}
