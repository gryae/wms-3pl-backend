import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { InspectReturnDto } from './dto/inspect-return.dto';
import { PaginationDto, paginate, getPaginationParams } from '../../common/dto/pagination.dto';
import { InventoryService } from '../inventory/inventory.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { NotificationHelperService } from '../../common/services/notification-helper.service';
import { ReturnStatus, AuditAction, MovementType, InventoryStatus, NotificationType } from '@prisma/client';

@Injectable()
export class ReturnsService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
    private auditLogService: AuditLogService,
    private notificationHelper: NotificationHelperService,
  ) {}

  async create(dto: CreateReturnDto, currentUserId: string) {
    const { sellerId, outboundId, reason, notes, items } = dto;

    if (items.length === 0) {
      throw new BadRequestException('Return must contain at least one item');
    }

    // Generate unique Return Number
    const prefixConfig = await this.prisma.warehouseConfig.findUnique({ where: { key: 'return.prefix' } });
    const prefix = prefixConfig ? prefixConfig.value : 'RTN';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.return.count({
      where: { returnNo: { startsWith: `${prefix}-${dateStr}` } },
    });
    const seq = (count + 1).toString().padStart(4, '0');
    const returnNo = `${prefix}-${dateStr}-${seq}`;

    // Verify outbound if linked
    let actualOutboundId = outboundId;
    if (outboundId) {
      const outbound = await this.prisma.outbound.findFirst({ 
        where: { 
          OR: [
            { id: outboundId },
            { outboundNo: outboundId }
          ]
        } 
      });
      if (!outbound) {
        throw new NotFoundException('Linked outbound order not found');
      }
      actualOutboundId = outbound.id;
    }

    const retObj = await this.prisma.$transaction(async (tx) => {
      const header = await tx.return.create({
        data: {
          returnNo,
          sellerId,
          outboundId: actualOutboundId,
          reason,
          notes,
          status: ReturnStatus.SUBMITTED,
          createdById: currentUserId,
        },
      });

      // 2. Create items
      for (const item of items) {
        // verify product
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.deletedAt) {
          throw new NotFoundException(`Product ID ${item.productId} not found`);
        }

        await tx.returnItem.create({
          data: {
            returnId: header.id,
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes,
          },
        });
      }

      // 3. Log timeline
      await tx.returnTimeline.create({
        data: {
          returnId: header.id,
          action: 'Submitted',
          notes: 'Customer return shipment filed and submitted',
          userId: currentUserId,
          userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
        },
      });

      return header;
    });

    // Notify Warehouse Staff
    await this.notificationHelper.notifyWarehouseStaff({
      sellerId,
      type: NotificationType.RETURN_RECEIVED,
      title: 'New Customer Return Filed',
      message: `Return ${retObj.returnNo} has been filed for seller. Ready for quality inspection.`,
      link: `/returns/${retObj.id}`,
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.CREATE,
      entity: 'returns',
      entityId: retObj.id,
      entityNo: retObj.returnNo,
      description: `Return document ${retObj.returnNo} created`,
      after: retObj,
    });

    return retObj;
  }

  async startInspecting(id: string, currentUserId: string) {
    const retObj = await this.findOne(id);
    if (retObj.status !== ReturnStatus.SUBMITTED) {
      throw new BadRequestException('Only returns in SUBMITTED status can be inspected');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const header = await tx.return.update({
        where: { id },
        data: {
          status: ReturnStatus.INSPECTING,
          inspectedById: currentUserId,
          inspectedAt: new Date(),
        },
      });

      await tx.returnTimeline.create({
        data: {
          returnId: id,
          action: 'Inspecting',
          notes: 'Quality control checking of goods started in warehouse',
          userId: currentUserId,
          userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
        },
      });

      return header;
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.STATUS_CHANGE,
      entity: 'returns',
      entityId: id,
      entityNo: retObj.returnNo,
      description: `Return ${retObj.returnNo} status changed SUBMITTED -> INSPECTING`,
    });

    return updated;
  }

  async inspectAndComplete(id: string, dto: InspectReturnDto, currentUserId: string) {
    const retObj = await this.findOne(id);
    if (retObj.status !== ReturnStatus.INSPECTING) {
      throw new BadRequestException('QC inspection must be started before completing returns');
    }

    const completed = await this.prisma.$transaction(async (tx) => {
      // 1. Process items validation and posting
      for (const item of dto.items) {
        const dbItem = retObj.items.find((i) => i.productId === item.productId);
        if (!dbItem) {
          throw new BadRequestException(`Product ID ${item.productId} was not declared in this return shipment`);
        }

        // VALIDATION: Good + Damaged + Reject must exactly equal total return quantity
        const totalChecked = item.goodQty + item.damagedQty + item.rejectQty;
        if (totalChecked !== dbItem.quantity) {
          throw new BadRequestException(
            `QC quantity mismatch. Product ${dbItem.product.sku} expected physical total: ${dbItem.quantity}, but you provided: ${totalChecked} (${item.goodQty} good, ${item.damagedQty} damaged, ${item.rejectQty} reject)`,
          );
        }

        // Update checked physical numbers
        await tx.returnItem.update({
          where: { id: dbItem.id },
          data: {
            goodQty: item.goodQty,
            damagedQty: item.damagedQty,
            rejectQty: item.rejectQty,
          },
        });

        // 2. Generate stock entries
        if (item.goodQty > 0) {
          await this.inventoryService.registerMovement(tx, {
            sellerId: retObj.sellerId,
            productId: item.productId,
            movementType: MovementType.RETURN,
            quantity: item.goodQty,
            toStatus: InventoryStatus.AVAILABLE,
            referenceType: 'RETURN',
            referenceId: retObj.id,
            referenceNo: retObj.returnNo,
            notes: 'Returned items - Passed QC restocked',
            createdBy: currentUserId,
          });
        }

        if (item.damagedQty > 0) {
          await this.inventoryService.registerMovement(tx, {
            sellerId: retObj.sellerId,
            productId: item.productId,
            movementType: MovementType.RETURN,
            quantity: item.damagedQty,
            toStatus: InventoryStatus.DAMAGED,
            referenceType: 'RETURN',
            referenceId: retObj.id,
            referenceNo: retObj.returnNo,
            notes: 'Returned items - Damaged store',
            createdBy: currentUserId,
          });
        }

        if (item.rejectQty > 0) {
          await this.inventoryService.registerMovement(tx, {
            sellerId: retObj.sellerId,
            productId: item.productId,
            movementType: MovementType.RETURN,
            quantity: item.rejectQty,
            toStatus: InventoryStatus.REJECT,
            referenceType: 'RETURN',
            referenceId: retObj.id,
            referenceNo: retObj.returnNo,
            notes: 'Returned items - Rejected scrap',
            createdBy: currentUserId,
          });
        }
      }

      // 3. Update return header
      const header = await tx.return.update({
        where: { id },
        data: {
          status: ReturnStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      // 4. Log timeline
      await tx.returnTimeline.create({
        data: {
          returnId: id,
          action: 'Completed',
          notes: 'Inspection complete. Goods returned to respective inventory channels.',
          userId: currentUserId,
          userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
        },
      });

      return header;
    });

    // Notify Seller
    await this.notificationHelper.notifySellerUsers(retObj.sellerId, {
      type: NotificationType.RETURN_RECEIVED,
      title: 'Customer Return Restocked',
      message: `Return ${retObj.returnNo} has been inspected and restocked in inventory ledger.`,
      link: `/returns/${retObj.id}`,
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.STATUS_CHANGE,
      entity: 'returns',
      entityId: id,
      entityNo: retObj.returnNo,
      description: `Customer Return complete. Stock adjusted based on QC.`,
    });

    return completed;
  }

  async findAll(paginationDto: PaginationDto, sellerId?: string) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);

    const where: any = {};
    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (search) {
      where.OR = [
        { returnNo: { contains: search, mode: 'insensitive' } },
        { reason: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [returns, total] = await Promise.all([
      this.prisma.return.findMany({
        where,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
        include: {
          seller: { select: { code: true, name: true } },
          createdBy: { select: { name: true } },
          inspectedBy: { select: { name: true } },
        },
      }),
      this.prisma.return.count({ where }),
    ]);

    return paginate(returns, total, page, limit);
  }

  async findOne(id: string, sellerId?: string) {
    const where: any = { id };
    if (sellerId) {
      where.sellerId = sellerId;
    }

    const retObj = await this.prisma.return.findFirst({
      where,
      include: {
        seller: true,
        createdBy: { select: { name: true, email: true } },
        inspectedBy: { select: { name: true } },
        items: {
          include: {
            product: true,
          },
        },
        timelines: {
          orderBy: { createdAt: 'asc' },
        },
        outbound: true,
      },
    });

    if (!retObj) {
      throw new NotFoundException('Customer return document not found');
    }

    return retObj;
  }
}
