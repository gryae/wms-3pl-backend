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
exports.InboundService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const inventory_service_1 = require("../inventory/inventory.service");
const audit_log_service_1 = require("../../common/services/audit-log.service");
const notification_helper_service_1 = require("../../common/services/notification-helper.service");
const client_1 = require("@prisma/client");
let InboundService = class InboundService {
    constructor(prisma, inventoryService, auditLogService, notificationHelper) {
        this.prisma = prisma;
        this.inventoryService = inventoryService;
        this.auditLogService = auditLogService;
        this.notificationHelper = notificationHelper;
    }
    async create(dto, currentUserId) {
        const { sellerId, type, referenceNo, notes, items } = dto;
        if (items.length === 0) {
            throw new common_1.BadRequestException('Inbound must contain at least one item');
        }
        const prefixConfig = await this.prisma.warehouseConfig.findUnique({ where: { key: 'inbound.prefix' } });
        const prefix = prefixConfig ? prefixConfig.value : 'IN';
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.prisma.inbound.count({
            where: { inboundNo: { startsWith: `${prefix}-${dateStr}` } },
        });
        const seq = (count + 1).toString().padStart(4, '0');
        const inboundNo = `${prefix}-${dateStr}-${seq}`;
        const inbound = await this.prisma.$transaction(async (tx) => {
            const header = await tx.inbound.create({
                data: {
                    inboundNo,
                    sellerId,
                    type,
                    referenceNo,
                    notes,
                    status: client_1.InboundStatus.DRAFT,
                    createdById: currentUserId,
                },
            });
            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product || product.deletedAt) {
                    throw new common_1.NotFoundException(`Product with ID ${item.productId} not found`);
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
            action: client_1.AuditAction.CREATE,
            entity: 'inbounds',
            entityId: inbound.id,
            entityNo: inbound.inboundNo,
            description: `Draft Inbound ${inbound.inboundNo} created`,
            after: inbound,
        });
        return inbound;
    }
    async submit(id, currentUserId) {
        const inbound = await this.findOne(id);
        if (inbound.status !== client_1.InboundStatus.DRAFT) {
            throw new common_1.BadRequestException('Only DRAFT inbound documents can be submitted');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const header = await tx.inbound.update({
                where: { id },
                data: { status: client_1.InboundStatus.SUBMITTED },
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
        await this.notificationHelper.notifyWarehouseStaff({
            sellerId: inbound.sellerId,
            type: client_1.NotificationType.INBOUND_SUBMITTED,
            title: 'New Inbound Shipment Submitted',
            message: `Inbound ${inbound.inboundNo} has been submitted by seller.`,
            link: `/inbound/${inbound.id}`,
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.STATUS_CHANGE,
            entity: 'inbounds',
            entityId: id,
            entityNo: inbound.inboundNo,
            description: `Inbound ${inbound.inboundNo} status changed DRAFT -> SUBMITTED`,
        });
        return updated;
    }
    async startReceiving(id, currentUserId) {
        const inbound = await this.findOne(id);
        if (inbound.status !== client_1.InboundStatus.SUBMITTED) {
            throw new common_1.BadRequestException('Can only start receiving inbounds that are in SUBMITTED status');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const header = await tx.inbound.update({
                where: { id },
                data: {
                    status: client_1.InboundStatus.RECEIVING,
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
            action: client_1.AuditAction.STATUS_CHANGE,
            entity: 'inbounds',
            entityId: id,
            entityNo: inbound.inboundNo,
            description: `Inbound receiving started by supervisor`,
        });
        return updated;
    }
    async receive(id, dto, currentUserId) {
        const inbound = await this.findOne(id);
        if (inbound.status !== client_1.InboundStatus.RECEIVING) {
            throw new common_1.BadRequestException('Cannot record receipts for inbound not in RECEIVING status');
        }
        await this.prisma.$transaction(async (tx) => {
            for (const item of dto.items) {
                const dbItem = inbound.items.find((i) => i.productId === item.productId);
                if (!dbItem) {
                    throw new common_1.BadRequestException(`Product ID ${item.productId} was not declared in this inbound shipment`);
                }
                if (item.receivedQty + item.rejectQty > dbItem.expectedQty) {
                    throw new common_1.BadRequestException(`Over-receiving rejected. Item ${dbItem.product.sku}: physical total (${item.receivedQty} received + ${item.rejectQty} rejected) cannot exceed expected (${dbItem.expectedQty})`);
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
    async complete(id, currentUserId) {
        const inbound = await this.findOne(id);
        if (inbound.status !== client_1.InboundStatus.RECEIVING) {
            throw new common_1.BadRequestException('Only inbounds currently in RECEIVING status can be completed');
        }
        const incompleteItems = inbound.items.filter((item) => item.receivedQty + item.rejectQty !== item.expectedQty);
        if (incompleteItems.length > 0) {
            const details = incompleteItems
                .map((item) => `SKU ${item.product.sku}: expected ${item.expectedQty}, counted ${item.receivedQty + item.rejectQty} (${item.receivedQty} good + ${item.rejectQty} bad)`)
                .join('; ');
            throw new common_1.BadRequestException(`Cannot finalize: physical count does not match expected quantity for the following item(s): ${details}`);
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const header = await tx.inbound.update({
                where: { id },
                data: {
                    status: client_1.InboundStatus.COMPLETED,
                    completedAt: new Date(),
                },
            });
            for (const item of inbound.items) {
                if (item.receivedQty > 0) {
                    await this.inventoryService.registerMovement(tx, {
                        sellerId: inbound.sellerId,
                        productId: item.productId,
                        movementType: client_1.MovementType.INBOUND,
                        quantity: item.receivedQty,
                        toStatus: client_1.InventoryStatus.AVAILABLE,
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
                        movementType: client_1.MovementType.INBOUND,
                        quantity: item.rejectQty,
                        toStatus: client_1.InventoryStatus.REJECT,
                        referenceType: 'INBOUND',
                        referenceId: inbound.id,
                        referenceNo: inbound.inboundNo,
                        notes: 'Physical receive rejected stock',
                        createdBy: currentUserId,
                    });
                }
            }
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
        await this.notificationHelper.notifySellerUsers(inbound.sellerId, {
            type: client_1.NotificationType.INBOUND_COMPLETED,
            title: 'Inbound Shipment Completed',
            message: `Inbound ${inbound.inboundNo} has been completed and items are now in active inventory.`,
            link: `/inbound/${inbound.id}`,
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.STATUS_CHANGE,
            entity: 'inbounds',
            entityId: id,
            entityNo: inbound.inboundNo,
            description: `Inbound completed and inventory ledger updated`,
        });
        return updated;
    }
    async cancel(id, reason, currentUserId) {
        const inbound = await this.findOne(id);
        if (inbound.status === client_1.InboundStatus.COMPLETED || inbound.status === client_1.InboundStatus.CANCELLED) {
            throw new common_1.BadRequestException('Completed or already cancelled inbounds cannot be cancelled');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const header = await tx.inbound.update({
                where: { id },
                data: {
                    status: client_1.InboundStatus.CANCELLED,
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
            action: client_1.AuditAction.STATUS_CHANGE,
            entity: 'inbounds',
            entityId: id,
            entityNo: inbound.inboundNo,
            description: `Inbound cancelled by user. Reason: ${reason}`,
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
        return (0, pagination_dto_1.paginate)(inbounds, total, page, limit);
    }
    async findOne(id, sellerId) {
        const where = { id, deletedAt: null };
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
            throw new common_1.NotFoundException('Inbound shipment not found');
        }
        return inbound;
    }
};
exports.InboundService = InboundService;
exports.InboundService = InboundService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_service_1.InventoryService,
        audit_log_service_1.AuditLogService,
        notification_helper_service_1.NotificationHelperService])
], InboundService);
//# sourceMappingURL=inbound.service.js.map