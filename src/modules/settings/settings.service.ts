import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { AuditLogService } from '../../common/services/audit-log.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async findAll() {
    return this.prisma.warehouseConfig.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async findByKey(key: string) {
    const config = await this.prisma.warehouseConfig.findUnique({
      where: { key },
    });
    if (!config) {
      throw new NotFoundException(`Config key ${key} not found`);
    }
    return config;
  }

  async updateMany(dto: UpdateSettingsDto, currentUserId: string) {
    const before = await this.findAll();

    const updated = await this.prisma.$transaction(async (tx) => {
      const results = [];
      for (const item of dto.settings) {
        const check = await tx.warehouseConfig.findUnique({ where: { key: item.key } });
        if (!check) {
          throw new NotFoundException(`Config key ${item.key} does not exist`);
        }

        const res = await tx.warehouseConfig.update({
          where: { key: item.key },
          data: { value: item.value },
        });
        results.push(res);
      }
      return results;
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.UPDATE,
      entity: 'warehouse_configs',
      description: 'System warehouse prefix configurations modified',
      before,
      after: updated,
    });

    return updated;
  }
}
