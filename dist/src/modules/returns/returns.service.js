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
exports.ReturnsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const inventory_service_1 = require("../inventory/inventory.service");
const audit_log_service_1 = require("../../common/services/audit-log.service");
const notification_helper_service_1 = require("../../common/services/notification-helper.service");
const client_1 = require("@prisma/client");
let ReturnsService = class ReturnsService {
    constructor(prisma, inventoryService, auditLogService, notificationHelper) {
        this.prisma = prisma;
        this.inventoryService = inventoryService;
        this.auditLogService = auditLogService;
        this.notificationHelper = notificationHelper;
    }
    async create(dto, currentUserId) {
        const { sellerId, outboundId, reason, notes, items } = dto;
        if (items.length === 0) {
            throw new common_1.BadRequestException('Return must contain at least one item');
        }
        const prefixConfig = await this.prisma.warehouseConfig.findUnique({ where: { key: 'return.prefix' } });
        const prefix = prefixConfig ? prefixConfig.value : 'RTN';
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.prisma.return.count({
            where: { returnNo: { startsWith: `${prefix}-${dateStr}` } },
        });
        const seq = (count + 1).toString().padStart(4, '0');
        const returnNo = `${prefix}-${dateStr}-${seq}`;
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
                throw new common_1.NotFoundException('Linked outbound order not found');
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
                    status: client_1.ReturnStatus.SUBMITTED,
                    createdById: currentUserId,
                },
            });
            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product || product.deletedAt) {
                    throw new common_1.NotFoundException(`Product ID ${item.productId} not found`);
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
        await this.notificationHelper.notifyWarehouseStaff({
            sellerId,
            type: client_1.NotificationType.RETURN_RECEIVED,
            title: 'New Customer Return Filed',
            message: `Return ${retObj.returnNo} has been filed for seller. Ready for quality inspection.`,
            link: `/returns/${retObj.id}`,
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.CREATE,
            entity: 'returns',
            entityId: retObj.id,
            entityNo: retObj.returnNo,
            description: `Return document ${retObj.returnNo} created`,
            after: retObj,
        });
        return retObj;
    }
    async startInspecting(id, currentUserId) {
        const retObj = await this.findOne(id);
        if (retObj.status !== client_1.ReturnStatus.SUBMITTED) {
            throw new common_1.BadRequestException('Only returns in SUBMITTED status can be inspected');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const header = await tx.return.update({
                where: { id },
                data: {
                    status: client_1.ReturnStatus.INSPECTING,
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
            action: client_1.AuditAction.STATUS_CHANGE,
            entity: 'returns',
            entityId: id,
            entityNo: retObj.returnNo,
            description: `Return ${retObj.returnNo} status changed SUBMITTED -> INSPECTING`,
        });
        return updated;
    }
    async inspectAndComplete(id, dto, currentUserId) {
        const retObj = await this.findOne(id);
        if (retObj.status !== client_1.ReturnStatus.INSPECTING) {
            throw new common_1.BadRequestException('QC inspection must be started before completing returns');
        }
        const completed = await this.prisma.$transaction(async (tx) => {
            for (const item of dto.items) {
                const dbItem = retObj.items.find((i) => i.productId === item.productId);
                if (!dbItem) {
                    throw new common_1.BadRequestException(`Product ID ${item.productId} was not declared in this return shipment`);
                }
                const totalChecked = item.goodQty + item.damagedQty + item.rejectQty;
                if (totalChecked !== dbItem.quantity) {
                    throw new common_1.BadRequestException(`QC quantity mismatch. Product ${dbItem.product.sku} expected physical total: ${dbItem.quantity}, but you provided: ${totalChecked} (${item.goodQty} good, ${item.damagedQty} damaged, ${item.rejectQty} reject)`);
                }
                await tx.returnItem.update({
                    where: { id: dbItem.id },
                    data: {
                        goodQty: item.goodQty,
                        damagedQty: item.damagedQty,
                        rejectQty: item.rejectQty,
                    },
                });
                if (item.goodQty > 0) {
                    await this.inventoryService.registerMovement(tx, {
                        sellerId: retObj.sellerId,
                        productId: item.productId,
                        movementType: client_1.MovementType.RETURN,
                        quantity: item.goodQty,
                        toStatus: client_1.InventoryStatus.AVAILABLE,
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
                        movementType: client_1.MovementType.RETURN,
                        quantity: item.damagedQty,
                        toStatus: client_1.InventoryStatus.DAMAGED,
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
                        movementType: client_1.MovementType.RETURN,
                        quantity: item.rejectQty,
                        toStatus: client_1.InventoryStatus.REJECT,
                        referenceType: 'RETURN',
                        referenceId: retObj.id,
                        referenceNo: retObj.returnNo,
                        notes: 'Returned items - Rejected scrap',
                        createdBy: currentUserId,
                    });
                }
            }
            const header = await tx.return.update({
                where: { id },
                data: {
                    status: client_1.ReturnStatus.COMPLETED,
                    completedAt: new Date(),
                },
            });
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
        await this.notificationHelper.notifySellerUsers(retObj.sellerId, {
            type: client_1.NotificationType.RETURN_RECEIVED,
            title: 'Customer Return Restocked',
            message: `Return ${retObj.returnNo} has been inspected and restocked in inventory ledger.`,
            link: `/returns/${retObj.id}`,
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.STATUS_CHANGE,
            entity: 'returns',
            entityId: id,
            entityNo: retObj.returnNo,
            description: `Customer Return complete. Stock adjusted based on QC.`,
        });
        return completed;
    }
    async findAll(paginationDto, sellerId) {
        const { page, limit, search, sortBy, sortOrder } = paginationDto;
        const { skip, take } = (0, pagination_dto_1.getPaginationParams)(page, limit);
        const where = {};
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
        return (0, pagination_dto_1.paginate)(returns, total, page, limit);
    }
    async findOne(id, sellerId) {
        const where = { id };
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
            throw new common_1.NotFoundException('Customer return document not found');
        }
        return retObj;
    }
};
exports.ReturnsService = ReturnsService;
exports.ReturnsService = ReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_service_1.InventoryService,
        audit_log_service_1.AuditLogService,
        notification_helper_service_1.NotificationHelperService])
], ReturnsService);
//# sourceMappingURL=returns.service.js.map