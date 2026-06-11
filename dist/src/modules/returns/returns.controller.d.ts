import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { InspectReturnDto } from './dto/inspect-return.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class ReturnsController {
    private readonly returnsService;
    constructor(returnsService: ReturnsService);
    create(dto: CreateReturnDto, currentUserId: string, tokenSellerId?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ReturnStatus;
        sellerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        completedAt: Date | null;
        createdById: string;
        reason: string | null;
        outboundId: string | null;
        returnNo: string;
        inspectedAt: Date | null;
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
        status: import(".prisma/client").$Enums.ReturnStatus;
        sellerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        completedAt: Date | null;
        createdById: string;
        reason: string | null;
        outboundId: string | null;
        returnNo: string;
        inspectedAt: Date | null;
        inspectedById: string | null;
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
        outbound: {
            id: string;
            status: import(".prisma/client").$Enums.OutboundStatus;
            sellerId: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.OutboundType;
            notes: string | null;
            completedAt: Date | null;
            cancelledAt: Date | null;
            cancelReason: string | null;
            createdById: string;
            outboundNo: string;
            recipientName: string;
            recipientPhone: string;
            recipientAddress: string;
            recipientCity: string | null;
            recipientProvince: string | null;
            recipientPostcode: string | null;
            trackingNumber: string | null;
            sellerAwbNo: string | null;
            shippingCost: import("@prisma/client/runtime/library").Decimal | null;
            codAmount: import("@prisma/client/runtime/library").Decimal | null;
            pickedAt: Date | null;
            packedAt: Date | null;
            shippedAt: Date | null;
            courierId: string | null;
        };
        createdBy: {
            email: string;
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
            productId: string;
            rejectQty: number;
            quantity: number;
            returnId: string;
            goodQty: number;
            damagedQty: number;
        })[];
        timelines: {
            id: string;
            createdAt: Date;
            userId: string | null;
            notes: string | null;
            action: string;
            userName: string | null;
            returnId: string;
        }[];
        inspectedBy: {
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ReturnStatus;
        sellerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        completedAt: Date | null;
        createdById: string;
        reason: string | null;
        outboundId: string | null;
        returnNo: string;
        inspectedAt: Date | null;
        inspectedById: string | null;
    }>;
    startInspecting(id: string, currentUserId: string, sellerId?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ReturnStatus;
        sellerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        completedAt: Date | null;
        createdById: string;
        reason: string | null;
        outboundId: string | null;
        returnNo: string;
        inspectedAt: Date | null;
        inspectedById: string | null;
    }>;
    inspect(id: string, dto: InspectReturnDto, currentUserId: string, sellerId?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ReturnStatus;
        sellerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        completedAt: Date | null;
        createdById: string;
        reason: string | null;
        outboundId: string | null;
        returnNo: string;
        inspectedAt: Date | null;
        inspectedById: string | null;
    }>;
}
