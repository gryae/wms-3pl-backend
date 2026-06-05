import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { PaginationDto, paginate, getPaginationParams } from '../../common/dto/pagination.dto';
import { AuditLogService } from '../../common/services/audit-log.service';
import { AuditAction } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async create(createUserDto: CreateUserDto, currentUserId?: string) {
    const { email, password, name, phone, role, sellerId, status } = createUserDto;

    // Check unique email
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    // Verify seller if sellerId provided
    if (sellerId) {
      const seller = await this.prisma.seller.findUnique({ where: { id: sellerId } });
      if (!seller) {
        throw new NotFoundException('Seller not found');
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

    // Remove password from response
    delete user.password;

    // Audit log
    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.CREATE,
      entity: 'users',
      entityId: user.id,
      description: `Created user ${user.email} with role ${user.role}`,
      after: user,
    });

    return user;
  }

  async findAll(paginationDto: PaginationDto, sellerId?: string) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);

    const where: any = {
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

    // Strip passwords
    const safeUsers = users.map((u) => {
      const { password, ...safeUser } = u;
      return safeUser;
    });

    return paginate(safeUsers, total, page, limit);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        seller: true,
        preferences: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    delete user.password;
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUserId?: string) {
    const user = await this.findOne(id);

    const before = { ...user };
    const { email, password, name, phone, role, sellerId, status } = updateUserDto;

    const data: any = {};
    if (email && email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new BadRequestException('Email already in use');
      }
      data.email = email;
    }

    if (password) {
      data.password = await bcrypt.hash(password, 12);
    }

    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (role !== undefined) data.role = role;
    if (sellerId !== undefined) {
      if (sellerId) {
        const seller = await this.prisma.seller.findUnique({ where: { id: sellerId } });
        if (!seller) {
          throw new NotFoundException('Seller not found');
        }
      }
      data.sellerId = sellerId;
    }
    if (status !== undefined) data.status = status;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    delete updatedUser.password;

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.UPDATE,
      entity: 'users',
      entityId: id,
      description: `Updated user info for ${user.email}`,
      before,
      after: updatedUser,
    });

    return updatedUser;
  }

  async remove(id: string, currentUserId?: string) {
    const user = await this.findOne(id);

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.DELETE,
      entity: 'users',
      entityId: id,
      description: `Soft-deleted user ${user.email}`,
      before: user,
    });

    return { message: 'User deleted successfully' };
  }

  async getPreferences(userId: string) {
    const prefs = await this.prisma.userPreference.findUnique({
      where: { userId },
    });
    if (!prefs) {
      throw new NotFoundException('Preferences not found');
    }
    return prefs;
  }

  async updatePreferences(userId: string, dto: UpdatePreferenceDto) {
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
}
