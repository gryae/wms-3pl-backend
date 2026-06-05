import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

export interface CreateAuditLogDto {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  entityNo?: string;
  before?: any;
  after?: any;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(dto: CreateAuditLogDto): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: dto.userId,
        action: dto.action,
        entity: dto.entity,
        entityId: dto.entityId,
        entityNo: dto.entityNo,
        before: dto.before,
        after: dto.after,
        description: dto.description,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      },
    });
  }
}
