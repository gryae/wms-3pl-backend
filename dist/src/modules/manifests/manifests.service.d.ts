import { PrismaService } from '../../prisma/prisma.service';
import { CreateManifestDto } from './dto/create-manifest.dto';
import { AddShipmentsDto } from './dto/add-shipments.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AuditLogService } from '../../common/services/audit-log.service';
export declare class ManifestsService {
    private prisma;
    private auditLogService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService);
    create(dto: CreateManifestDto, currentUserId: string): Promise<{
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
    }>;
    addShipments(id: string, dto: AddShipmentsDto, currentUserId: string): Promise<{
        courier: {
            id: string;
            name: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            logo: string | null;
            isActive: boolean;
        };
        createdBy: {
            email: string;
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
    }>;
    closeManifest(id: string, currentUserId: string): Promise<{
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
    }>;
    generateManifestPdf(id: string): Promise<Buffer>;
    findAll(paginationDto: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        courier: {
            name: string;
        };
        createdBy: {
            name: string;
        };
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
    }>>;
    findOne(id: string): Promise<{
        courier: {
            id: string;
            name: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            logo: string | null;
            isActive: boolean;
        };
        createdBy: {
            email: string;
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
    }>;
}
