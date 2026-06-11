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
exports.OutboundService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const inventory_service_1 = require("../inventory/inventory.service");
const audit_log_service_1 = require("../../common/services/audit-log.service");
const notification_helper_service_1 = require("../../common/services/notification-helper.service");
const client_1 = require("@prisma/client");
let OutboundService = class OutboundService {
    constructor(prisma, inventoryService, auditLogService, notificationHelper) {
        this.prisma = prisma;
        this.inventoryService = inventoryService;
        this.auditLogService = auditLogService;
        this.notificationHelper = notificationHelper;
    }
    async create(dto, currentUserId) {
        const { sellerId, type, recipientName, recipientPhone, recipientAddress, recipientCity, recipientProvince, recipientPostcode, courierId, shippingCost, codAmount, notes, sellerAwbNo, items } = dto;
        if (items.length === 0) {
            throw new common_1.BadRequestException('Outbound order must contain at least one item');
        }
        const prefixConfig = await this.prisma.warehouseConfig.findUnique({ where: { key: 'outbound.prefix' } });
        const prefix = prefixConfig ? prefixConfig.value : 'OUT';
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.prisma.outbound.count({
            where: { outboundNo: { startsWith: `${prefix}-${dateStr}` } },
        });
        const seq = (count + 1).toString().padStart(4, '0');
        const outboundNo = `${prefix}-${dateStr}-${seq}`;
        if (courierId) {
            const courier = await this.prisma.courier.findUnique({ where: { id: courierId } });
            if (!courier) {
                throw new common_1.NotFoundException('Courier not found');
            }
        }
        const outbound = await this.prisma.$transaction(async (tx) => {
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
                    status: client_1.OutboundStatus.DRAFT,
                    createdById: currentUserId,
                },
            });
            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product || product.deletedAt) {
                    throw new common_1.NotFoundException(`Product ID ${item.productId} not found`);
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
            action: client_1.AuditAction.CREATE,
            entity: 'outbounds',
            entityId: outbound.id,
            entityNo: outbound.outboundNo,
            description: `Draft outbound order ${outbound.outboundNo} created`,
            after: outbound,
        });
        return outbound;
    }
    async submit(id, currentUserId) {
        const outbound = await this.findOne(id);
        if (outbound.status !== client_1.OutboundStatus.DRAFT) {
            throw new common_1.BadRequestException('Only DRAFT outbound orders can be submitted');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            for (const item of outbound.items) {
                const balance = await tx.inventoryBalance.findUnique({
                    where: { sellerId_productId: { sellerId: outbound.sellerId, productId: item.productId } },
                });
                if (!balance || balance.available < item.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for product SKU ${item.product.sku}. Available: ${balance ? balance.available : 0}, Required: ${item.quantity}`);
                }
                await this.inventoryService.registerMovement(tx, {
                    sellerId: outbound.sellerId,
                    productId: item.productId,
                    movementType: client_1.MovementType.RESERVATION,
                    quantity: item.quantity,
                    fromStatus: client_1.InventoryStatus.AVAILABLE,
                    toStatus: client_1.InventoryStatus.RESERVED,
                    referenceType: 'OUTBOUND',
                    referenceId: outbound.id,
                    referenceNo: outbound.outboundNo,
                    notes: 'Order submission - Stock reservation',
                    createdBy: currentUserId,
                });
            }
            const header = await tx.outbound.update({
                where: { id },
                data: { status: client_1.OutboundStatus.ALLOCATED },
            });
            await tx.outboundTimeline.create({
                data: {
                    outboundId: id,
                    action: 'Allocated',
                    notes: 'Stock allocation successful, order sent to picking queue',
                    userId: currentUserId,
                    userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
                },
            });
            const pickTask = await tx.pickTask.create({
                data: {
                    outboundId: id,
                    status: client_1.PickTaskStatus.PENDING,
                },
            });
            for (const item of outbound.items) {
                await tx.pickTaskItem.create({
                    data: {
                        pickTaskId: pickTask.id,
                        productId: item.productId,
                        requiredQty: item.quantity,
                        location: 'ZONE-A-RACK-01',
                    },
                });
            }
            return header;
        });
        await this.notificationHelper.notifyWarehouseStaff({
            sellerId: outbound.sellerId,
            type: client_1.NotificationType.OUTBOUND_SUBMITTED,
            title: 'New Outbound Order Allocated',
            message: `Outbound ${outbound.outboundNo} stock successfully reserved. Ready for picker assignment.`,
            link: `/picking`,
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.STATUS_CHANGE,
            entity: 'outbounds',
            entityId: id,
            entityNo: outbound.outboundNo,
            description: `Outbound order ${outbound.outboundNo} submitted, stock allocated`,
        });
        return updated;
    }
    async ship(id, trackingNumber, currentUserId) {
        if (!trackingNumber) {
            throw new common_1.BadRequestException('Tracking number is required to ship an order');
        }
        const outbound = await this.findOne(id);
        if (outbound.status !== client_1.OutboundStatus.READY_TO_SHIP) {
            throw new common_1.BadRequestException('Can only ship orders that are in READY_TO_SHIP status');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const header = await tx.outbound.update({
                where: { id },
                data: {
                    status: client_1.OutboundStatus.SHIPPED,
                    trackingNumber,
                    shippedAt: new Date(),
                },
            });
            for (const item of outbound.items) {
                await this.inventoryService.registerMovement(tx, {
                    sellerId: outbound.sellerId,
                    productId: item.productId,
                    movementType: client_1.MovementType.OUTBOUND,
                    quantity: item.quantity,
                    fromStatus: client_1.InventoryStatus.RESERVED,
                    referenceType: 'OUTBOUND',
                    referenceId: outbound.id,
                    referenceNo: outbound.outboundNo,
                    notes: `Order shipped via carrier tracking: ${trackingNumber}`,
                    createdBy: currentUserId,
                });
            }
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
        await this.notificationHelper.notifySellerUsers(outbound.sellerId, {
            type: client_1.NotificationType.SHIPMENT_COMPLETED,
            title: 'Order Handed to Courier',
            message: `Your outbound order ${outbound.outboundNo} has been shipped. Tracking: ${trackingNumber}`,
            link: `/outbound/${outbound.id}`,
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.STATUS_CHANGE,
            entity: 'outbounds',
            entityId: id,
            entityNo: outbound.outboundNo,
            description: `Order shipped. Tracking No: ${trackingNumber}`,
        });
        return updated;
    }
    async complete(id, currentUserId) {
        const outbound = await this.findOne(id);
        if (outbound.status !== client_1.OutboundStatus.SHIPPED) {
            throw new common_1.BadRequestException('Only SHIPPED orders can be marked as COMPLETED');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const header = await tx.outbound.update({
                where: { id },
                data: {
                    status: client_1.OutboundStatus.COMPLETED,
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
            action: client_1.AuditAction.STATUS_CHANGE,
            entity: 'outbounds',
            entityId: id,
            entityNo: outbound.outboundNo,
            description: `Order ${outbound.outboundNo} delivered successfully`,
        });
        return updated;
    }
    async cancel(id, reason, currentUserId) {
        const outbound = await this.findOne(id);
        const irreversible = [client_1.OutboundStatus.SHIPPED, client_1.OutboundStatus.COMPLETED, client_1.OutboundStatus.CANCELLED];
        if (irreversible.includes(outbound.status)) {
            throw new common_1.BadRequestException(`Cannot cancel outbound order that is already ${outbound.status}`);
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const needsRelease = [
                client_1.OutboundStatus.ALLOCATED,
                client_1.OutboundStatus.PICKING,
                client_1.OutboundStatus.PACKING,
                client_1.OutboundStatus.READY_TO_SHIP,
            ];
            if (needsRelease.includes(outbound.status)) {
                for (const item of outbound.items) {
                    await this.inventoryService.registerMovement(tx, {
                        sellerId: outbound.sellerId,
                        productId: item.productId,
                        movementType: client_1.MovementType.RELEASE,
                        quantity: item.quantity,
                        fromStatus: client_1.InventoryStatus.RESERVED,
                        toStatus: client_1.InventoryStatus.AVAILABLE,
                        referenceType: 'OUTBOUND',
                        referenceId: outbound.id,
                        referenceNo: outbound.outboundNo,
                        notes: 'Order cancelled - stock reservation released',
                        createdBy: currentUserId,
                    });
                }
            }
            await tx.pickTask.updateMany({
                where: { outboundId: id },
                data: { status: client_1.PickTaskStatus.CANCELLED },
            });
            await tx.packTask.updateMany({
                where: { outboundId: id },
                data: { status: client_1.PackTaskStatus.CANCELLED },
            });
            const header = await tx.outbound.update({
                where: { id },
                data: {
                    status: client_1.OutboundStatus.CANCELLED,
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
            action: client_1.AuditAction.STATUS_CHANGE,
            entity: 'outbounds',
            entityId: id,
            entityNo: outbound.outboundNo,
            description: `Order cancelled. Stock released. Reason: ${reason}`,
        });
        return updated;
    }
    async findAll(paginationDto, sellerId) {
        const { page, limit, search, sortBy, sortOrder } = paginationDto;
        const { skip, take } = (0, pagination_dto_1.getPaginationParams)(page, limit);
        const where = {
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
        return (0, pagination_dto_1.paginate)(outbounds, total, page, limit);
    }
    async findOne(id, sellerId) {
        const where = { id, deletedAt: null };
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
            throw new common_1.NotFoundException('Outbound order not found');
        }
        return outbound;
    }
};
exports.OutboundService = OutboundService;
exports.OutboundService = OutboundService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_service_1.InventoryService,
        audit_log_service_1.AuditLogService,
        notification_helper_service_1.NotificationHelperService])
], OutboundService);
//# sourceMappingURL=outbound.service.js.map