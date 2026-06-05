import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
export interface CreateNotificationDto {
    userId: string;
    sellerId?: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: any;
}
export declare class NotificationHelperService {
    private prisma;
    constructor(prisma: PrismaService);
    notify(dto: CreateNotificationDto): Promise<void>;
    notifyWarehouseStaff(dto: Omit<CreateNotificationDto, 'userId'>): Promise<void>;
    notifySellerUsers(sellerId: string, dto: Omit<CreateNotificationDto, 'userId' | 'sellerId'>): Promise<void>;
}
