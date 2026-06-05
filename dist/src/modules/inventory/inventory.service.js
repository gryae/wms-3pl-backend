"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const audit_log_service_1 = require("../../common/services/audit-log.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let InventoryService = class InventoryService {
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    async registerMovement(tx, params) {
        const { sellerId, productId, movementType, quantity, fromStatus, toStatus, referenceType, referenceId, referenceNo, notes, createdBy, } = params;
        if (quantity <= 0) {
            throw new common_1.BadRequestException('Movement quantity must be greater than zero');
        }
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
        const updates = {
            available: balance.available,
            reserved: balance.reserved,
            damaged: balance.damaged,
            reject: balance.reject,
        };
        const modifyStatusQty = (status, amount) => {
            switch (status) {
                case client_1.InventoryStatus.AVAILABLE:
                    updates.available += amount;
                    break;
                case client_1.InventoryStatus.RESERVED:
                    updates.reserved += amount;
                    break;
                case client_1.InventoryStatus.DAMAGED:
                    updates.damaged += amount;
                    break;
                case client_1.InventoryStatus.REJECT:
                    updates.reject += amount;
                    break;
            }
        };
        if (fromStatus) {
            modifyStatusQty(fromStatus, -quantity);
        }
        if (toStatus) {
            modifyStatusQty(toStatus, quantity);
        }
        if (movementType === client_1.MovementType.INBOUND) {
            if (toStatus) {
            }
            else {
                updates.available += quantity;
            }
        }
        else if (movementType === client_1.MovementType.OUTBOUND) {
            if (fromStatus) {
            }
            else {
                updates.reserved -= quantity;
            }
        }
        else if (movementType === client_1.MovementType.RETURN) {
            if (toStatus) {
            }
            else {
                updates.available += quantity;
            }
        }
        else if (movementType === client_1.MovementType.RESERVATION) {
            if (!fromStatus && !toStatus) {
                updates.available -= quantity;
                updates.reserved += quantity;
            }
        }
        else if (movementType === client_1.MovementType.RELEASE) {
            if (!fromStatus && !toStatus) {
                updates.reserved -= quantity;
                updates.available += quantity;
            }
        }
        else if (movementType === client_1.MovementType.ADJUSTMENT) {
        }
        if (updates.available < 0) {
            throw new common_1.BadRequestException('Operation rejected: available stock cannot go below zero');
        }
        if (updates.reserved < 0) {
            throw new common_1.BadRequestException('Operation rejected: reserved stock cannot go below zero');
        }
        if (updates.damaged < 0) {
            throw new common_1.BadRequestException('Operation rejected: damaged stock cannot go below zero');
        }
        if (updates.reject < 0) {
            throw new common_1.BadRequestException('Operation rejected: reject stock cannot go below zero');
        }
        await tx.inventoryBalance.update({
            where: { id: balance.id },
            data: updates,
        });
        return movement;
    }
    async recalculateBalanceFromLedger(tx, sellerId, productId) {
        const movements = await tx.inventoryMovement.findMany({
            where: { sellerId, productId },
        });
        const calculated = {
            available: 0,
            reserved: 0,
            damaged: 0,
            reject: 0,
        };
        const modifyCalculated = (status, amount) => {
            switch (status) {
                case client_1.InventoryStatus.AVAILABLE:
                    calculated.available += amount;
                    break;
                case client_1.InventoryStatus.RESERVED:
                    calculated.reserved += amount;
                    break;
                case client_1.InventoryStatus.DAMAGED:
                    calculated.damaged += amount;
                    break;
                case client_1.InventoryStatus.REJECT:
                    calculated.reject += amount;
                    break;
            }
        };
        for (const m of movements) {
            if (m.fromStatus) {
                modifyCalculated(m.fromStatus, -m.quantity);
            }
            if (m.toStatus) {
                modifyCalculated(m.toStatus, m.quantity);
            }
            if (m.movementType === client_1.MovementType.INBOUND && !m.fromStatus && !m.toStatus) {
                calculated.available += m.quantity;
            }
            if (m.movementType === client_1.MovementType.OUTBOUND && !m.fromStatus && !m.toStatus) {
                calculated.reserved -= m.quantity;
            }
            if (m.movementType === client_1.MovementType.RETURN && !m.fromStatus && !m.toStatus) {
                calculated.available += m.quantity;
            }
            if (m.movementType === client_1.MovementType.RESERVATION && !m.fromStatus && !m.toStatus) {
                calculated.available -= m.quantity;
                calculated.reserved += m.quantity;
            }
            if (m.movementType === client_1.MovementType.RELEASE && !m.fromStatus && !m.toStatus) {
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
    async adjustStock(params) {
        const { sellerId, productId, adjustedBy, status, quantity, reason, notes, referenceId } = params;
        if (quantity === 0) {
            throw new common_1.BadRequestException('Adjustment quantity cannot be zero');
        }
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const result = await this.prisma.$transaction(async (tx) => {
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
            await this.registerMovement(tx, {
                sellerId,
                productId,
                movementType: client_1.MovementType.ADJUSTMENT,
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
            action: client_1.AuditAction.INVENTORY_CHANGE,
            entity: 'inventory_balances',
            entityId: productId,
            description: `Stock Adjusted for SKU ${product.sku} (${quantity > 0 ? '+' : ''}${quantity} ${status}): ${reason}`,
            after: result,
        });
        return result;
    }
    async getBalances(paginationDto, sellerId) {
        const { page, limit, search, sortBy, sortOrder } = paginationDto;
        const { skip, take } = (0, pagination_dto_1.getPaginationParams)(page, limit);
        const where = {
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
        return (0, pagination_dto_1.paginate)(balances, total, page, limit);
    }
    async getMovements(paginationDto, sellerId) {
        const { page, limit, search, sortBy, sortOrder } = paginationDto;
        const { skip, take } = (0, pagination_dto_1.getPaginationParams)(page, limit);
        const where = {};
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
        return (0, pagination_dto_1.paginate)(movements, total, page, limit);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map