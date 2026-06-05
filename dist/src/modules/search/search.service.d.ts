import { PrismaService } from '../../prisma/prisma.service';
export interface SearchResult {
    id: string;
    type: 'PRODUCT' | 'INBOUND' | 'OUTBOUND' | 'RETURN' | 'MANIFEST' | 'SELLER';
    title: string;
    subtitle: string;
    link: string;
}
export declare class SearchService {
    private prisma;
    constructor(prisma: PrismaService);
    search(query: string, sellerId?: string): Promise<SearchResult[]>;
}
