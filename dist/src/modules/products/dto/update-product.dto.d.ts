import { ProductStatus } from '@prisma/client';
export declare class UpdateProductDto {
    barcode?: string;
    name?: string;
    description?: string;
    hpp?: number;
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
    unit?: string;
    status?: ProductStatus;
    imageUrl?: string;
}
