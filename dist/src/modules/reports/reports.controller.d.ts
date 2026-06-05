import { ReportsService } from './reports.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Response } from 'express';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getInventory(paginationDto: PaginationDto, sellerId?: string): Promise<({
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
    })[]>;
    exportInventory(res: Response, sellerId?: string): Promise<void>;
    getInbounds(startDate?: string, endDate?: string, sellerId?: string): Promise<({
        seller: {
            code: string;
            name: string;
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
    })[]>;
    exportInbound(res: Response, startDate?: string, endDate?: string, sellerId?: string): Promise<void>;
    getOutbounds(startDate?: string, endDate?: string, sellerId?: string): Promise<({
        courier: {
            name: string;
        };
        seller: {
            code: string;
            name: string;
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
            outboundId: string;
            notes: string | null;
            quantity: number;
            pickedQty: number;
            packedQty: number;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.OutboundStatus;
        sellerId: string;
        type: import(".prisma/client").$Enums.OutboundType;
        completedAt: Date | null;
        notes: string | null;
        outboundNo: string;
        recipientName: string;
        recipientPhone: string;
        recipientAddress: string;
        recipientCity: string | null;
        recipientProvince: string | null;
        recipientPostcode: string | null;
        courierId: string | null;
        trackingNumber: string | null;
        shippingCost: import("@prisma/client/runtime/library").Decimal | null;
        codAmount: import("@prisma/client/runtime/library").Decimal | null;
        pickedAt: Date | null;
        packedAt: Date | null;
        shippedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        createdById: string;
    })[]>;
    exportOutbound(res: Response, startDate?: string, endDate?: string, sellerId?: string): Promise<void>;
    getReturns(startDate?: string, endDate?: string, sellerId?: string): Promise<({
        seller: {
            code: string;
            name: string;
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
            quantity: number;
            rejectQty: number;
            returnId: string;
            goodQty: number;
            damagedQty: number;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReturnStatus;
        sellerId: string;
        outboundId: string | null;
        completedAt: Date | null;
        notes: string | null;
        createdById: string;
        reason: string;
        returnNo: string;
        inspectedAt: Date | null;
        inspectedById: string | null;
    })[]>;
    exportReturn(res: Response, startDate?: string, endDate?: string, sellerId?: string): Promise<void>;
    getManifests(startDate?: string, endDate?: string, sellerId?: string): Promise<({
        courier: {
            name: string;
        };
        items: ({
            outbound: {
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
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                status: import(".prisma/client").$Enums.OutboundStatus;
                sellerId: string;
                type: import(".prisma/client").$Enums.OutboundType;
                completedAt: Date | null;
                notes: string | null;
                outboundNo: string;
                recipientName: string;
                recipientPhone: string;
                recipientAddress: string;
                recipientCity: string | null;
                recipientProvince: string | null;
                recipientPostcode: string | null;
                courierId: string | null;
                trackingNumber: string | null;
                shippingCost: import("@prisma/client/runtime/library").Decimal | null;
                codAmount: import("@prisma/client/runtime/library").Decimal | null;
                pickedAt: Date | null;
                packedAt: Date | null;
                shippedAt: Date | null;
                cancelledAt: Date | null;
                cancelReason: string | null;
                createdById: string;
            };
        } & {
            id: string;
            outboundId: string;
            manifestId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ManifestStatus;
        notes: string | null;
        courierId: string;
        createdById: string;
        manifestNo: string;
        date: Date;
        closedAt: Date | null;
    })[]>;
    exportManifest(res: Response, startDate?: string, endDate?: string, sellerId?: string): Promise<void>;
    getMovements(startDate?: string, endDate?: string, sellerId?: string): Promise<({
        seller: {
            code: string;
            name: string;
        };
        product: {
            name: string;
            sku: string;
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
    })[]>;
    exportMovement(res: Response, startDate?: string, endDate?: string, sellerId?: string): Promise<void>;
    getOpnames(startDate?: string, endDate?: string, sellerId?: string): Promise<({
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
    })[]>;
    exportOpnames(res: Response, startDate?: string, endDate?: string, sellerId?: string): Promise<void>;
}
