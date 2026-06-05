import { PrismaService } from '../../prisma/prisma.service';
import { CreateOpnameDto } from './dto/create-opname.dto';
import { RecordCountDto } from './dto/record-count.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { InventoryService } from '../inventory/inventory.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { NotificationHelperService } from '../../common/services/notification-helper.service';
export declare class StockOpnameService {
    private prisma;
    private inventoryService;
    private auditLogService;
    private notificationHelper;
    constructor(prisma: PrismaService, inventoryService: InventoryService, auditLogService: AuditLogService, notificationHelper: NotificationHelperService);
    create(dto: CreateOpnameDto, currentUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StockOpnameStatus;
        sellerId: string;
        completedAt: Date | null;
        notes: string | null;
        createdById: string;
        opnameNo: string;
        countedAt: Date | null;
    }>;
    startCounting(id: string, currentUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StockOpnameStatus;
        sellerId: string;
        completedAt: Date | null;
        notes: string | null;
        createdById: string;
        opnameNo: string;
        countedAt: Date | null;
    }>;
    recordCount(id: string, dto: RecordCountDto, currentUserId: string): Promise<{
        items: ({
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
            productId: string;
            notes: string | null;
            reason: string | null;
            systemQty: number;
            physicalQty: number;
            variance: number;
            opnameId: string;
        })[];
        createdBy: {
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StockOpnameStatus;
        sellerId: string;
        completedAt: Date | null;
        notes: string | null;
        createdById: string;
        opnameNo: string;
        countedAt: Date | null;
    }>;
    complete(id: string, currentUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StockOpnameStatus;
        sellerId: string;
        completedAt: Date | null;
        notes: string | null;
        createdById: string;
        opnameNo: string;
        countedAt: Date | null;
    }>;
    cancel(id: string, currentUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StockOpnameStatus;
        sellerId: string;
        completedAt: Date | null;
        notes: string | null;
        createdById: string;
        opnameNo: string;
        countedAt: Date | null;
    }>;
    findAll(paginationDto: PaginationDto, sellerId?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        createdBy: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StockOpnameStatus;
        sellerId: string;
        completedAt: Date | null;
        notes: string | null;
        createdById: string;
        opnameNo: string;
        countedAt: Date | null;
    }>>;
    findOne(id: string, sellerId?: string): Promise<{
        items: ({
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
            productId: string;
            notes: string | null;
            reason: string | null;
            systemQty: number;
            physicalQty: number;
            variance: number;
            opnameId: string;
        })[];
        createdBy: {
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StockOpnameStatus;
        sellerId: string;
        completedAt: Date | null;
        notes: string | null;
        createdById: string;
        opnameNo: string;
        countedAt: Date | null;
    }>;
}
