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
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    log(dto: CreateAuditLogDto): Promise<void>;
}
