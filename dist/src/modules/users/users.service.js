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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const audit_log_service_1 = require("../../common/services/audit-log.service");
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    async create(createUserDto, currentUserId) {
        const { email, password, name, phone, role, sellerId, status } = createUserDto;
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new common_1.BadRequestException('Email already registered');
        }
        if (sellerId) {
            const seller = await this.prisma.seller.findUnique({ where: { id: sellerId } });
            if (!seller) {
                throw new common_1.NotFoundException('Seller not found');
            }
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await this.prisma.$transaction(async (tx) => {
            const createdUser = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    phone,
                    role,
                    sellerId,
                    status,
                },
            });
            await tx.userPreference.create({
                data: {
                    userId: createdUser.id,
                    language: 'EN',
                    theme: 'light',
                    timezone: 'Asia/Jakarta',
                },
            });
            return createdUser;
        });
        delete user.password;
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.CREATE,
            entity: 'users',
            entityId: user.id,
            description: `Created user ${user.email} with role ${user.role}`,
            after: user,
        });
        return user;
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
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take,
                orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
                include: {
                    seller: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        const safeUsers = users.map((u) => {
            const { password, ...safeUser } = u;
            return safeUser;
        });
        return (0, pagination_dto_1.paginate)(safeUsers, total, page, limit);
    }
    async findOne(id) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            include: {
                seller: true,
                preferences: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        delete user.password;
        return user;
    }
    async update(id, updateUserDto, currentUserId) {
        const user = await this.findOne(id);
        const before = { ...user };
        const { email, password, name, phone, role, sellerId, status } = updateUserDto;
        const data = {};
        if (email && email !== user.email) {
            const existing = await this.prisma.user.findUnique({ where: { email } });
            if (existing) {
                throw new common_1.BadRequestException('Email already in use');
            }
            data.email = email;
        }
        if (password) {
            data.password = await bcrypt.hash(password, 12);
        }
        if (name !== undefined)
            data.name = name;
        if (phone !== undefined)
            data.phone = phone;
        if (role !== undefined)
            data.role = role;
        if (sellerId !== undefined) {
            if (sellerId) {
                const seller = await this.prisma.seller.findUnique({ where: { id: sellerId } });
                if (!seller) {
                    throw new common_1.NotFoundException('Seller not found');
                }
            }
            data.sellerId = sellerId;
        }
        if (status !== undefined)
            data.status = status;
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data,
        });
        delete updatedUser.password;
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.UPDATE,
            entity: 'users',
            entityId: id,
            description: `Updated user info for ${user.email}`,
            before,
            after: updatedUser,
        });
        return updatedUser;
    }
    async remove(id, currentUserId) {
        const user = await this.findOne(id);
        await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'INACTIVE' },
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.DELETE,
            entity: 'users',
            entityId: id,
            description: `Soft-deleted user ${user.email}`,
            before: user,
        });
        return { message: 'User deleted successfully' };
    }
    async getPreferences(userId) {
        const prefs = await this.prisma.userPreference.findUnique({
            where: { userId },
        });
        if (!prefs) {
            throw new common_1.NotFoundException('Preferences not found');
        }
        return prefs;
    }
    async updatePreferences(userId, dto) {
        const prefs = await this.prisma.userPreference.upsert({
            where: { userId },
            update: dto,
            create: {
                userId,
                language: dto.language || 'EN',
                theme: dto.theme || 'light',
                timezone: dto.timezone || 'Asia/Jakarta',
            },
        });
        return prefs;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], UsersService);
//# sourceMappingURL=users.service.js.map