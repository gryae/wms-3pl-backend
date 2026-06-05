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
exports.StockOpnameService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const inventory_service_1 = require("../inventory/inventory.service");
const audit_log_service_1 = require("../../common/services/audit-log.service");
const notification_helper_service_1 = require("../../common/services/notification-helper.service");
const client_1 = require("@prisma/client");
let StockOpnameService = class StockOpnameService {
    constructor(prisma, inventoryService, auditLogService, notificationHelper) {
        this.prisma = prisma;
        this.inventoryService = inventoryService;
        this.auditLogService = auditLogService;
        this.notificationHelper = notificationHelper;
    }
    async create(dto, currentUserId) {
        const { sellerId, notes, productIds } = dto;
        if (productIds.length === 0) {
            throw new common_1.BadRequestException('Opname count session must include at least one product ID');
        }
        const prefixConfig = await this.prisma.warehouseConfig.findUnique({ where: { key: 'opname.prefix' } });
        const prefix = prefixConfig ? prefixConfig.value : 'OPN';
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.prisma.stockOpname.count({
            where: { opnameNo: { startsWith: `${prefix}-${dateStr}` } },
        });
        const seq = (count + 1).toString().padStart(4, '0');
        const opnameNo = `${prefix}-${dateStr}-${seq}`;
        const opname = await this.prisma.$transaction(async (tx) => {
            const header = await tx.stockOpname.create({
                data: {
                    opnameNo,
                    sellerId,
                    notes,
                    status: client_1.StockOpnameStatus.DRAFT,
                    createdById: currentUserId,
                },
            });
            for (const productId of productIds) {
                const product = await tx.product.findUnique({ where: { id: productId } });
                if (!product || product.deletedAt || product.sellerId !== sellerId) {
                    throw new common_1.NotFoundException(`Active product with ID ${productId} not found for this seller`);
                }
                const balance = await tx.inventoryBalance.findUnique({
                    where: { sellerId_productId: { sellerId, productId } },
                });
                const systemQty = balance ? balance.available : 0;
                await tx.stockOpnameItem.create({
                    data: {
                        opnameId: header.id,
                        productId,
                        systemQty,
                        physicalQty: systemQty,
                        variance: 0,
                    },
                });
            }
            return header;
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.CREATE,
            entity: 'stock_opnames',
            entityId: opname.id,
            entityNo: opname.opnameNo,
            description: `Stock Opname count session ${opname.opnameNo} initialized (DRAFT)`,
            after: opname,
        });
        return opname;
    }
    async startCounting(id, currentUserId) {
        const opname = await this.findOne(id);
        if (opname.status !== client_1.StockOpnameStatus.DRAFT) {
            throw new common_1.BadRequestException('Only DRAFT opname sessions can be started');
        }
        const updated = await this.prisma.stockOpname.update({
            where: { id },
            data: { status: client_1.StockOpnameStatus.COUNTING },
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.STATUS_CHANGE,
            entity: 'stock_opnames',
            entityId: id,
            entityNo: opname.opnameNo,
            description: `Stock count started for opname session ${opname.opnameNo}`,
        });
        return updated;
    }
    async recordCount(id, dto, currentUserId) {
        const opname = await this.findOne(id);
        if (opname.status !== client_1.StockOpnameStatus.COUNTING) {
            throw new common_1.BadRequestException('Cannot record physical counts for session not in COUNTING status');
        }
        await this.prisma.$transaction(async (tx) => {
            for (const item of dto.items) {
                const dbItem = opname.items.find((i) => i.productId === item.productId);
                if (!dbItem) {
                    throw new common_1.BadRequestException(`Product ID ${item.productId} was not included in this count session`);
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
    async complete(id, currentUserId) {
        const opname = await this.findOne(id);
        if (opname.status !== client_1.StockOpnameStatus.COUNTING) {
            throw new common_1.BadRequestException('Only sessions in COUNTING status can be completed');
        }
        const completed = await this.prisma.$transaction(async (tx) => {
            for (const item of opname.items) {
                if (item.variance !== 0) {
                    await this.inventoryService.adjustStock({
                        sellerId: opname.sellerId,
                        productId: item.productId,
                        adjustedBy: currentUserId,
                        status: client_1.InventoryStatus.AVAILABLE,
                        quantity: item.variance,
                        reason: `Stock Opname discrepancy correction. Session: ${opname.opnameNo}. Remarks: ${item.reason || '-'}`,
                        referenceId: opname.id,
                    });
                }
            }
            const header = await tx.stockOpname.update({
                where: { id },
                data: {
                    status: client_1.StockOpnameStatus.COMPLETED,
                    completedAt: new Date(),
                    countedAt: new Date(),
                },
            });
            return header;
        });
        await this.notificationHelper.notifySellerUsers(opname.sellerId, {
            type: client_1.NotificationType.STOCK_OPNAME_COMPLETED,
            title: 'Warehouse Stock Count Complete',
            message: `Stock Opname count session ${opname.opnameNo} completed. Inventory ledger updated to match physical audit.`,
            link: `/inventory/balances`,
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.STATUS_CHANGE,
            entity: 'stock_opnames',
            entityId: id,
            entityNo: opname.opnameNo,
            description: `Stock Opname count complete. Discrepancies and stock variances adjusted successfully.`,
        });
        return completed;
    }
    async cancel(id, currentUserId) {
        const opname = await this.findOne(id);
        if (opname.status === client_1.StockOpnameStatus.COMPLETED || opname.status === client_1.StockOpnameStatus.CANCELLED) {
            throw new common_1.BadRequestException('Completed or already cancelled sessions cannot be cancelled');
        }
        const updated = await this.prisma.stockOpname.update({
            where: { id },
            data: { status: client_1.StockOpnameStatus.CANCELLED },
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.STATUS_CHANGE,
            entity: 'stock_opnames',
            entityId: id,
            entityNo: opname.opnameNo,
            description: `Stock Opname session ${opname.opnameNo} cancelled by supervisor`,
        });
        return updated;
    }
    async findAll(paginationDto, sellerId) {
        const { page, limit, search, sortBy, sortOrder } = paginationDto;
        const { skip, take } = (0, pagination_dto_1.getPaginationParams)(page, limit);
        const where = {};
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
        return (0, pagination_dto_1.paginate)(opnames, total, page, limit);
    }
    async findOne(id, sellerId) {
        const where = { id };
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
            throw new common_1.NotFoundException('Stock opname session not found');
        }
        return opname;
    }
};
exports.StockOpnameService = StockOpnameService;
exports.StockOpnameService = StockOpnameService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_service_1.InventoryService,
        audit_log_service_1.AuditLogService,
        notification_helper_service_1.NotificationHelperService])
], StockOpnameService);
//# sourceMappingURL=stock-opname.service.js.map