import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignPickerDto } from './dto/assign-picker.dto';
import { ConfirmPickDto } from './dto/confirm-pick.dto';
import { PaginationDto, paginate, getPaginationParams } from '../../common/dto/pagination.dto';
import { AuditLogService } from '../../common/services/audit-log.service';
import { NotificationHelperService } from '../../common/services/notification-helper.service';
import { PickTaskStatus, OutboundStatus, AuditAction, NotificationType, PackTaskStatus } from '@prisma/client';

@Injectable()
export class PickingService {
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
      this.prisma.pickTask.findMany({
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
      this.prisma.pickTask.count({ where }),
    ]);

    return paginate(tasks, total, page, limit);
  }

  async findOne(id: string, sellerId?: string) {
    const task = await this.prisma.pickTask.findUnique({
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
      throw new NotFoundException('Picking task not found');
    }

    if (sellerId && task.outbound.sellerId !== sellerId) {
      throw new ForbiddenException('Tenant Isolation: You cannot access this picking task');
    }

    return task;
  }

  async assign(id: string, dto: AssignPickerDto, currentUserId: string) {
    const task = await this.findOne(id);
    if (task.status !== PickTaskStatus.PENDING) {
      throw new BadRequestException('Can only assign pending picking tasks');
    }

    // Verify user is warehouse admin
    const picker = await this.prisma.user.findUnique({ where: { id: dto.pickerId } });
    if (!picker || picker.role !== 'WAREHOUSE_ADMIN' || picker.status !== 'ACTIVE') {
      throw new BadRequestException('Target user is not an active Warehouse Admin');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedTask = await tx.pickTask.update({
        where: { id },
        data: {
          assigneeId: dto.pickerId,
        },
        include: { assignee: true },
      });

      await tx.outboundTimeline.create({
        data: {
          outboundId: task.outboundId,
          action: 'Picking Assigned',
          notes: `Picking task assigned to ${picker.name}`,
          userId: currentUserId,
          userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
        },
      });

      return updatedTask;
    });

    // Notify Picker
    await this.notificationHelper.notify({
      userId: dto.pickerId,
      type: NotificationType.PICKING_ASSIGNED,
      title: 'New Picking Task Assigned',
      message: `You have been assigned picking task for order ${task.outbound.outboundNo}`,
      link: `/picking/${task.id}`,
    });

    return updated;
  }

  async start(id: string, currentUserId: string) {
    const task = await this.findOne(id);

    // Verify user is active warehouse admin
    const user = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    if (!user || user.role !== 'WAREHOUSE_ADMIN' || user.status !== 'ACTIVE') {
      throw new ForbiddenException('Only active Warehouse Admins can perform picking');
    }

    if (task.status !== PickTaskStatus.PENDING) {
      throw new BadRequestException('Task must be in PENDING status to start');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedTask = await tx.pickTask.update({
        where: { id },
        data: {
          status: PickTaskStatus.IN_PROGRESS,
          startedAt: new Date(),
          assigneeId: currentUserId, // Auto-assign to current admin
        },
      });

      await tx.outbound.update({
        where: { id: task.outboundId },
        data: { status: OutboundStatus.PICKING },
      });

      await tx.outboundTimeline.create({
        data: {
          outboundId: task.outboundId,
          action: 'Picking Started',
          notes: `Picker ${user.name} has started picking from inventory locations`,
          userId: currentUserId,
          userName: user.name,
        },
      });

      return updatedTask;
    });
  }

  async confirm(id: string, dto: ConfirmPickDto, currentUserId: string) {
    const task = await this.findOne(id);
    const user = await this.prisma.user.findUnique({ where: { id: currentUserId } });

    if (!user || user.role !== 'WAREHOUSE_ADMIN' || user.status !== 'ACTIVE') {
      throw new ForbiddenException('Only active Warehouse Admins can confirm picking');
    }

    if (task.status !== PickTaskStatus.IN_PROGRESS) {
      throw new BadRequestException('Task must be IN_PROGRESS to confirm picked quantities');
    }

    const durationSeconds = task.startedAt
      ? Math.floor((Date.now() - new Date(task.startedAt).getTime()) / 1000)
      : 0;
    const durationMinutes = Math.ceil(durationSeconds / 60);

    const completed = await this.prisma.$transaction(async (tx) => {
      // 1. Update Picking items
      for (const item of dto.items) {
        const dbItem = task.items.find((i) => i.productId === item.productId);
        if (!dbItem) {
          throw new BadRequestException(`Product ID ${item.productId} was not designated for this picking task`);
        }

        if (item.pickedQty > dbItem.requiredQty) {
          throw new BadRequestException(
            `Over-picking not allowed. Item physical pick (${item.pickedQty}) cannot exceed requirement (${dbItem.requiredQty})`,
          );
        }

        await tx.pickTaskItem.update({
          where: { id: dbItem.id },
          data: { pickedQty: item.pickedQty },
        });

        // Also update outboundItem pickedQty
        const outboundItem = await tx.outboundItem.findFirst({
          where: { outboundId: task.outboundId, productId: item.productId },
        });
        if (outboundItem) {
          await tx.outboundItem.update({
            where: { id: outboundItem.id },
            data: { pickedQty: item.pickedQty },
          });
        }
      }

      // 2. Complete Picking Task
      const completedTask = await tx.pickTask.update({
        where: { id },
        data: {
          status: PickTaskStatus.COMPLETED,
          completedAt: new Date(),
          notes: `Picking finished in ${durationMinutes} mins`,
        },
      });

      // 3. Update Outbound Status to PACKING
      await tx.outbound.update({
        where: { id: task.outboundId },
        data: { status: OutboundStatus.PACKING },
      });

      // 4. Create Outbound Timeline
      await tx.outboundTimeline.create({
        data: {
          outboundId: task.outboundId,
          action: 'Picking Completed',
          notes: `Picking finished by picker ${user.name} in ${durationMinutes} minutes. Assigned to packing list queue.`,
          userId: currentUserId,
          userName: user.name,
        },
      });

      // 5. Automatically generate pending PACK TASK
      const packTask = await tx.packTask.create({
        data: {
          outboundId: task.outboundId,
          status: PackTaskStatus.PENDING,
        },
      });

      // Create pack task items using the actually picked quantities
      for (const item of dto.items) {
        if (item.pickedQty > 0) {
          await tx.packTaskItem.create({
            data: {
              packTaskId: packTask.id,
              productId: item.productId,
              quantity: item.pickedQty,
            },
          });
        }
      }

      return completedTask;
    });

    // Notify Warehouse Packers
    await this.notificationHelper.notifyWarehouseStaff({
      sellerId: task.outbound.sellerId,
      type: NotificationType.PACKING_ASSIGNED,
      title: 'New Packing Task Ready',
      message: `Order ${task.outbound.outboundNo} has been successfully picked. Ready for packaging.`,
      link: `/packing`,
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.UPDATE,
      entity: 'pick_tasks',
      entityId: id,
      entityNo: task.outbound.outboundNo,
      description: `Picking completed for order ${task.outbound.outboundNo}. Duration: ${durationMinutes} mins.`,
    });

    return completed;
  }
}
