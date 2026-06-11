import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getInventoryReport(paginationDto: PaginationDto, sellerId?: string): Promise<({
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
    })[]>;
    exportInventoryExcel(sellerId?: string): Promise<Buffer>;
    getInboundReport(startDate?: string, endDate?: string, sellerId?: string): Promise<({
        seller: {
            name: string;
            code: string;
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
    })[]>;
    exportInboundExcel(startDate?: string, endDate?: string, sellerId?: string): Promise<Buffer>;
    getOutboundReport(startDate?: string, endDate?: string, sellerId?: string): Promise<({
        seller: {
            name: string;
            code: string;
        };
        courier: {
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
            quantity: number;
            outboundId: string;
            pickedQty: number;
            packedQty: number;
        })[];
    } & {
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
    })[]>;
    exportOutboundExcel(startDate?: string, endDate?: string, sellerId?: string): Promise<Buffer>;
    getReturnReport(startDate?: string, endDate?: string, sellerId?: string): Promise<({
        seller: {
            name: string;
            code: string;
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
    })[]>;
    exportReturnExcel(startDate?: string, endDate?: string, sellerId?: string): Promise<Buffer>;
    getManifestReport(startDate?: string, endDate?: string): Promise<({
        courier: {
            name: string;
        };
        items: ({
            outbound: {
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
            } & {
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
        } & {
            id: string;
            outboundId: string;
            manifestId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ManifestStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        createdById: string;
        courierId: string;
        manifestNo: string;
        date: Date;
        closedAt: Date | null;
    })[]>;
    exportManifestExcel(startDate?: string, endDate?: string): Promise<Buffer>;
    getStockMovementReport(startDate?: string, endDate?: string, sellerId?: string): Promise<({
        seller: {
            name: string;
            code: string;
        };
        product: {
            name: string;
            sku: string;
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
    })[]>;
    exportMovementExcel(startDate?: string, endDate?: string, sellerId?: string): Promise<Buffer>;
    getStockOpnameReport(startDate?: string, endDate?: string, sellerId?: string): Promise<({
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
            reason: string | null;
            systemQty: number;
            physicalQty: number;
            variance: number;
            opnameId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.StockOpnameStatus;
        sellerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        completedAt: Date | null;
        createdById: string;
        opnameNo: string;
        countedAt: Date | null;
    })[]>;
    exportOpnameExcel(startDate?: string, endDate?: string, sellerId?: string): Promise<Buffer>;
}
