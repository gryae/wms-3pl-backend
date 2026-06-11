import { PickingService } from './picking.service';
import { AssignPickerDto } from './dto/assign-picker.dto';
import { ConfirmPickDto } from './dto/confirm-pick.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class PickingController {
    private readonly pickingService;
    constructor(pickingService: PickingService);
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
            email: string;
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PickTaskStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        completedAt: Date | null;
        outboundId: string;
        assigneeId: string | null;
        startedAt: Date | null;
    }>>;
    findOne(id: string, sellerId?: string): Promise<{
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
        };
        items: {
            id: string;
            notes: string | null;
            productId: string;
            pickedQty: number;
            requiredQty: number;
            location: string | null;
            pickTaskId: string;
        }[];
        assignee: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PickTaskStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        completedAt: Date | null;
        outboundId: string;
        assigneeId: string | null;
        startedAt: Date | null;
    }>;
    assign(id: string, dto: AssignPickerDto, currentUserId: string): Promise<{
        assignee: {
            id: string;
            email: string;
            password: string;
            name: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.UserStatus;
            sellerId: string | null;
            avatarUrl: string | null;
            lastLoginAt: Date | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PickTaskStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        completedAt: Date | null;
        outboundId: string;
        assigneeId: string | null;
        startedAt: Date | null;
    }>;
    start(id: string, currentUserId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PickTaskStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        completedAt: Date | null;
        outboundId: string;
        assigneeId: string | null;
        startedAt: Date | null;
    }>;
    confirm(id: string, dto: ConfirmPickDto, currentUserId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PickTaskStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        completedAt: Date | null;
        outboundId: string;
        assigneeId: string | null;
        startedAt: Date | null;
    }>;
}
