import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { AuditLogService } from '../../common/services/audit-log.service';
export declare class SettingsService {
    private prisma;
    private auditLogService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService);
    findAll(): Promise<{
        id: string;
        updatedAt: Date;
        key: string;
        value: string;
        label: string | null;
        group: string | null;
    }[]>;
    findByKey(key: string): Promise<{
        id: string;
        updatedAt: Date;
        key: string;
        value: string;
        label: string | null;
        group: string | null;
    }>;
    updateMany(dto: UpdateSettingsDto, currentUserId: string): Promise<any[]>;
}
