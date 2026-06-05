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
exports.CouriersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const audit_log_service_1 = require("../../common/services/audit-log.service");
const client_1 = require("@prisma/client");
let CouriersService = class CouriersService {
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    async create(createCourierDto, currentUserId) {
        const { code, name, logo, isActive } = createCourierDto;
        const existing = await this.prisma.courier.findUnique({
            where: { code },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Courier code ${code} is already registered`);
        }
        const courier = await this.prisma.courier.create({
            data: { code, name, logo, isActive },
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.CREATE,
            entity: 'couriers',
            entityId: courier.id,
            entityNo: courier.code,
            description: `Created courier ${courier.name} (${courier.code})`,
            after: courier,
        });
        return courier;
    }
    async findAll(paginationDto) {
        const { page, limit, search, sortBy, sortOrder } = paginationDto;
        const { skip, take } = (0, pagination_dto_1.getPaginationParams)(page, limit);
        const where = {
            deletedAt: null,
        };
        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [couriers, total] = await Promise.all([
            this.prisma.courier.findMany({
                where,
                skip,
                take,
                orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
            }),
            this.prisma.courier.count({ where }),
        ]);
        return (0, pagination_dto_1.paginate)(couriers, total, page, limit);
    }
    async findOne(id) {
        const courier = await this.prisma.courier.findFirst({
            where: { id, deletedAt: null },
        });
        if (!courier) {
            throw new common_1.NotFoundException('Courier not found');
        }
        return courier;
    }
    async update(id, updateCourierDto, currentUserId) {
        const courier = await this.findOne(id);
        const before = { ...courier };
        const updated = await this.prisma.courier.update({
            where: { id },
            data: updateCourierDto,
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.UPDATE,
            entity: 'couriers',
            entityId: id,
            entityNo: courier.code,
            description: `Updated courier properties for ${courier.code}`,
            before,
            after: updated,
        });
        return updated;
    }
    async remove(id, currentUserId) {
        const courier = await this.findOne(id);
        await this.prisma.courier.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.DELETE,
            entity: 'couriers',
            entityId: id,
            entityNo: courier.code,
            description: `Soft-deleted courier ${courier.name} (${courier.code})`,
            before: courier,
        });
        return { message: 'Courier deleted successfully' };
    }
};
exports.CouriersService = CouriersService;
exports.CouriersService = CouriersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], CouriersService);
//# sourceMappingURL=couriers.service.js.map