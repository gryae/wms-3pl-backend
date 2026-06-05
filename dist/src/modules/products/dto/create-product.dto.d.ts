import { ProductStatus } from '@prisma/client';
export declare class CreateProductDto {
    sellerId: string;
    sku: string;
    barcode?: string;
    name: string;
    description?: string;
    hpp: number;
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
    unit?: string;
    status?: ProductStatus;
    imageUrl?: string;
}
