import { ManifestsService } from './manifests.service';
import { CreateManifestDto } from './dto/create-manifest.dto';
import { AddShipmentsDto } from './dto/add-shipments.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Response } from 'express';
export declare class ManifestsController {
    private readonly manifestsService;
    constructor(manifestsService: ManifestsService);
    create(dto: CreateManifestDto, currentUserId: string, sellerId?: string): Promise<{
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
    }>;
    findAll(paginationDto: PaginationDto, sellerId?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        courier: {
            name: string;
        };
        createdBy: {
            name: string;
        };
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
    }>>;
    findOne(id: string, sellerId?: string): Promise<{
        courier: {
            id: string;
            code: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            logo: string | null;
            isActive: boolean;
            deletedAt: Date | null;
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
        createdBy: {
            name: string;
            email: string;
        };
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
    }>;
    addShipments(id: string, dto: AddShipmentsDto, currentUserId: string): Promise<{
        courier: {
            id: string;
            code: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            logo: string | null;
            isActive: boolean;
            deletedAt: Date | null;
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
        createdBy: {
            name: string;
            email: string;
        };
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
    }>;
    closeManifest(id: string, currentUserId: string): Promise<{
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
    }>;
    getPdf(id: string, res: Response): Promise<void>;
}
