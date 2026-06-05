import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Response } from 'express';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto, currentUserId: string, sellerId?: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        length: import("@prisma/client/runtime/library").Decimal | null;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.ProductStatus;
        sellerId: string;
        sku: string;
        barcode: string | null;
        hpp: import("@prisma/client/runtime/library").Decimal;
        width: import("@prisma/client/runtime/library").Decimal | null;
        height: import("@prisma/client/runtime/library").Decimal | null;
        weight: import("@prisma/client/runtime/library").Decimal | null;
        unit: string;
        imageUrl: string | null;
    }>;
    findAll(paginationDto: PaginationDto, sellerId?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        seller: {
            id: string;
            code: string;
            name: string;
        };
        inventoryBalances: {
            available: number;
            reserved: number;
            damaged: number;
            reject: number;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        length: import("@prisma/client/runtime/library").Decimal | null;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.ProductStatus;
        sellerId: string;
        sku: string;
        barcode: string | null;
        hpp: import("@prisma/client/runtime/library").Decimal;
        width: import("@prisma/client/runtime/library").Decimal | null;
        height: import("@prisma/client/runtime/library").Decimal | null;
        weight: import("@prisma/client/runtime/library").Decimal | null;
        unit: string;
        imageUrl: string | null;
    }>>;
    exportExcel(res: Response, sellerId?: string): Promise<void>;
    importExcel(file: Express.Multer.File, bodySellerId: string, currentUserId: string, tokenSellerId?: string): Promise<{
        message: string;
        successCount: number;
        errors: any[];
    }>;
    findOne(id: string, sellerId?: string): Promise<{
        seller: {
            id: string;
            code: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            email: string | null;
            phone: string | null;
            status: import(".prisma/client").$Enums.SellerStatus;
            address: string | null;
            logoUrl: string | null;
        };
        inventoryBalances: {
            id: string;
            updatedAt: Date;
            sellerId: string;
            productId: string;
            available: number;
            reserved: number;
            damaged: number;
            reject: number;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        length: import("@prisma/client/runtime/library").Decimal | null;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.ProductStatus;
        sellerId: string;
        sku: string;
        barcode: string | null;
        hpp: import("@prisma/client/runtime/library").Decimal;
        width: import("@prisma/client/runtime/library").Decimal | null;
        height: import("@prisma/client/runtime/library").Decimal | null;
        weight: import("@prisma/client/runtime/library").Decimal | null;
        unit: string;
        imageUrl: string | null;
    }>;
    update(id: string, updateProductDto: UpdateProductDto, currentUserId: string, sellerId?: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        length: import("@prisma/client/runtime/library").Decimal | null;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.ProductStatus;
        sellerId: string;
        sku: string;
        barcode: string | null;
        hpp: import("@prisma/client/runtime/library").Decimal;
        width: import("@prisma/client/runtime/library").Decimal | null;
        height: import("@prisma/client/runtime/library").Decimal | null;
        weight: import("@prisma/client/runtime/library").Decimal | null;
        unit: string;
        imageUrl: string | null;
    }>;
    remove(id: string, currentUserId: string, sellerId?: string): Promise<{
        message: string;
    }>;
}
