import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOpnameDto } from './dto/create-opname.dto';
import { RecordCountDto } from './dto/record-count.dto';
import { PaginationDto, paginate, getPaginationParams } from '../../common/dto/pagination.dto';
import { InventoryService } from '../inventory/inventory.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { NotificationHelperService } from '../../common/services/notification-helper.service';
import { StockOpnameStatus, AuditAction, InventoryStatus, NotificationType } from '@prisma/client';

@Injectable()
export class StockOpnameService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
    private auditLogService: AuditLogService,
    private notificationHelper: NotificationHelperService,
  ) {}

  async create(dto: CreateOpnameDto, currentUserId: string) {
    const { sellerId, notes, productIds } = dto;

    if (productIds.length === 0) {
      throw new BadRequestException('Opname count session must include at least one product ID');
    }

    // Generate unique Opname Number
    const prefixConfig = await this.prisma.warehouseConfig.findUnique({ where: { key: 'opname.prefix' } });
    const prefix = prefixConfig ? prefixConfig.value : 'OPN';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.stockOpname.count({
      where: { opnameNo: { startsWith: `${prefix}-${dateStr}` } },
    });
    const seq = (count + 1).toString().padStart(4, '0');
    const opnameNo = `${prefix}-${dateStr}-${seq}`;

    const opname = await this.prisma.$transaction(async (tx) => {
      // 1. Create Opname Header
      const header = await tx.stockOpname.create({
        data: {
          opnameNo,
          sellerId,
          notes,
          status: StockOpnameStatus.DRAFT,
          createdById: currentUserId,
        },
      });

      // 2. Fetch current system quantities and create items
      for (const productId of productIds) {
        // verify product
        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product || product.deletedAt || product.sellerId !== sellerId) {
          throw new NotFoundException(`Active product with ID ${productId} not found for this seller`);
        }

        // Get system balance
        const balance = await tx.inventoryBalance.findUnique({
          where: { sellerId_productId: { sellerId, productId } },
        });
        const systemQty = balance ? balance.available : 0;

        await tx.stockOpnameItem.create({
          data: {
            opnameId: header.id,
            productId,
            systemQty,
            physicalQty: systemQty, // default physical count is matching system until recorded
            variance: 0,
          },
        });
      }

      return header;
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.CREATE,
      entity: 'stock_opnames',
      entityId: opname.id,
      entityNo: opname.opnameNo,
      description: `Stock Opname count session ${opname.opnameNo} initialized (DRAFT)`,
      after: opname,
    });

    return opname;
  }

  async startCounting(id: string, currentUserId: string) {
    const opname = await this.findOne(id);
    if (opname.status !== StockOpnameStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT opname sessions can be started');
    }

    const updated = await this.prisma.stockOpname.update({
      where: { id },
      data: { status: StockOpnameStatus.COUNTING },
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.STATUS_CHANGE,
      entity: 'stock_opnames',
      entityId: id,
      entityNo: opname.opnameNo,
      description: `Stock count started for opname session ${opname.opnameNo}`,
    });

    return updated;
  }

  async recordCount(id: string, dto: RecordCountDto, currentUserId: string) {
    const opname = await this.findOne(id);
    if (opname.status !== StockOpnameStatus.COUNTING) {
      throw new BadRequestException('Cannot record physical counts for session not in COUNTING status');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        const dbItem = opname.items.find((i) => i.productId === item.productId);
        if (!dbItem) {
          throw new BadRequestException(`Product ID ${item.productId} was not included in this count session`);
        }

        const variance = item.physicalQty - dbItem.systemQty;

        await tx.stockOpnameItem.update({
          where: { id: dbItem.id },
          data: {
            physicalQty: item.physicalQty,
            variance,
            reason: item.reason,
          },
        });
      }
    });

    return this.findOne(id);
  }

  async complete(id: string, currentUserId: string) {
    const opname = await this.findOne(id);
    if (opname.status !== StockOpnameStatus.COUNTING) {
      throw new BadRequestException('Only sessions in COUNTING status can be completed');
    }

    const completed = await this.prisma.$transaction(async (tx) => {
      // 1. Process variance adjustments automatically
      for (const item of opname.items) {
        if (item.variance !== 0) {
          // Adjust stock based on variance: positive variance adds, negative variance subtracts
          await this.inventoryService.adjustStock({
            sellerId: opname.sellerId,
            productId: item.productId,
            adjustedBy: currentUserId,
            status: InventoryStatus.AVAILABLE,
            quantity: item.variance, // e.g. -5 means adjust stock down by 5, +3 means adjust up by 3
            reason: `Stock Opname discrepancy correction. Session: ${opname.opnameNo}. Remarks: ${item.reason || '-'}`,
            referenceId: opname.id,
          });
        }
      }

      // 2. Complete header
      const header = await tx.stockOpname.update({
        where: { id },
        data: {
          status: StockOpnameStatus.COMPLETED,
          completedAt: new Date(),
          countedAt: new Date(),
        },
      });

      return header;
    });

    // Notify Seller
    await this.notificationHelper.notifySellerUsers(opname.sellerId, {
      type: NotificationType.STOCK_OPNAME_COMPLETED,
      title: 'Warehouse Stock Count Complete',
      message: `Stock Opname count session ${opname.opnameNo} completed. Inventory ledger updated to match physical audit.`,
      link: `/inventory/balances`,
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.STATUS_CHANGE,
      entity: 'stock_opnames',
      entityId: id,
      entityNo: opname.opnameNo,
      description: `Stock Opname count complete. Discrepancies and stock variances adjusted successfully.`,
    });

    return completed;
  }

  async cancel(id: string, currentUserId: string) {
    const opname = await this.findOne(id);
    if (opname.status === StockOpnameStatus.COMPLETED || opname.status === StockOpnameStatus.CANCELLED) {
      throw new BadRequestException('Completed or already cancelled sessions cannot be cancelled');
    }

    const updated = await this.prisma.stockOpname.update({
      where: { id },
      data: { status: StockOpnameStatus.CANCELLED },
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.STATUS_CHANGE,
      entity: 'stock_opnames',
      entityId: id,
      entityNo: opname.opnameNo,
      description: `Stock Opname session ${opname.opnameNo} cancelled by supervisor`,
    });

    return updated;
  }

  async findAll(paginationDto: PaginationDto, sellerId?: string) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);

    const where: any = {};
    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (search) {
      where.opnameNo = { contains: search, mode: 'insensitive' };
    }

    const [opnames, total] = await Promise.all([
      this.prisma.stockOpname.findMany({
        where,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
        include: {
          createdBy: { select: { name: true } },
        },
      }),
      this.prisma.stockOpname.count({ where }),
    ]);

    return paginate(opnames, total, page, limit);
  }

  async findOne(id: string, sellerId?: string) {
    const where: any = { id };
    if (sellerId) {
      where.sellerId = sellerId;
    }

    const opname = await this.prisma.stockOpname.findFirst({
      where,
      include: {
        createdBy: { select: { name: true, email: true } },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!opname) {
      throw new NotFoundException('Stock opname session not found');
    }

    return opname;
  }
}
