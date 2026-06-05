import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MovementType, InventoryStatus, AuditAction } from '@prisma/client';
import { AuditLogService } from '../../common/services/audit-log.service';
import { PaginationDto, paginate, getPaginationParams } from '../../common/dto/pagination.dto';

@Injectable()
export class InventoryService {
  constructor(
    public prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  /**
   * Registers a stock movement in the ledger, recalculating the InventoryBalance cache.
   * MUST be executed inside a Prisma client transaction context if transactional safety is required.
   */
  async registerMovement(
    tx: any, // Prisma transaction delegate or prisma client
    params: {
      sellerId: string;
      productId: string;
      movementType: MovementType;
      quantity: number; // positive number
      fromStatus?: InventoryStatus;
      toStatus?: InventoryStatus;
      referenceType?: string;
      referenceId?: string;
      referenceNo?: string;
      notes?: string;
      createdBy?: string;
    },
  ) {
    const {
      sellerId,
      productId,
      movementType,
      quantity,
      fromStatus,
      toStatus,
      referenceType,
      referenceId,
      referenceNo,
      notes,
      createdBy,
    } = params;

    if (quantity <= 0) {
      throw new BadRequestException('Movement quantity must be greater than zero');
    }

    // 1. Create the movement record in the ledger
    const movement = await tx.inventoryMovement.create({
      data: {
        sellerId,
        productId,
        movementType,
        quantity,
        fromStatus,
        toStatus,
        referenceType,
        referenceId,
        referenceNo,
        notes,
        createdBy,
      },
    });

    // 2. Fetch the current cache
    let balance = await tx.inventoryBalance.findUnique({
      where: { sellerId_productId: { sellerId, productId } },
    });

    if (!balance) {
      balance = await tx.inventoryBalance.create({
        data: {
          sellerId,
          productId,
          available: 0,
          reserved: 0,
          damaged: 0,
          reject: 0,
        },
      });
    }

    // 3. Compute changes based on movement type
    const updates = {
      available: balance.available,
      reserved: balance.reserved,
      damaged: balance.damaged,
      reject: balance.reject,
    };

    // Helper to add or subtract
    const modifyStatusQty = (status: InventoryStatus, amount: number) => {
      switch (status) {
        case InventoryStatus.AVAILABLE:
          updates.available += amount;
          break;
        case InventoryStatus.RESERVED:
          updates.reserved += amount;
          break;
        case InventoryStatus.DAMAGED:
          updates.damaged += amount;
          break;
        case InventoryStatus.REJECT:
          updates.reject += amount;
          break;
      }
    };

    // Apply ledger mechanics
    if (fromStatus) {
      modifyStatusQty(fromStatus, -quantity);
    }
    if (toStatus) {
      modifyStatusQty(toStatus, quantity);
    }

    // Specific movements that act on aggregate or absolute changes (not just transitions)
    if (movementType === MovementType.INBOUND) {
      // Inbound increments stock
      if (toStatus) {
        // already added by toStatus
      } else {
        updates.available += quantity;
      }
    } else if (movementType === MovementType.OUTBOUND) {
      // Outbound reduces stock
      if (fromStatus) {
        // already subtracted
      } else {
        updates.reserved -= quantity;
      }
    } else if (movementType === MovementType.RETURN) {
      // Return increases stock based on where it returns
      if (toStatus) {
        // already handled
      } else {
        updates.available += quantity;
      }
    } else if (movementType === MovementType.RESERVATION) {
      // Transition from AVAILABLE to RESERVED
      if (!fromStatus && !toStatus) {
        updates.available -= quantity;
        updates.reserved += quantity;
      }
    } else if (movementType === MovementType.RELEASE) {
      // Transition from RESERVED to AVAILABLE
      if (!fromStatus && !toStatus) {
        updates.reserved -= quantity;
        updates.available += quantity;
      }
    } else if (movementType === MovementType.ADJUSTMENT) {
      // Handled entirely by fromStatus / toStatus transitions or incremental quantities
    }

    // Safety checks: No negative stock allowed!
    if (updates.available < 0) {
      throw new BadRequestException('Operation rejected: available stock cannot go below zero');
    }
    if (updates.reserved < 0) {
      throw new BadRequestException('Operation rejected: reserved stock cannot go below zero');
    }
    if (updates.damaged < 0) {
      throw new BadRequestException('Operation rejected: damaged stock cannot go below zero');
    }
    if (updates.reject < 0) {
      throw new BadRequestException('Operation rejected: reject stock cannot go below zero');
    }

    // 4. Save recalculated balance
    await tx.inventoryBalance.update({
      where: { id: balance.id },
      data: updates,
    });

    return movement;
  }

  /**
   * Recalculates the inventory balance strictly by aggregating ALL historical ledger movements for a product.
   * This is the source of truth audit generator.
   */
  async recalculateBalanceFromLedger(tx: any, sellerId: string, productId: string) {
    const movements = await tx.inventoryMovement.findMany({
      where: { sellerId, productId },
    });

    const calculated = {
      available: 0,
      reserved: 0,
      damaged: 0,
      reject: 0,
    };

    const modifyCalculated = (status: InventoryStatus, amount: number) => {
      switch (status) {
        case InventoryStatus.AVAILABLE: calculated.available += amount; break;
        case InventoryStatus.RESERVED: calculated.reserved += amount; break;
        case InventoryStatus.DAMAGED: calculated.damaged += amount; break;
        case InventoryStatus.REJECT: calculated.reject += amount; break;
      }
    };

    for (const m of movements) {
      if (m.fromStatus) {
        modifyCalculated(m.fromStatus, -m.quantity);
      }
      if (m.toStatus) {
        modifyCalculated(m.toStatus, m.quantity);
      }

      // Add logical fallbacks
      if (m.movementType === MovementType.INBOUND && !m.fromStatus && !m.toStatus) {
        calculated.available += m.quantity;
      }
      if (m.movementType === MovementType.OUTBOUND && !m.fromStatus && !m.toStatus) {
        calculated.reserved -= m.quantity;
      }
      if (m.movementType === MovementType.RETURN && !m.fromStatus && !m.toStatus) {
        calculated.available += m.quantity;
      }
      if (m.movementType === MovementType.RESERVATION && !m.fromStatus && !m.toStatus) {
        calculated.available -= m.quantity;
        calculated.reserved += m.quantity;
      }
      if (m.movementType === MovementType.RELEASE && !m.fromStatus && !m.toStatus) {
        calculated.reserved -= m.quantity;
        calculated.available += m.quantity;
      }
    }

    const updatedBalance = await tx.inventoryBalance.upsert({
      where: { sellerId_productId: { sellerId, productId } },
      update: calculated,
      create: {
        sellerId,
        productId,
        ...calculated,
      },
    });

    return updatedBalance;
  }

  /**
   * Safe adjustment module triggered by stock opname or manager manual corrections.
   */
  async adjustStock(
    params: {
      sellerId: string;
      productId: string;
      adjustedBy: string;
      status: InventoryStatus;
      quantity: number; // Positive = add, Negative = subtract
      reason: string;
      notes?: string;
      referenceId?: string;
    },
  ) {
    const { sellerId, productId, adjustedBy, status, quantity, reason, notes, referenceId } = params;

    if (quantity === 0) {
      throw new BadRequestException('Adjustment quantity cannot be zero');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create adjustment audit trail
      const adj = await tx.inventoryAdjustment.create({
        data: {
          sellerId,
          productId,
          adjustedBy,
          status,
          quantity,
          reason,
          notes,
          referenceId,
        },
      });

      // 2. Perform ledger movement registration
      // If quantity is positive, it's adding to the warehouse: toStatus = status
      // If quantity is negative, it's removing: fromStatus = status
      await this.registerMovement(tx, {
        sellerId,
        productId,
        movementType: MovementType.ADJUSTMENT,
        quantity: Math.abs(quantity),
        fromStatus: quantity < 0 ? status : undefined,
        toStatus: quantity > 0 ? status : undefined,
        referenceType: 'ADJUSTMENT',
        referenceId: adj.id,
        referenceNo: `ADJ-${adj.id.slice(-6).toUpperCase()}`,
        notes: reason,
        createdBy: adjustedBy,
      });

      return adj;
    });

    await this.auditLogService.log({
      userId: adjustedBy,
      action: AuditAction.INVENTORY_CHANGE,
      entity: 'inventory_balances',
      entityId: productId,
      description: `Stock Adjusted for SKU ${product.sku} (${quantity > 0 ? '+' : ''}${quantity} ${status}): ${reason}`,
      after: result,
    });

    return result;
  }

  async getBalances(paginationDto: PaginationDto, sellerId?: string) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);

    const where: any = {
      product: { deletedAt: null },
    };

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (search) {
      where.product = {
        deletedAt: null,
        OR: [
          { sku: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [balances, total] = await Promise.all([
      this.prisma.inventoryBalance.findMany({
        where,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { product: { sku: 'asc' } },
        include: {
          product: true,
          seller: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.inventoryBalance.count({ where }),
    ]);

    return paginate(balances, total, page, limit);
  }

  async getMovements(paginationDto: PaginationDto, sellerId?: string) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);

    const where: any = {};
    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (search) {
      where.OR = [
        { referenceNo: { contains: search, mode: 'insensitive' } },
        { product: { sku: { contains: search, mode: 'insensitive' } } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [movements, total] = await Promise.all([
      this.prisma.inventoryMovement.findMany({
        where,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
        include: {
          product: true,
          seller: {
            select: { code: true, name: true },
          },
        },
      }),
      this.prisma.inventoryMovement.count({ where }),
    ]);

    return paginate(movements, total, page, limit);
  }
}
