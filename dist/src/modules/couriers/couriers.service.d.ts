import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { UpdateCourierDto } from './dto/update-courier.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AuditLogService } from '../../common/services/audit-log.service';
export declare class CouriersService {
    private prisma;
    private auditLogService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService);
    create(createCourierDto: CreateCourierDto, currentUserId?: string): Promise<{
        id: string;
        name: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        logo: string | null;
        isActive: boolean;
    }>;
    findAll(paginationDto: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        id: string;
        name: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        logo: string | null;
        isActive: boolean;
    }>>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        logo: string | null;
        isActive: boolean;
    }>;
    update(id: string, updateCourierDto: UpdateCourierDto, currentUserId?: string): Promise<{
        id: string;
        name: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        logo: string | null;
        isActive: boolean;
    }>;
    remove(id: string, currentUserId?: string): Promise<{
        message: string;
    }>;
}
