import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { PaginationDto, paginate, getPaginationParams } from '../../common/dto/pagination.dto';
import { AuditLogService } from '../../common/services/audit-log.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class SellersService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async create(createSellerDto: CreateSellerDto, currentUserId?: string) {
    const { code, name, address, phone, email, status, logoUrl } = createSellerDto;

    // Check code unique
    const existing = await this.prisma.seller.findUnique({
      where: { code },
    });
    if (existing) {
      throw new BadRequestException(`Seller with code ${code} already exists`);
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
      action: AuditAction.CREATE,
      entity: 'sellers',
      entityId: seller.id,
      entityNo: seller.code,
      description: `Created seller ${seller.name} (${seller.code})`,
      after: seller,
    });

    return seller;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);

    const where: any = {
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

    return paginate(sellers, total, page, limit);
  }

  async findOne(id: string) {
    const seller = await this.prisma.seller.findFirst({
      where: { id, deletedAt: null },
    });
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }
    return seller;
  }

  async update(id: string, updateSellerDto: UpdateSellerDto, currentUserId?: string) {
    const seller = await this.findOne(id);
    const before = { ...seller };

    const updated = await this.prisma.seller.update({
      where: { id },
      data: updateSellerDto,
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.UPDATE,
      entity: 'sellers',
      entityId: id,
      entityNo: seller.code,
      description: `Updated seller info for ${seller.code}`,
      before,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, currentUserId?: string) {
    const seller = await this.findOne(id);

    // Soft delete seller and set status to INACTIVE
    await this.prisma.$transaction([
      this.prisma.seller.update({
        where: { id },
        data: { deletedAt: new Date(), status: 'INACTIVE' },
      }),
      // also deactivate seller users
      this.prisma.user.updateMany({
        where: { sellerId: id },
        data: { deletedAt: new Date(), status: 'INACTIVE' },
      }),
    ]);

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.DELETE,
      entity: 'sellers',
      entityId: id,
      entityNo: seller.code,
      description: `Soft-deleted seller ${seller.name} (${seller.code}) and associated users`,
      before: seller,
    });

    return { message: 'Seller and its users deleted successfully' };
  }
}
