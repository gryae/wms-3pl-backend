import { PrismaService } from '../../prisma/prisma.service';
import { MovementType, InventoryStatus } from '@prisma/client';
import { AuditLogService } from '../../common/services/audit-log.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class InventoryService {
    prisma: PrismaService;
    private auditLogService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService);
    registerMovement(tx: any, params: {
        sellerId: string;
        productId: string;
        movementType: MovementType;
        quantity: number;
        fromStatus?: InventoryStatus;
        toStatus?: InventoryStatus;
        referenceType?: string;
        referenceId?: string;
        referenceNo?: string;
        notes?: string;
        createdBy?: string;
    }): Promise<any>;
    recalculateBalanceFromLedger(tx: any, sellerId: string, productId: string): Promise<any>;
    adjustStock(params: {
        sellerId: string;
        productId: string;
        adjustedBy: string;
        status: InventoryStatus;
        quantity: number;
        reason: string;
        notes?: string;
        referenceId?: string;
    }): Promise<{
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
}
