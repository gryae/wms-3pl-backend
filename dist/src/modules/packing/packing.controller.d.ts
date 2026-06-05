import { PackingService } from './packing.service';
import { AssignPackerDto } from './dto/assign-packer.dto';
import { ConfirmPackDto } from './dto/confirm-pack.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class PackingController {
    private readonly packingService;
    constructor(packingService: PackingService);
    findAll(paginationDto: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        outbound: {
            id: string;
            status: import(".prisma/client").$Enums.OutboundStatus;
            seller: {
                name: string;
            };
            outboundNo: string;
            recipientName: string;
            recipientAddress: string;
        };
        assignee: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PackTaskStatus;
        weight: import("@prisma/client/runtime/library").Decimal | null;
        outboundId: string;
        assigneeId: string | null;
        startedAt: Date | null;
        completedAt: Date | null;
        notes: string | null;
        boxCount: number | null;
    }>>;
    findOne(id: string, sellerId?: string): Promise<{
        outbound: {
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
        };
        items: {
            id: string;
            productId: string;
            notes: string | null;
            quantity: number;
            packedQty: number;
            packTaskId: string;
        }[];
        assignee: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PackTaskStatus;
        weight: import("@prisma/client/runtime/library").Decimal | null;
        outboundId: string;
        assigneeId: string | null;
        startedAt: Date | null;
        completedAt: Date | null;
        notes: string | null;
        boxCount: number | null;
    }>;
    assign(id: string, dto: AssignPackerDto, currentUserId: string): Promise<{
        assignee: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.UserRole;
            deletedAt: Date | null;
            email: string;
            password: string;
            phone: string | null;
            status: import(".prisma/client").$Enums.UserStatus;
            sellerId: string | null;
            avatarUrl: string | null;
            lastLoginAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PackTaskStatus;
        weight: import("@prisma/client/runtime/library").Decimal | null;
        outboundId: string;
        assigneeId: string | null;
        startedAt: Date | null;
        completedAt: Date | null;
        notes: string | null;
        boxCount: number | null;
    }>;
    start(id: string, currentUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PackTaskStatus;
        weight: import("@prisma/client/runtime/library").Decimal | null;
        outboundId: string;
        assigneeId: string | null;
        startedAt: Date | null;
        completedAt: Date | null;
        notes: string | null;
        boxCount: number | null;
    }>;
    confirm(id: string, dto: ConfirmPackDto, currentUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PackTaskStatus;
        weight: import("@prisma/client/runtime/library").Decimal | null;
        outboundId: string;
        assigneeId: string | null;
        startedAt: Date | null;
        completedAt: Date | null;
        notes: string | null;
        boxCount: number | null;
    }>;
}
