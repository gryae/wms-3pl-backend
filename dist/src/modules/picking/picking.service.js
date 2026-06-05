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
exports.PickingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const audit_log_service_1 = require("../../common/services/audit-log.service");
const notification_helper_service_1 = require("../../common/services/notification-helper.service");
const client_1 = require("@prisma/client");
let PickingService = class PickingService {
    constructor(prisma, auditLogService, notificationHelper) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.notificationHelper = notificationHelper;
    }
    async findAll(paginationDto, userId, assignedOnly) {
        const { page, limit, search, sortBy, sortOrder } = paginationDto;
        const { skip, take } = (0, pagination_dto_1.getPaginationParams)(page, limit);
        const where = {};
        if (assignedOnly && userId) {
            where.assigneeId = userId;
        }
        if (search) {
            where.OR = [
                { outbound: { outboundNo: { contains: search, mode: 'insensitive' } } },
                { assignee: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }
        const [tasks, total] = await Promise.all([
            this.prisma.pickTask.findMany({
                where,
                skip,
                take,
                orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
                include: {
                    assignee: { select: { id: true, name: true, email: true } },
                    outbound: {
                        select: {
                            id: true,
                            outboundNo: true,
                            recipientName: true,
                            recipientAddress: true,
                            status: true,
                            seller: { select: { name: true } },
                        },
                    },
                },
            }),
            this.prisma.pickTask.count({ where }),
        ]);
        return (0, pagination_dto_1.paginate)(tasks, total, page, limit);
    }
    async findOne(id, sellerId) {
        const task = await this.prisma.pickTask.findUnique({
            where: { id },
            include: {
                assignee: { select: { id: true, name: true, email: true } },
                outbound: {
                    include: {
                        seller: true,
                        courier: true,
                        items: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
                items: true,
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Picking task not found');
        }
        if (sellerId && task.outbound.sellerId !== sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: You cannot access this picking task');
        }
        return task;
    }
    async assign(id, dto, currentUserId) {
        const task = await this.findOne(id);
        if (task.status !== client_1.PickTaskStatus.PENDING) {
            throw new common_1.BadRequestException('Can only assign pending picking tasks');
        }
        const picker = await this.prisma.user.findUnique({ where: { id: dto.pickerId } });
        if (!picker || picker.role !== 'WAREHOUSE_ADMIN' || picker.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Target user is not an active Warehouse Admin');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const updatedTask = await tx.pickTask.update({
                where: { id },
                data: {
                    assigneeId: dto.pickerId,
                },
                include: { assignee: true },
            });
            await tx.outboundTimeline.create({
                data: {
                    outboundId: task.outboundId,
                    action: 'Picking Assigned',
                    notes: `Picking task assigned to ${picker.name}`,
                    userId: currentUserId,
                    userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
                },
            });
            return updatedTask;
        });
        await this.notificationHelper.notify({
            userId: dto.pickerId,
            type: client_1.NotificationType.PICKING_ASSIGNED,
            title: 'New Picking Task Assigned',
            message: `You have been assigned picking task for order ${task.outbound.outboundNo}`,
            link: `/picking/${task.id}`,
        });
        return updated;
    }
    async start(id, currentUserId) {
        const task = await this.findOne(id);
        const user = await this.prisma.user.findUnique({ where: { id: currentUserId } });
        if (!user || user.role !== 'WAREHOUSE_ADMIN' || user.status !== 'ACTIVE') {
            throw new common_1.ForbiddenException('Only active Warehouse Admins can perform picking');
        }
        if (task.status !== client_1.PickTaskStatus.PENDING) {
            throw new common_1.BadRequestException('Task must be in PENDING status to start');
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedTask = await tx.pickTask.update({
                where: { id },
                data: {
                    status: client_1.PickTaskStatus.IN_PROGRESS,
                    startedAt: new Date(),
                    assigneeId: currentUserId,
                },
            });
            await tx.outbound.update({
                where: { id: task.outboundId },
                data: { status: client_1.OutboundStatus.PICKING },
            });
            await tx.outboundTimeline.create({
                data: {
                    outboundId: task.outboundId,
                    action: 'Picking Started',
                    notes: `Picker ${user.name} has started picking from inventory locations`,
                    userId: currentUserId,
                    userName: user.name,
                },
            });
            return updatedTask;
        });
    }
    async confirm(id, dto, currentUserId) {
        const task = await this.findOne(id);
        const user = await this.prisma.user.findUnique({ where: { id: currentUserId } });
        if (!user || user.role !== 'WAREHOUSE_ADMIN' || user.status !== 'ACTIVE') {
            throw new common_1.ForbiddenException('Only active Warehouse Admins can confirm picking');
        }
        if (task.status !== client_1.PickTaskStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Task must be IN_PROGRESS to confirm picked quantities');
        }
        const durationSeconds = task.startedAt
            ? Math.floor((Date.now() - new Date(task.startedAt).getTime()) / 1000)
            : 0;
        const durationMinutes = Math.ceil(durationSeconds / 60);
        const completed = await this.prisma.$transaction(async (tx) => {
            for (const item of dto.items) {
                const dbItem = task.items.find((i) => i.productId === item.productId);
                if (!dbItem) {
                    throw new common_1.BadRequestException(`Product ID ${item.productId} was not designated for this picking task`);
                }
                if (item.pickedQty > dbItem.requiredQty) {
                    throw new common_1.BadRequestException(`Over-picking not allowed. Item physical pick (${item.pickedQty}) cannot exceed requirement (${dbItem.requiredQty})`);
                }
                await tx.pickTaskItem.update({
                    where: { id: dbItem.id },
                    data: { pickedQty: item.pickedQty },
                });
                const outboundItem = await tx.outboundItem.findFirst({
                    where: { outboundId: task.outboundId, productId: item.productId },
                });
                if (outboundItem) {
                    await tx.outboundItem.update({
                        where: { id: outboundItem.id },
                        data: { pickedQty: item.pickedQty },
                    });
                }
            }
            const completedTask = await tx.pickTask.update({
                where: { id },
                data: {
                    status: client_1.PickTaskStatus.COMPLETED,
                    completedAt: new Date(),
                    notes: `Picking finished in ${durationMinutes} mins`,
                },
            });
            await tx.outbound.update({
                where: { id: task.outboundId },
                data: { status: client_1.OutboundStatus.PACKING },
            });
            await tx.outboundTimeline.create({
                data: {
                    outboundId: task.outboundId,
                    action: 'Picking Completed',
                    notes: `Picking finished by picker ${user.name} in ${durationMinutes} minutes. Assigned to packing list queue.`,
                    userId: currentUserId,
                    userName: user.name,
                },
            });
            const packTask = await tx.packTask.create({
                data: {
                    outboundId: task.outboundId,
                    status: client_1.PackTaskStatus.PENDING,
                },
            });
            for (const item of dto.items) {
                if (item.pickedQty > 0) {
                    await tx.packTaskItem.create({
                        data: {
                            packTaskId: packTask.id,
                            productId: item.productId,
                            quantity: item.pickedQty,
                        },
                    });
                }
            }
            return completedTask;
        });
        await this.notificationHelper.notifyWarehouseStaff({
            sellerId: task.outbound.sellerId,
            type: client_1.NotificationType.PACKING_ASSIGNED,
            title: 'New Packing Task Ready',
            message: `Order ${task.outbound.outboundNo} has been successfully picked. Ready for packaging.`,
            link: `/packing`,
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.UPDATE,
            entity: 'pick_tasks',
            entityId: id,
            entityNo: task.outbound.outboundNo,
            description: `Picking completed for order ${task.outbound.outboundNo}. Duration: ${durationMinutes} mins.`,
        });
        return completed;
    }
};
exports.PickingService = PickingService;
exports.PickingService = PickingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        notification_helper_service_1.NotificationHelperService])
], PickingService);
//# sourceMappingURL=picking.service.js.map