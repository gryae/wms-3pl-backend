import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { UpdateCourierDto } from './dto/update-courier.dto';
import { PaginationDto, paginate, getPaginationParams } from '../../common/dto/pagination.dto';
import { AuditLogService } from '../../common/services/audit-log.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class CouriersService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async create(createCourierDto: CreateCourierDto, currentUserId?: string) {
    const { code, name, logo, isActive } = createCourierDto;

    const existing = await this.prisma.courier.findUnique({
      where: { code },
    });
    if (existing) {
      throw new BadRequestException(`Courier code ${code} is already registered`);
    }

    const courier = await this.prisma.courier.create({
      data: { code, name, logo, isActive },
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.CREATE,
      entity: 'couriers',
      entityId: courier.id,
      entityNo: courier.code,
      description: `Created courier ${courier.name} (${courier.code})`,
      after: courier,
    });

    return courier;
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

    return paginate(couriers, total, page, limit);
  }

  async findOne(id: string) {
    const courier = await this.prisma.courier.findFirst({
      where: { id, deletedAt: null },
    });
    if (!courier) {
      throw new NotFoundException('Courier not found');
    }
    return courier;
  }

  async update(id: string, updateCourierDto: UpdateCourierDto, currentUserId?: string) {
    const courier = await this.findOne(id);
    const before = { ...courier };

    const updated = await this.prisma.courier.update({
      where: { id },
      data: updateCourierDto,
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.UPDATE,
      entity: 'couriers',
      entityId: id,
      entityNo: courier.code,
      description: `Updated courier properties for ${courier.code}`,
      before,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, currentUserId?: string) {
    const courier = await this.findOne(id);

    await this.prisma.courier.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.DELETE,
      entity: 'couriers',
      entityId: id,
      entityNo: courier.code,
      description: `Soft-deleted courier ${courier.name} (${courier.code})`,
      before: courier,
    });

    return { message: 'Courier deleted successfully' };
  }
}
