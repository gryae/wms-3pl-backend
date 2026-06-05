import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInboundDto } from './dto/create-inbound.dto';
import { UpdateInboundDto } from './dto/update-inbound.dto';
import { ReceiveInboundDto } from './dto/receive-inbound.dto';
import { PaginationDto, paginate, getPaginationParams } from '../../common/dto/pagination.dto';
import { InventoryService } from '../inventory/inventory.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { NotificationHelperService } from '../../common/services/notification-helper.service';
import { InboundStatus, AuditAction, MovementType, InventoryStatus, NotificationType } from '@prisma/client';

@Injectable()
export class InboundService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
    private auditLogService: AuditLogService,
    private notificationHelper: NotificationHelperService,
  ) {}

  async create(dto: CreateInboundDto, currentUserId: string) {
    const { sellerId, type, referenceNo, notes, items } = dto;

    if (items.length === 0) {
      throw new BadRequestException('Inbound must contain at least one item');
    }

    // Generate unique Inbound Number
    const prefixConfig = await this.prisma.warehouseConfig.findUnique({ where: { key: 'inbound.prefix' } });
    const prefix = prefixConfig ? prefixConfig.value : 'IN';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.inbound.count({
      where: { inboundNo: { startsWith: `${prefix}-${dateStr}` } },
    });
    const seq = (count + 1).toString().padStart(4, '0');
    const inboundNo = `${prefix}-${dateStr}-${seq}`;

    const inbound = await this.prisma.$transaction(async (tx) => {
      // 1. Create Inbound header
      const header = await tx.inbound.create({
        data: {
          inboundNo,
          sellerId,
          type,
          referenceNo,
          notes,
          status: InboundStatus.DRAFT,
          createdById: currentUserId,
        },
      });

      // 2. Create items
      for (const item of items) {
        // verify product exists
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.deletedAt) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        await tx.inboundItem.create({
          data: {
            inboundId: header.id,
            productId: item.productId,
            expectedQty: item.expectedQty,
            notes: item.notes,
          },
        });
      }

      // 3. Create initial timeline
      await tx.inboundTimeline.create({
        data: {
          inboundId: header.id,
          action: 'Created',
          notes: 'Inbound shipment draft created by seller',
          userId: currentUserId,
          userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
        },
      });

      return header;
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.CREATE,
      entity: 'inbounds',
      entityId: inbound.id,
      entityNo: inbound.inboundNo,
      description: `Draft Inbound ${inbound.inboundNo} created`,
      after: inbound,
    });

    return inbound;
  }

  async submit(id: string, currentUserId: string) {
    const inbound = await this.findOne(id);
    if (inbound.status !== InboundStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT inbound documents can be submitted');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const header = await tx.inbound.update({
        where: { id },
        data: { status: InboundStatus.SUBMITTED },
      });

      await tx.inboundTimeline.create({
        data: {
          inboundId: id,
          action: 'Submitted',
          notes: 'Inbound shipment submitted for warehouse receiving',
          userId: currentUserId,
          userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
        },
      });

      return header;
    });

    // Notify Warehouse Staff
    await this.notificationHelper.notifyWarehouseStaff({
      sellerId: inbound.sellerId,
      type: NotificationType.INBOUND_SUBMITTED,
      title: 'New Inbound Shipment Submitted',
      message: `Inbound ${inbound.inboundNo} has been submitted by seller.`,
      link: `/inbound/${inbound.id}`,
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.STATUS_CHANGE,
      entity: 'inbounds',
      entityId: id,
      entityNo: inbound.inboundNo,
      description: `Inbound ${inbound.inboundNo} status changed DRAFT -> SUBMITTED`,
    });

    return updated;
  }

  async startReceiving(id: string, currentUserId: string) {
    const inbound = await this.findOne(id);
    if (inbound.status !== InboundStatus.SUBMITTED) {
      throw new BadRequestException('Can only start receiving inbounds that are in SUBMITTED status');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const header = await tx.inbound.update({
        where: { id },
        data: {
          status: InboundStatus.RECEIVING,
          receivedById: currentUserId,
          receivedAt: new Date(),
        },
      });

      await tx.inboundTimeline.create({
        data: {
          inboundId: id,
          action: 'Receiving Started',
          notes: 'Warehouse team has begun verifying items physically',
          userId: currentUserId,
          userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
        },
      });

      return header;
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.STATUS_CHANGE,
      entity: 'inbounds',
      entityId: id,
      entityNo: inbound.inboundNo,
      description: `Inbound receiving started by supervisor`,
    });

    return updated;
  }

  async receive(id: string, dto: ReceiveInboundDto, currentUserId: string) {
    const inbound = await this.findOne(id);
    if (inbound.status !== InboundStatus.RECEIVING) {
      throw new BadRequestException('Cannot record receipts for inbound not in RECEIVING status');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        const dbItem = inbound.items.find((i) => i.productId === item.productId);
        if (!dbItem) {
          throw new BadRequestException(`Product ID ${item.productId} was not declared in this inbound shipment`);
        }

        // VALIDATION: Received + Reject cannot exceed Expected
        if (item.receivedQty + item.rejectQty > dbItem.expectedQty) {
          throw new BadRequestException(
            `Over-receiving rejected. Item ${dbItem.product.sku}: physical total (${item.receivedQty} received + ${item.rejectQty} rejected) cannot exceed expected (${dbItem.expectedQty})`,
          );
        }

        await tx.inboundItem.update({
          where: { id: dbItem.id },
          data: {
            receivedQty: item.receivedQty,
            rejectQty: item.rejectQty,
          },
        });
      }

      await tx.inboundTimeline.create({
        data: {
          inboundId: id,
          action: 'Quantities Recorded',
          notes: 'Receiving quantities and physical audit logged by checker',
          userId: currentUserId,
          userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
        },
      });
    });

    return this.findOne(id);
  }

  async complete(id: string, currentUserId: string) {
    const inbound = await this.findOne(id);
    if (inbound.status !== InboundStatus.RECEIVING) {
      throw new BadRequestException('Only inbounds currently in RECEIVING status can be completed');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Update Inbound Status
      const header = await tx.inbound.update({
        where: { id },
        data: {
          status: InboundStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      // 2. Generate Inventory Movements and adjust stocks
      for (const item of inbound.items) {
        if (item.receivedQty > 0) {
          await this.inventoryService.registerMovement(tx, {
            sellerId: inbound.sellerId,
            productId: item.productId,
            movementType: MovementType.INBOUND,
            quantity: item.receivedQty,
            toStatus: InventoryStatus.AVAILABLE,
            referenceType: 'INBOUND',
            referenceId: inbound.id,
            referenceNo: inbound.inboundNo,
            notes: 'Physical receive to available stock',
            createdBy: currentUserId,
          });
        }

        if (item.rejectQty > 0) {
          await this.inventoryService.registerMovement(tx, {
            sellerId: inbound.sellerId,
            productId: item.productId,
            movementType: MovementType.INBOUND,
            quantity: item.rejectQty,
            toStatus: InventoryStatus.REJECT,
            referenceType: 'INBOUND',
            referenceId: inbound.id,
            referenceNo: inbound.inboundNo,
            notes: 'Physical receive rejected stock',
            createdBy: currentUserId,
          });
        }
      }

      // 3. Log timeline
      await tx.inboundTimeline.create({
        data: {
          inboundId: id,
          action: 'Completed',
          notes: 'Stock movements posted successfully. Inbound is now closed.',
          userId: currentUserId,
          userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
        },
      });

      return header;
    });

    // Notify Seller
    await this.notificationHelper.notifySellerUsers(inbound.sellerId, {
      type: NotificationType.INBOUND_COMPLETED,
      title: 'Inbound Shipment Completed',
      message: `Inbound ${inbound.inboundNo} has been completed and items are now in active inventory.`,
      link: `/inbound/${inbound.id}`,
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.STATUS_CHANGE,
      entity: 'inbounds',
      entityId: id,
      entityNo: inbound.inboundNo,
      description: `Inbound completed and inventory ledger updated`,
    });

    return updated;
  }

  async cancel(id: string, reason: string, currentUserId: string) {
    const inbound = await this.findOne(id);
    if (inbound.status === InboundStatus.COMPLETED || inbound.status === InboundStatus.CANCELLED) {
      throw new BadRequestException('Completed or already cancelled inbounds cannot be cancelled');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const header = await tx.inbound.update({
        where: { id },
        data: {
          status: InboundStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: reason,
        },
      });

      await tx.inboundTimeline.create({
        data: {
          inboundId: id,
          action: 'Cancelled',
          notes: `Shipment cancelled. Reason: ${reason}`,
          userId: currentUserId,
          userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
        },
      });

      return header;
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.STATUS_CHANGE,
      entity: 'inbounds',
      entityId: id,
      entityNo: inbound.inboundNo,
      description: `Inbound cancelled by user. Reason: ${reason}`,
    });

    return updated;
  }

  async findAll(paginationDto: PaginationDto, sellerId?: string) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);

    const where: any = {
      deletedAt: null,
    };

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (search) {
      where.OR = [
        { inboundNo: { contains: search, mode: 'insensitive' } },
        { referenceNo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [inbounds, total] = await Promise.all([
      this.prisma.inbound.findMany({
        where,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
        include: {
          seller: { select: { code: true, name: true } },
          createdBy: { select: { name: true, email: true } },
          receivedBy: { select: { name: true } },
        },
      }),
      this.prisma.inbound.count({ where }),
    ]);

    return paginate(inbounds, total, page, limit);
  }

  async findOne(id: string, sellerId?: string) {
    const where: any = { id, deletedAt: null };
    if (sellerId) {
      where.sellerId = sellerId;
    }

    const inbound = await this.prisma.inbound.findFirst({
      where,
      include: {
        seller: true,
        createdBy: { select: { name: true, email: true } },
        receivedBy: { select: { name: true } },
        items: {
          include: {
            product: true,
          },
        },
        timelines: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!inbound) {
      throw new NotFoundException('Inbound shipment not found');
    }

    return inbound;
  }
}
