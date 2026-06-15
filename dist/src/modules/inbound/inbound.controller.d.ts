import { InboundService } from './inbound.service';
import { CreateInboundDto } from './dto/create-inbound.dto';
import { ReceiveInboundDto } from './dto/receive-inbound.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class InboundController {
    private readonly inboundService;
    constructor(inboundService: InboundService);
    create(dto: CreateInboundDto, currentUserId: string, tokenSellerId?: string): Promise<{
        id: string;
        inboundNo: string;
        type: import(".prisma/client").$Enums.InboundType;
        status: import(".prisma/client").$Enums.InboundStatus;
        referenceNo: string | null;
        notes: string | null;
        receivedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sellerId: string;
        createdById: string;
        receivedById: string | null;
    }>;
    findAll(paginationDto: PaginationDto, sellerId?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        seller: {
            name: string;
            code: string;
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
        inboundNo: string;
        type: import(".prisma/client").$Enums.InboundType;
        status: import(".prisma/client").$Enums.InboundStatus;
        referenceNo: string | null;
        notes: string | null;
        receivedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sellerId: string;
        createdById: string;
        receivedById: string | null;
    }>>;
    findOne(id: string, sellerId?: string): Promise<{
        seller: {
            id: string;
            status: import(".prisma/client").$Enums.SellerStatus;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            email: string | null;
            phone: string | null;
            code: string;
            address: string | null;
            logoUrl: string | null;
        };
        createdBy: {
            name: string;
            email: string;
        };
        receivedBy: {
            name: string;
        };
        items: ({
            product: {
                id: string;
                status: import(".prisma/client").$Enums.ProductStatus;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                sellerId: string;
                name: string;
                length: import("@prisma/client/runtime/library").Decimal | null;
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
            inboundId: string;
            productId: string;
            expectedQty: number;
            receivedQty: number;
            rejectQty: number;
        })[];
        timelines: {
            id: string;
            notes: string | null;
            createdAt: Date;
            inboundId: string;
            action: string;
            userId: string | null;
            userName: string | null;
        }[];
    } & {
        id: string;
        inboundNo: string;
        type: import(".prisma/client").$Enums.InboundType;
        status: import(".prisma/client").$Enums.InboundStatus;
        referenceNo: string | null;
        notes: string | null;
        receivedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sellerId: string;
        createdById: string;
        receivedById: string | null;
    }>;
    submit(id: string, currentUserId: string, sellerId?: string): Promise<{
        id: string;
        inboundNo: string;
        type: import(".prisma/client").$Enums.InboundType;
        status: import(".prisma/client").$Enums.InboundStatus;
        referenceNo: string | null;
        notes: string | null;
        receivedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sellerId: string;
        createdById: string;
        receivedById: string | null;
    }>;
    startReceiving(id: string, currentUserId: string, sellerId?: string): Promise<{
        id: string;
        inboundNo: string;
        type: import(".prisma/client").$Enums.InboundType;
        status: import(".prisma/client").$Enums.InboundStatus;
        referenceNo: string | null;
        notes: string | null;
        receivedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sellerId: string;
        createdById: string;
        receivedById: string | null;
    }>;
    receive(id: string, dto: ReceiveInboundDto, currentUserId: string, sellerId?: string): Promise<{
        seller: {
            id: string;
            status: import(".prisma/client").$Enums.SellerStatus;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            email: string | null;
            phone: string | null;
            code: string;
            address: string | null;
            logoUrl: string | null;
        };
        createdBy: {
            name: string;
            email: string;
        };
        receivedBy: {
            name: string;
        };
        items: ({
            product: {
                id: string;
                status: import(".prisma/client").$Enums.ProductStatus;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                sellerId: string;
                name: string;
                length: import("@prisma/client/runtime/library").Decimal | null;
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
            inboundId: string;
            productId: string;
            expectedQty: number;
            receivedQty: number;
            rejectQty: number;
        })[];
        timelines: {
            id: string;
            notes: string | null;
            createdAt: Date;
            inboundId: string;
            action: string;
            userId: string | null;
            userName: string | null;
        }[];
    } & {
        id: string;
        inboundNo: string;
        type: import(".prisma/client").$Enums.InboundType;
        status: import(".prisma/client").$Enums.InboundStatus;
        referenceNo: string | null;
        notes: string | null;
        receivedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sellerId: string;
        createdById: string;
        receivedById: string | null;
    }>;
    complete(id: string, currentUserId: string, sellerId?: string): Promise<{
        id: string;
        inboundNo: string;
        type: import(".prisma/client").$Enums.InboundType;
        status: import(".prisma/client").$Enums.InboundStatus;
        referenceNo: string | null;
        notes: string | null;
        receivedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sellerId: string;
        createdById: string;
        receivedById: string | null;
    }>;
    cancel(id: string, reason: string, currentUserId: string, sellerId?: string): Promise<{
        id: string;
        inboundNo: string;
        type: import(".prisma/client").$Enums.InboundType;
        status: import(".prisma/client").$Enums.InboundStatus;
        referenceNo: string | null;
        notes: string | null;
        receivedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sellerId: string;
        createdById: string;
        receivedById: string | null;
    }>;
}
