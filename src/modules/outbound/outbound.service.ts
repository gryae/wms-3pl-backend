import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOutboundDto } from './dto/create-outbound.dto';
import { UpdateOutboundDto } from './dto/update-outbound.dto';
import { PaginationDto, paginate, getPaginationParams } from '../../common/dto/pagination.dto';
import { InventoryService } from '../inventory/inventory.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { NotificationHelperService } from '../../common/services/notification-helper.service';
import { OutboundStatus, AuditAction, MovementType, InventoryStatus, NotificationType, PickTaskStatus, PackTaskStatus } from '@prisma/client';

@Injectable()
export class OutboundService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
    private auditLogService: AuditLogService,
    private notificationHelper: NotificationHelperService,
  ) {}

  async create(dto: CreateOutboundDto, currentUserId: string) {
    const { sellerId, type, recipientName, recipientPhone, recipientAddress, recipientCity, recipientProvince, recipientPostcode, courierId, shippingCost, codAmount, notes, sellerAwbNo, items } = dto;

    if (items.length === 0) {
      throw new BadRequestException('Outbound order must contain at least one item');
    }

    // Generate unique Outbound Number
    const prefixConfig = await this.prisma.warehouseConfig.findUnique({ where: { key: 'outbound.prefix' } });
    const prefix = prefixConfig ? prefixConfig.value : 'OUT';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.outbound.count({
      where: { outboundNo: { startsWith: `${prefix}-${dateStr}` } },
    });
    const seq = (count + 1).toString().padStart(4, '0');
    const outboundNo = `${prefix}-${dateStr}-${seq}`;

    // Verify courier if provided
    if (courierId) {
      const courier = await this.prisma.courier.findUnique({ where: { id: courierId } });
      if (!courier) {
        throw new NotFoundException('Courier not found');
      }
    }

    const outbound = await this.prisma.$transaction(async (tx) => {
      // 1. Create Outbound header
      const header = await tx.outbound.create({
        data: {
          outboundNo,
          sellerId,
          type,
          recipientName,
          recipientPhone,
          recipientAddress,
          recipientCity,
          recipientProvince,
          recipientPostcode,
          courierId,
          shippingCost,
          codAmount,
          notes,
          sellerAwbNo,
          status: OutboundStatus.DRAFT,
          createdById: currentUserId,
        },
      });

      // 2. Create items
      for (const item of items) {
        // verify product exists
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.deletedAt) {
          throw new NotFoundException(`Product ID ${item.productId} not found`);
        }

        await tx.outboundItem.create({
          data: {
            outboundId: header.id,
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes,
          },
        });
      }

      // 3. Log timeline
      await tx.outboundTimeline.create({
        data: {
          outboundId: header.id,
          action: 'Created',
          notes: 'Outbound order created in draft state',
          userId: currentUserId,
          userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
        },
      });

      return header;
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.CREATE,
      entity: 'outbounds',
      entityId: outbound.id,
      entityNo: outbound.outboundNo,
      description: `Draft outbound order ${outbound.outboundNo} created`,
      after: outbound,
    });

    return outbound;
  }

  async submit(id: string, currentUserId: string) {
    const outbound = await this.findOne(id);
    if (outbound.status !== OutboundStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT outbound orders can be submitted');
    }

    // Process Submission & Stock Reservation
    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Check stock levels for all items and reserve
      for (const item of outbound.items) {
        const balance = await tx.inventoryBalance.findUnique({
          where: { sellerId_productId: { sellerId: outbound.sellerId, productId: item.productId } },
        });

        if (!balance || balance.available < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product SKU ${item.product.sku}. Available: ${balance ? balance.available : 0}, Required: ${item.quantity}`,
          );
        }

        // 2. Write reservation movement: AVAILABLE -> RESERVED
        await this.inventoryService.registerMovement(tx, {
          sellerId: outbound.sellerId,
          productId: item.productId,
          movementType: MovementType.RESERVATION,
          quantity: item.quantity,
          fromStatus: InventoryStatus.AVAILABLE,
          toStatus: InventoryStatus.RESERVED,
          referenceType: 'OUTBOUND',
          referenceId: outbound.id,
          referenceNo: outbound.outboundNo,
          notes: 'Order submission - Stock reservation',
          createdBy: currentUserId,
        });
      }

      // 3. Update Outbound Status to ALLOCATED (meaning stock successfully reserved)
      const header = await tx.outbound.update({
        where: { id },
        data: { status: OutboundStatus.ALLOCATED },
      });

      // 4. Log timeline
      await tx.outboundTimeline.create({
        data: {
          outboundId: id,
          action: 'Allocated',
          notes: 'Stock allocation successful, order sent to picking queue',
          userId: currentUserId,
          userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
        },
      });

      // 5. Automatically generate pending Pick Task
      const pickTask = await tx.pickTask.create({
        data: {
          outboundId: id,
          status: PickTaskStatus.PENDING,
        },
      });

      for (const item of outbound.items) {
        await tx.pickTaskItem.create({
          data: {
            pickTaskId: pickTask.id,
            productId: item.productId,
            requiredQty: item.quantity,
            location: 'ZONE-A-RACK-01', // Standard layout simulation
          },
        });
      }

      return header;
    });

    // Notify Warehouse Supervisor
    await this.notificationHelper.notifyWarehouseStaff({
      sellerId: outbound.sellerId,
      type: NotificationType.OUTBOUND_SUBMITTED,
      title: 'New Outbound Order Allocated',
      message: `Outbound ${outbound.outboundNo} stock successfully reserved. Ready for picker assignment.`,
      link: `/picking`,
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.STATUS_CHANGE,
      entity: 'outbounds',
      entityId: id,
      entityNo: outbound.outboundNo,
      description: `Outbound order ${outbound.outboundNo} submitted, stock allocated`,
    });

    return updated;
  }

  async ship(id: string, trackingNumber: string, currentUserId: string) {
    if (!trackingNumber) {
      throw new BadRequestException('Tracking number is required to ship an order');
    }

    const outbound = await this.findOne(id);
    if (outbound.status !== OutboundStatus.READY_TO_SHIP) {
      throw new BadRequestException('Can only ship orders that are in READY_TO_SHIP status');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Transition Outbound status to SHIPPED
      const header = await tx.outbound.update({
        where: { id },
        data: {
          status: OutboundStatus.SHIPPED,
          trackingNumber,
          shippedAt: new Date(),
        },
      });

      // 2. Consume RESERVED inventory: Decrement RESERVED from ledger
      for (const item of outbound.items) {
        await this.inventoryService.registerMovement(tx, {
          sellerId: outbound.sellerId,
          productId: item.productId,
          movementType: MovementType.OUTBOUND,
          quantity: item.quantity,
          fromStatus: InventoryStatus.RESERVED,
          referenceType: 'OUTBOUND',
          referenceId: outbound.id,
          referenceNo: outbound.outboundNo,
          notes: `Order shipped via carrier tracking: ${trackingNumber}`,
          createdBy: currentUserId,
        });
      }

      // 3. Log timeline
      await tx.outboundTimeline.create({
        data: {
          outboundId: id,
          action: 'Shipped',
          notes: `Order handed over to courier. Tracking No: ${trackingNumber}`,
          userId: currentUserId,
          userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
        },
      });

      return header;
    });

    // Notify Seller
    await this.notificationHelper.notifySellerUsers(outbound.sellerId, {
      type: NotificationType.SHIPMENT_COMPLETED,
      title: 'Order Handed to Courier',
      message: `Your outbound order ${outbound.outboundNo} has been shipped. Tracking: ${trackingNumber}`,
      link: `/outbound/${outbound.id}`,
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.STATUS_CHANGE,
      entity: 'outbounds',
      entityId: id,
      entityNo: outbound.outboundNo,
      description: `Order shipped. Tracking No: ${trackingNumber}`,
    });

    return updated;
  }

  async complete(id: string, currentUserId: string) {
    const outbound = await this.findOne(id);
    if (outbound.status !== OutboundStatus.SHIPPED) {
      throw new BadRequestException('Only SHIPPED orders can be marked as COMPLETED');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const header = await tx.outbound.update({
        where: { id },
        data: {
          status: OutboundStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      await tx.outboundTimeline.create({
        data: {
          outboundId: id,
          action: 'Completed',
          notes: 'Shipment delivered to recipient successfully',
          userId: currentUserId,
          userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
        },
      });

      return header;
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.STATUS_CHANGE,
      entity: 'outbounds',
      entityId: id,
      entityNo: outbound.outboundNo,
      description: `Order ${outbound.outboundNo} delivered successfully`,
    });

    return updated;
  }

  async cancel(id: string, reason: string, currentUserId: string) {
    const outbound = await this.findOne(id);

    const irreversible: OutboundStatus[] = [OutboundStatus.SHIPPED, OutboundStatus.COMPLETED, OutboundStatus.CANCELLED];
    if (irreversible.includes(outbound.status)) {
      throw new BadRequestException(`Cannot cancel outbound order that is already ${outbound.status}`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // If stock has been reserved (ALLOCATED, PICKING, PACKING, READY_TO_SHIP), release reservation
      const needsRelease: OutboundStatus[] = [
        OutboundStatus.ALLOCATED,
        OutboundStatus.PICKING,
        OutboundStatus.PACKING,
        OutboundStatus.READY_TO_SHIP,
      ];

      if (needsRelease.includes(outbound.status)) {
        for (const item of outbound.items) {
          // Release reservation movement: RESERVED -> AVAILABLE
          await this.inventoryService.registerMovement(tx, {
            sellerId: outbound.sellerId,
            productId: item.productId,
            movementType: MovementType.RELEASE,
            quantity: item.quantity,
            fromStatus: InventoryStatus.RESERVED,
            toStatus: InventoryStatus.AVAILABLE,
            referenceType: 'OUTBOUND',
            referenceId: outbound.id,
            referenceNo: outbound.outboundNo,
            notes: 'Order cancelled - stock reservation released',
            createdBy: currentUserId,
          });
        }
      }

      // Deactivate tasks if exist
      await tx.pickTask.updateMany({
        where: { outboundId: id },
        data: { status: PickTaskStatus.CANCELLED },
      });
      await tx.packTask.updateMany({
        where: { outboundId: id },
        data: { status: PackTaskStatus.CANCELLED },
      });

      // Update header
      const header = await tx.outbound.update({
        where: { id },
        data: {
          status: OutboundStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: reason,
        },
      });

      await tx.outboundTimeline.create({
        data: {
          outboundId: id,
          action: 'Cancelled',
          notes: `Order cancelled. Reason: ${reason}`,
          userId: currentUserId,
          userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
        },
      });

      return header;
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.STATUS_CHANGE,
      entity: 'outbounds',
      entityId: id,
      entityNo: outbound.outboundNo,
      description: `Order cancelled. Stock released. Reason: ${reason}`,
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
        { outboundNo: { contains: search, mode: 'insensitive' } },
        { recipientName: { contains: search, mode: 'insensitive' } },
        { trackingNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [outbounds, total] = await Promise.all([
      this.prisma.outbound.findMany({
        where,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
        include: {
          seller: { select: { code: true, name: true } },
          courier: { select: { code: true, name: true } },
          createdBy: { select: { name: true, email: true } },
        },
      }),
      this.prisma.outbound.count({ where }),
    ]);

    return paginate(outbounds, total, page, limit);
  }

  async findOne(id: string, sellerId?: string) {
    const where: any = { id, deletedAt: null };
    if (sellerId) {
      where.sellerId = sellerId;
    }

    const outbound = await this.prisma.outbound.findFirst({
      where,
      include: {
        seller: true,
        courier: true,
        createdBy: { select: { name: true, email: true } },
        items: {
          include: {
            product: true,
          },
        },
        timelines: {
          orderBy: { createdAt: 'asc' },
        },
        pickTask: {
          include: { assignee: { select: { name: true } } },
        },
        packTask: {
          include: { assignee: { select: { name: true } } },
        },
      },
    });

    if (!outbound) {
      throw new NotFoundException('Outbound order not found');
    }

    return outbound;
  }
}
