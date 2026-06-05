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
exports.PackingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const audit_log_service_1 = require("../../common/services/audit-log.service");
const notification_helper_service_1 = require("../../common/services/notification-helper.service");
const client_1 = require("@prisma/client");
let PackingService = class PackingService {
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
            this.prisma.packTask.findMany({
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
            this.prisma.packTask.count({ where }),
        ]);
        return (0, pagination_dto_1.paginate)(tasks, total, page, limit);
    }
    async findOne(id, sellerId) {
        const task = await this.prisma.packTask.findUnique({
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
            throw new common_1.NotFoundException('Packing task not found');
        }
        if (sellerId && task.outbound.sellerId !== sellerId) {
            throw new common_1.ForbiddenException('Tenant Isolation: You cannot access this packing task');
        }
        return task;
    }
    async assign(id, dto, currentUserId) {
        const task = await this.findOne(id);
        if (task.status !== client_1.PackTaskStatus.PENDING) {
            throw new common_1.BadRequestException('Can only assign pending packing tasks');
        }
        const packer = await this.prisma.user.findUnique({ where: { id: dto.packerId } });
        if (!packer || packer.role !== 'WAREHOUSE_ADMIN' || packer.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Target user is not an active Warehouse Admin');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const updatedTask = await tx.packTask.update({
                where: { id },
                data: {
                    assigneeId: dto.packerId,
                },
                include: { assignee: true },
            });
            await tx.outboundTimeline.create({
                data: {
                    outboundId: task.outboundId,
                    action: 'Packing Assigned',
                    notes: `Packing task assigned to ${packer.name}`,
                    userId: currentUserId,
                    userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
                },
            });
            return updatedTask;
        });
        await this.notificationHelper.notify({
            userId: dto.packerId,
            type: client_1.NotificationType.PACKING_ASSIGNED,
            title: 'New Packing Task Assigned',
            message: `You have been assigned packing task for order ${task.outbound.outboundNo}`,
            link: `/packing/${task.id}`,
        });
        return updated;
    }
    async start(id, currentUserId) {
        const task = await this.findOne(id);
        const user = await this.prisma.user.findUnique({ where: { id: currentUserId } });
        if (!user || user.role !== 'WAREHOUSE_ADMIN' || user.status !== 'ACTIVE') {
            throw new common_1.ForbiddenException('Only active Warehouse Admins can perform packing');
        }
        if (task.status !== client_1.PackTaskStatus.PENDING) {
            throw new common_1.BadRequestException('Task must be in PENDING status to start');
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedTask = await tx.packTask.update({
                where: { id },
                data: {
                    status: client_1.PackTaskStatus.IN_PROGRESS,
                    startedAt: new Date(),
                    assigneeId: currentUserId,
                },
            });
            await tx.outboundTimeline.create({
                data: {
                    outboundId: task.outboundId,
                    action: 'Packing Started',
                    notes: `Packer ${user.name} has started packing items in shipping box`,
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
            throw new common_1.ForbiddenException('Only active Warehouse Admins can confirm packing');
        }
        if (task.status !== client_1.PackTaskStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Task must be IN_PROGRESS to confirm packing');
        }
        const durationSeconds = task.startedAt
            ? Math.floor((Date.now() - new Date(task.startedAt).getTime()) / 1000)
            : 0;
        const durationMinutes = Math.ceil(durationSeconds / 60);
        const completed = await this.prisma.$transaction(async (tx) => {
            for (const item of dto.items) {
                const dbItem = task.items.find((i) => i.productId === item.productId);
                if (!dbItem) {
                    throw new common_1.BadRequestException(`Product ID ${item.productId} was not designated for this packing task`);
                }
                if (item.packedQty > dbItem.quantity) {
                    throw new common_1.BadRequestException(`Over-packaging not allowed. Item packed quantity (${item.packedQty}) cannot exceed requirement (${dbItem.quantity})`);
                }
                await tx.packTaskItem.update({
                    where: { id: dbItem.id },
                    data: { packedQty: item.packedQty },
                });
                const outboundItem = await tx.outboundItem.findFirst({
                    where: { outboundId: task.outboundId, productId: item.productId },
                });
                if (outboundItem) {
                    await tx.outboundItem.update({
                        where: { id: outboundItem.id },
                        data: { packedQty: item.packedQty },
                    });
                }
            }
            const completedTask = await tx.packTask.update({
                where: { id },
                data: {
                    status: client_1.PackTaskStatus.COMPLETED,
                    completedAt: new Date(),
                    boxCount: dto.boxCount,
                    weight: dto.weight,
                    notes: dto.notes || `Packing finished in ${durationMinutes} mins`,
                },
            });
            await tx.outbound.update({
                where: { id: task.outboundId },
                data: {
                    status: client_1.OutboundStatus.READY_TO_SHIP,
                },
            });
            await tx.outboundTimeline.create({
                data: {
                    outboundId: task.outboundId,
                    action: 'Packed',
                    notes: `Packaging completed by ${user.name} in ${durationMinutes} mins. Box count: ${dto.boxCount}. Weight: ${dto.weight}kg. Ready for carrier dispatch.`,
                    userId: currentUserId,
                    userName: user.name,
                },
            });
            return completedTask;
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.UPDATE,
            entity: 'pack_tasks',
            entityId: id,
            entityNo: task.outbound.outboundNo,
            description: `Packing completed for order ${task.outbound.outboundNo}. Box count: ${dto.boxCount}, Weight: ${dto.weight}kg.`,
        });
        return completed;
    }
};
exports.PackingService = PackingService;
exports.PackingService = PackingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        notification_helper_service_1.NotificationHelperService])
], PackingService);
//# sourceMappingURL=packing.service.js.map