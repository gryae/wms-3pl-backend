import { PrismaService } from '../../prisma/prisma.service';
import { CreateInboundDto } from './dto/create-inbound.dto';
import { ReceiveInboundDto } from './dto/receive-inbound.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { InventoryService } from '../inventory/inventory.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { NotificationHelperService } from '../../common/services/notification-helper.service';
export declare class InboundService {
    private prisma;
    private inventoryService;
    private auditLogService;
    private notificationHelper;
    constructor(prisma: PrismaService, inventoryService: InventoryService, auditLogService: AuditLogService, notificationHelper: NotificationHelperService);
    create(dto: CreateInboundDto, currentUserId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.InboundStatus;
        sellerId: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.InboundType;
        inboundNo: string;
        referenceNo: string | null;
        notes: string | null;
        receivedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdById: string;
        receivedById: string | null;
    }>;
    submit(id: string, currentUserId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.InboundStatus;
        sellerId: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.InboundType;
        inboundNo: string;
        referenceNo: string | null;
        notes: string | null;
        receivedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdById: string;
        receivedById: string | null;
    }>;
    startReceiving(id: string, currentUserId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.InboundStatus;
        sellerId: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.InboundType;
        inboundNo: string;
        referenceNo: string | null;
        notes: string | null;
        receivedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdById: string;
        receivedById: string | null;
    }>;
    receive(id: string, dto: ReceiveInboundDto, currentUserId: string): Promise<{
        seller: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            status: import(".prisma/client").$Enums.SellerStatus;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            address: string | null;
            logoUrl: string | null;
        };
        createdBy: {
            email: string;
            name: string;
        };
        receivedBy: {
            name: string;
        };
        items: ({
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
            notes: string | null;
            inboundId: string;
            productId: string;
            expectedQty: number;
            receivedQty: number;
            rejectQty: number;
        })[];
        timelines: {
            id: string;
            createdAt: Date;
            userId: string | null;
            notes: string | null;
            inboundId: string;
            action: string;
            userName: string | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.InboundStatus;
        sellerId: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.InboundType;
        inboundNo: string;
        referenceNo: string | null;
        notes: string | null;
        receivedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdById: string;
        receivedById: string | null;
    }>;
    complete(id: string, currentUserId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.InboundStatus;
        sellerId: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.InboundType;
        inboundNo: string;
        referenceNo: string | null;
        notes: string | null;
        receivedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdById: string;
        receivedById: string | null;
    }>;
    cancel(id: string, reason: string, currentUserId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.InboundStatus;
        sellerId: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.InboundType;
        inboundNo: string;
        referenceNo: string | null;
        notes: string | null;
        receivedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdById: string;
        receivedById: string | null;
    }>;
    findAll(paginationDto: PaginationDto, sellerId?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        seller: {
            name: string;
            code: string;
        };
        createdBy: {
            email: string;
            name: string;
        };
        receivedBy: {
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.InboundStatus;
        sellerId: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.InboundType;
        inboundNo: string;
        referenceNo: string | null;
        notes: string | null;
        receivedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdById: string;
        receivedById: string | null;
    }>>;
    findOne(id: string, sellerId?: string): Promise<{
        seller: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            status: import(".prisma/client").$Enums.SellerStatus;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            address: string | null;
            logoUrl: string | null;
        };
        createdBy: {
            email: string;
            name: string;
        };
        receivedBy: {
            name: string;
        };
        items: ({
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
            notes: string | null;
            inboundId: string;
            productId: string;
            expectedQty: number;
            receivedQty: number;
            rejectQty: number;
        })[];
        timelines: {
            id: string;
            createdAt: Date;
            userId: string | null;
            notes: string | null;
            inboundId: string;
            action: string;
            userName: string | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.InboundStatus;
        sellerId: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.InboundType;
        inboundNo: string;
        referenceNo: string | null;
        notes: string | null;
        receivedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdById: string;
        receivedById: string | null;
    }>;
}
