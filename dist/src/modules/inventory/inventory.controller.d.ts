import { InventoryService } from './inventory.service';
import { InventoryAdjustmentDto } from './dto/inventory-adjustment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getBalances(paginationDto: PaginationDto, sellerId?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        seller: {
            code: string;
            name: string;
        };
        product: {
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
        };
    } & {
        id: string;
        updatedAt: Date;
        sellerId: string;
        productId: string;
        available: number;
        reserved: number;
        damaged: number;
        reject: number;
    }>>;
    getMovements(paginationDto: PaginationDto, sellerId?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        seller: {
            code: string;
            name: string;
        };
        product: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        sellerId: string;
        productId: string;
        notes: string | null;
        createdBy: string | null;
        quantity: number;
        movementType: import(".prisma/client").$Enums.MovementType;
        fromStatus: import(".prisma/client").$Enums.InventoryStatus | null;
        toStatus: import(".prisma/client").$Enums.InventoryStatus | null;
        referenceType: string | null;
        referenceId: string | null;
        referenceNo: string | null;
    }>>;
    adjustStock(dto: InventoryAdjustmentDto, currentUserId: string, tokenSellerId?: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.InventoryStatus;
        sellerId: string;
        productId: string;
        notes: string | null;
        quantity: number;
        referenceId: string | null;
        adjustedBy: string;
        reason: string;
    }>;
}
