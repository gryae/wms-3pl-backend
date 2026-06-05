import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(paginationDto: PaginationDto, userId: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        id: string;
        createdAt: Date;
        link: string | null;
        sellerId: string | null;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        isRead: boolean;
        readAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markAsRead(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        link: string | null;
        sellerId: string | null;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        isRead: boolean;
        readAt: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
}
