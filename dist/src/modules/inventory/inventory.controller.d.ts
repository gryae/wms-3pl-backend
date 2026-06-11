import { InventoryService } from './inventory.service';
import { InventoryAdjustmentDto } from './dto/inventory-adjustment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getBalances(paginationDto: PaginationDto, sellerId?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        seller: {
            name: string;
            code: string;
        };
        product: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.ProductStatus;
            sellerId: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            length: import("@prisma/client/runtime/library").Decimal | null;
            description: string | null;
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
        sellerId: string;
        updatedAt: Date;
        productId: string;
        available: number;
        reserved: number;
        damaged: number;
        reject: number;
    }>>;
    getMovements(paginationDto: PaginationDto, sellerId?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        seller: {
            name: string;
            code: string;
        };
        product: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.ProductStatus;
            sellerId: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            length: import("@prisma/client/runtime/library").Decimal | null;
            description: string | null;
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
        sellerId: string;
        createdAt: Date;
        referenceNo: string | null;
        notes: string | null;
        createdBy: string | null;
        productId: string;
        movementType: import(".prisma/client").$Enums.MovementType;
        quantity: number;
        fromStatus: import(".prisma/client").$Enums.InventoryStatus | null;
        toStatus: import(".prisma/client").$Enums.InventoryStatus | null;
        referenceType: string | null;
        referenceId: string | null;
    }>>;
    adjustStock(dto: InventoryAdjustmentDto, currentUserId: string, tokenSellerId?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.InventoryStatus;
        sellerId: string;
        createdAt: Date;
        notes: string | null;
        productId: string;
        quantity: number;
        referenceId: string | null;
        reason: string;
        adjustedBy: string;
    }>;
}
