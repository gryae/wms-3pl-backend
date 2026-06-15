import { PrismaService } from '../../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { InspectReturnDto } from './dto/inspect-return.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { InventoryService } from '../inventory/inventory.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { NotificationHelperService } from '../../common/services/notification-helper.service';
export declare class ReturnsService {
    private prisma;
    private inventoryService;
    private auditLogService;
    private notificationHelper;
    constructor(prisma: PrismaService, inventoryService: InventoryService, auditLogService: AuditLogService, notificationHelper: NotificationHelperService);
    create(dto: CreateReturnDto, currentUserId: string): Promise<{
        id: string;
        returnNo: string;
        status: import(".prisma/client").$Enums.ReturnStatus;
        reason: string | null;
        notes: string | null;
        inspectedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
        outboundId: string | null;
        createdById: string;
        inspectedById: string | null;
    }>;
    startInspecting(id: string, currentUserId: string): Promise<{
        id: string;
        returnNo: string;
        status: import(".prisma/client").$Enums.ReturnStatus;
        reason: string | null;
        notes: string | null;
        inspectedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
        outboundId: string | null;
        createdById: string;
        inspectedById: string | null;
    }>;
    inspectAndComplete(id: string, dto: InspectReturnDto, currentUserId: string): Promise<{
        id: string;
        returnNo: string;
        status: import(".prisma/client").$Enums.ReturnStatus;
        reason: string | null;
        notes: string | null;
        inspectedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
        outboundId: string | null;
        createdById: string;
        inspectedById: string | null;
    }>;
    findAll(paginationDto: PaginationDto, sellerId?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        seller: {
            name: string;
            code: string;
        };
        createdBy: {
            name: string;
        };
        inspectedBy: {
            name: string;
        };
    } & {
        id: string;
        returnNo: string;
        status: import(".prisma/client").$Enums.ReturnStatus;
        reason: string | null;
        notes: string | null;
        inspectedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
        outboundId: string | null;
        createdById: string;
        inspectedById: string | null;
    }>>;
    findOne(id: string, sellerId?: string): Promise<{
        seller: {
            id: string;
            status: import(".prisma/client").$Enums.SellerStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            address: string | null;
            phone: string | null;
            email: string | null;
            logoUrl: string | null;
            deletedAt: Date | null;
        };
        outbound: {
            id: string;
            status: import(".prisma/client").$Enums.OutboundStatus;
            notes: string | null;
            completedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            sellerId: string;
            createdById: string;
            deletedAt: Date | null;
            outboundNo: string;
            type: import(".prisma/client").$Enums.OutboundType;
            recipientName: string;
            recipientPhone: string;
            recipientAddress: string;
            recipientCity: string | null;
            recipientProvince: string | null;
            recipientPostcode: string | null;
            courierId: string | null;
            trackingNumber: string | null;
            sellerAwbNo: string | null;
            shippingCost: import("@prisma/client/runtime/library").Decimal | null;
            codAmount: import("@prisma/client/runtime/library").Decimal | null;
            pickedAt: Date | null;
            packedAt: Date | null;
            shippedAt: Date | null;
            cancelledAt: Date | null;
            cancelReason: string | null;
        };
        createdBy: {
            name: string;
            email: string;
        };
        inspectedBy: {
            name: string;
        };
        items: ({
            product: {
                id: string;
                status: import(".prisma/client").$Enums.ProductStatus;
                createdAt: Date;
                updatedAt: Date;
                sellerId: string;
                name: string;
                length: import("@prisma/client/runtime/library").Decimal | null;
                deletedAt: Date | null;
                sku: string;
                barcode: string | null;
                description: string | null;
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
            returnId: string;
            productId: string;
            quantity: number;
            goodQty: number;
            damagedQty: number;
            rejectQty: number;
        })[];
        timelines: {
            id: string;
            notes: string | null;
            createdAt: Date;
            returnId: string;
            action: string;
            userId: string | null;
            userName: string | null;
        }[];
    } & {
        id: string;
        returnNo: string;
        status: import(".prisma/client").$Enums.ReturnStatus;
        reason: string | null;
        notes: string | null;
        inspectedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
        outboundId: string | null;
        createdById: string;
        inspectedById: string | null;
    }>;
}
