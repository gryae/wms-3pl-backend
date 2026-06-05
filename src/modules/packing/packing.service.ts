import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignPackerDto } from './dto/assign-packer.dto';
import { ConfirmPackDto } from './dto/confirm-pack.dto';
import { PaginationDto, paginate, getPaginationParams } from '../../common/dto/pagination.dto';
import { AuditLogService } from '../../common/services/audit-log.service';
import { NotificationHelperService } from '../../common/services/notification-helper.service';
import { PackTaskStatus, OutboundStatus, AuditAction, NotificationType } from '@prisma/client';

@Injectable()
export class PackingService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
    private notificationHelper: NotificationHelperService,
  ) {}

  async findAll(paginationDto: PaginationDto, userId?: string, assignedOnly?: boolean) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);

    const where: any = {};
    if (assignedOnly && userId) {
      where.assigneeId = userId;
    }

    if (search) {
      where.OR = [
        { outbound: { outboundNo: { contains: search, mode: 'insensitive' } } },
        { assignee: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [tasks, total] = await Promise.all([
      this.prisma.packTask.findMany({
        where,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          outbound: {
            select: {
              id: true,
              outboundNo: true,
              recipientName: true,
              recipientAddress: true,
              status: true,
              seller: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.packTask.count({ where }),
    ]);

    return paginate(tasks, total, page, limit);
  }

  async findOne(id: string, sellerId?: string) {
    const task = await this.prisma.packTask.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        outbound: {
          include: {
            seller: true,
            courier: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        items: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Packing task not found');
    }

    if (sellerId && task.outbound.sellerId !== sellerId) {
      throw new ForbiddenException('Tenant Isolation: You cannot access this packing task');
    }

    return task;
  }

  async assign(id: string, dto: AssignPackerDto, currentUserId: string) {
    const task = await this.findOne(id);
    if (task.status !== PackTaskStatus.PENDING) {
      throw new BadRequestException('Can only assign pending packing tasks');
    }

    // Verify user is warehouse admin
    const packer = await this.prisma.user.findUnique({ where: { id: dto.packerId } });
    if (!packer || packer.role !== 'WAREHOUSE_ADMIN' || packer.status !== 'ACTIVE') {
      throw new BadRequestException('Target user is not an active Warehouse Admin');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedTask = await tx.packTask.update({
        where: { id },
        data: {
          assigneeId: dto.packerId,
        },
        include: { assignee: true },
      });

      await tx.outboundTimeline.create({
        data: {
          outboundId: task.outboundId,
          action: 'Packing Assigned',
          notes: `Packing task assigned to ${packer.name}`,
          userId: currentUserId,
          userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
        },
      });

      return updatedTask;
    });

    // Notify Packer
    await this.notificationHelper.notify({
      userId: dto.packerId,
      type: NotificationType.PACKING_ASSIGNED,
      title: 'New Packing Task Assigned',
      message: `You have been assigned packing task for order ${task.outbound.outboundNo}`,
      link: `/packing/${task.id}`,
    });

    return updated;
  }

  async start(id: string, currentUserId: string) {
    const task = await this.findOne(id);
    const user = await this.prisma.user.findUnique({ where: { id: currentUserId } });

    if (!user || user.role !== 'WAREHOUSE_ADMIN' || user.status !== 'ACTIVE') {
      throw new ForbiddenException('Only active Warehouse Admins can perform packing');
    }

    if (task.status !== PackTaskStatus.PENDING) {
      throw new BadRequestException('Task must be in PENDING status to start');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedTask = await tx.packTask.update({
        where: { id },
        data: {
          status: PackTaskStatus.IN_PROGRESS,
          startedAt: new Date(),
          assigneeId: currentUserId, // Auto-assign to current admin
        },
      });

      await tx.outboundTimeline.create({
        data: {
          outboundId: task.outboundId,
          action: 'Packing Started',
          notes: `Packer ${user.name} has started packing items in shipping box`,
          userId: currentUserId,
          userName: user.name,
        },
      });

      return updatedTask;
    });
  }

  async confirm(id: string, dto: ConfirmPackDto, currentUserId: string) {
    const task = await this.findOne(id);
    const user = await this.prisma.user.findUnique({ where: { id: currentUserId } });

    if (!user || user.role !== 'WAREHOUSE_ADMIN' || user.status !== 'ACTIVE') {
      throw new ForbiddenException('Only active Warehouse Admins can confirm packing');
    }

    if (task.status !== PackTaskStatus.IN_PROGRESS) {
      throw new BadRequestException('Task must be IN_PROGRESS to confirm packing');
    }

    const durationSeconds = task.startedAt
      ? Math.floor((Date.now() - new Date(task.startedAt).getTime()) / 1000)
      : 0;
    const durationMinutes = Math.ceil(durationSeconds / 60);

    const completed = await this.prisma.$transaction(async (tx) => {
      // 1. Confirm pack items
      for (const item of dto.items) {
        const dbItem = task.items.find((i) => i.productId === item.productId);
        if (!dbItem) {
          throw new BadRequestException(`Product ID ${item.productId} was not designated for this packing task`);
        }

        if (item.packedQty > dbItem.quantity) {
          throw new BadRequestException(
            `Over-packaging not allowed. Item packed quantity (${item.packedQty}) cannot exceed requirement (${dbItem.quantity})`,
          );
        }

        await tx.packTaskItem.update({
          where: { id: dbItem.id },
          data: { packedQty: item.packedQty },
        });

        // Also update outboundItem packedQty
        const outboundItem = await tx.outboundItem.findFirst({
          where: { outboundId: task.outboundId, productId: item.productId },
        });
        if (outboundItem) {
          await tx.outboundItem.update({
            where: { id: outboundItem.id },
            data: { packedQty: item.packedQty },
          });
        }
      }

      // 2. Complete Pack Task
      const completedTask = await tx.packTask.update({
        where: { id },
        data: {
          status: PackTaskStatus.COMPLETED,
          completedAt: new Date(),
          boxCount: dto.boxCount,
          weight: dto.weight,
          notes: dto.notes || `Packing finished in ${durationMinutes} mins`,
        },
      });

      // 3. Update Outbound status to READY_TO_SHIP
      await tx.outbound.update({
        where: { id: task.outboundId },
        data: {
          status: OutboundStatus.READY_TO_SHIP,
        },
      });

      // 4. Create Outbound Timeline
      await tx.outboundTimeline.create({
        data: {
          outboundId: task.outboundId,
          action: 'Packed',
          notes: `Packaging completed by ${user.name} in ${durationMinutes} mins. Box count: ${dto.boxCount}. Weight: ${dto.weight}kg. Ready for carrier dispatch.`,
          userId: currentUserId,
          userName: user.name,
        },
      });

      return completedTask;
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.UPDATE,
      entity: 'pack_tasks',
      entityId: id,
      entityNo: task.outbound.outboundNo,
      description: `Packing completed for order ${task.outbound.outboundNo}. Box count: ${dto.boxCount}, Weight: ${dto.weight}kg.`,
    });

    return completed;
  }
}
