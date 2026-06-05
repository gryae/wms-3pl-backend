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
exports.SellersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const audit_log_service_1 = require("../../common/services/audit-log.service");
const client_1 = require("@prisma/client");
let SellersService = class SellersService {
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    async create(createSellerDto, currentUserId) {
        const { code, name, address, phone, email, status, logoUrl } = createSellerDto;
        const existing = await this.prisma.seller.findUnique({
            where: { code },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Seller with code ${code} already exists`);
        }
        const seller = await this.prisma.seller.create({
            data: {
                code,
                name,
                address,
                phone,
                email,
                status,
                logoUrl,
            },
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.CREATE,
            entity: 'sellers',
            entityId: seller.id,
            entityNo: seller.code,
            description: `Created seller ${seller.name} (${seller.code})`,
            after: seller,
        });
        return seller;
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
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [sellers, total] = await Promise.all([
            this.prisma.seller.findMany({
                where,
                skip,
                take,
                orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
            }),
            this.prisma.seller.count({ where }),
        ]);
        return (0, pagination_dto_1.paginate)(sellers, total, page, limit);
    }
    async findOne(id) {
        const seller = await this.prisma.seller.findFirst({
            where: { id, deletedAt: null },
        });
        if (!seller) {
            throw new common_1.NotFoundException('Seller not found');
        }
        return seller;
    }
    async update(id, updateSellerDto, currentUserId) {
        const seller = await this.findOne(id);
        const before = { ...seller };
        const updated = await this.prisma.seller.update({
            where: { id },
            data: updateSellerDto,
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.UPDATE,
            entity: 'sellers',
            entityId: id,
            entityNo: seller.code,
            description: `Updated seller info for ${seller.code}`,
            before,
            after: updated,
        });
        return updated;
    }
    async remove(id, currentUserId) {
        const seller = await this.findOne(id);
        await this.prisma.$transaction([
            this.prisma.seller.update({
                where: { id },
                data: { deletedAt: new Date(), status: 'INACTIVE' },
            }),
            this.prisma.user.updateMany({
                where: { sellerId: id },
                data: { deletedAt: new Date(), status: 'INACTIVE' },
            }),
        ]);
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.DELETE,
            entity: 'sellers',
            entityId: id,
            entityNo: seller.code,
            description: `Soft-deleted seller ${seller.name} (${seller.code}) and associated users`,
            before: seller,
        });
        return { message: 'Seller and its users deleted successfully' };
    }
};
exports.SellersService = SellersService;
exports.SellersService = SellersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], SellersService);
//# sourceMappingURL=sellers.service.js.map