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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.InboundStatus;
        sellerId: string;
        type: import(".prisma/client").$Enums.InboundType;
        completedAt: Date | null;
        notes: string | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdById: string;
        referenceNo: string | null;
        inboundNo: string;
        receivedAt: Date | null;
        receivedById: string | null;
    }>;
    submit(id: string, currentUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.InboundStatus;
        sellerId: string;
        type: import(".prisma/client").$Enums.InboundType;
        completedAt: Date | null;
        notes: string | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdById: string;
        referenceNo: string | null;
        inboundNo: string;
        receivedAt: Date | null;
        receivedById: string | null;
    }>;
    startReceiving(id: string, currentUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.InboundStatus;
        sellerId: string;
        type: import(".prisma/client").$Enums.InboundType;
        completedAt: Date | null;
        notes: string | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdById: string;
        referenceNo: string | null;
        inboundNo: string;
        receivedAt: Date | null;
        receivedById: string | null;
    }>;
    receive(id: string, dto: ReceiveInboundDto, currentUserId: string): Promise<{
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
            inboundId: string;
            expectedQty: number;
            receivedQty: number;
            rejectQty: number;
        })[];
        createdBy: {
            name: string;
            email: string;
        };
        timelines: {
            id: string;
            createdAt: Date;
            userId: string | null;
            notes: string | null;
            action: string;
            userName: string | null;
            inboundId: string;
        }[];
        receivedBy: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.InboundStatus;
        sellerId: string;
        type: import(".prisma/client").$Enums.InboundType;
        completedAt: Date | null;
        notes: string | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdById: string;
        referenceNo: string | null;
        inboundNo: string;
        receivedAt: Date | null;
        receivedById: string | null;
    }>;
    complete(id: string, currentUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.InboundStatus;
        sellerId: string;
        type: import(".prisma/client").$Enums.InboundType;
        completedAt: Date | null;
        notes: string | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdById: string;
        referenceNo: string | null;
        inboundNo: string;
        receivedAt: Date | null;
        receivedById: string | null;
    }>;
    cancel(id: string, reason: string, currentUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.InboundStatus;
        sellerId: string;
        type: import(".prisma/client").$Enums.InboundType;
        completedAt: Date | null;
        notes: string | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdById: string;
        referenceNo: string | null;
        inboundNo: string;
        receivedAt: Date | null;
        receivedById: string | null;
    }>;
    findAll(paginationDto: PaginationDto, sellerId?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        seller: {
            code: string;
            name: string;
        };
        createdBy: {
            name: string;
            email: string;
        };
        receivedBy: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.InboundStatus;
        sellerId: string;
        type: import(".prisma/client").$Enums.InboundType;
        completedAt: Date | null;
        notes: string | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdById: string;
        referenceNo: string | null;
        inboundNo: string;
        receivedAt: Date | null;
        receivedById: string | null;
    }>>;
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
            inboundId: string;
            expectedQty: number;
            receivedQty: number;
            rejectQty: number;
        })[];
        createdBy: {
            name: string;
            email: string;
        };
        timelines: {
            id: string;
            createdAt: Date;
            userId: string | null;
            notes: string | null;
            action: string;
            userName: string | null;
            inboundId: string;
        }[];
        receivedBy: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.InboundStatus;
        sellerId: string;
        type: import(".prisma/client").$Enums.InboundType;
        completedAt: Date | null;
        notes: string | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdById: string;
        referenceNo: string | null;
        inboundNo: string;
        receivedAt: Date | null;
        receivedById: string | null;
    }>;
}
