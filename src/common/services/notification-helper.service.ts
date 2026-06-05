import { Injectable } from '@nestjs/common';
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

@Injectable()
export class NotificationHelperService {
  constructor(private prisma: PrismaService) {}

  async notify(dto: CreateNotificationDto): Promise<void> {
    await this.prisma.notification.create({ data: dto });
  }

  async notifyWarehouseStaff(dto: Omit<CreateNotificationDto, 'userId'>): Promise<void> {
    const warehouseUsers = await this.prisma.user.findMany({
      where: {
        role: 'WAREHOUSE_ADMIN',
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true },
    });
    for (const u of warehouseUsers) {
      await this.notify({ ...dto, userId: u.id });
    }
  }

  async notifySellerUsers(sellerId: string, dto: Omit<CreateNotificationDto, 'userId' | 'sellerId'>): Promise<void> {
    const sellerUsers = await this.prisma.user.findMany({
      where: { sellerId, status: 'ACTIVE', deletedAt: null },
      select: { id: true },
    });
    for (const u of sellerUsers) {
      await this.notify({ ...dto, userId: u.id, sellerId });
    }
  }
}
