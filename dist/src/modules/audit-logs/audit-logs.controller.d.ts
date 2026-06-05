import { AuditLogsService } from './audit-logs.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class AuditLogsController {
    private readonly auditLogsService;
    constructor(auditLogsService: AuditLogsService);
    findAll(paginationDto: PaginationDto, sellerId?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        user: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
        };
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        userId: string | null;
        action: import(".prisma/client").$Enums.AuditAction;
        entity: string;
        entityId: string | null;
        entityNo: string | null;
        before: import("@prisma/client/runtime/library").JsonValue | null;
        after: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>>;
    findOne(id: string, sellerId?: string): Promise<{
        user: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
        };
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        userId: string | null;
        action: import(".prisma/client").$Enums.AuditAction;
        entity: string;
        entityId: string | null;
        entityNo: string | null;
        before: import("@prisma/client/runtime/library").JsonValue | null;
        after: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
}
