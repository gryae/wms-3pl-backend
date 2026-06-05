import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AuditLogService } from '../../common/services/audit-log.service';
export declare class UsersService {
    private prisma;
    private auditLogService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService);
    create(createUserDto: CreateUserDto, currentUserId?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        deletedAt: Date | null;
        email: string;
        password: string;
        phone: string | null;
        status: import(".prisma/client").$Enums.UserStatus;
        sellerId: string | null;
        avatarUrl: string | null;
        lastLoginAt: Date | null;
    }>;
    findAll(paginationDto: PaginationDto, sellerId?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        seller: {
            id: string;
            code: string;
            name: string;
        };
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        deletedAt: Date | null;
        email: string;
        phone: string | null;
        status: import(".prisma/client").$Enums.UserStatus;
        sellerId: string | null;
        avatarUrl: string | null;
        lastLoginAt: Date | null;
    }>>;
    findOne(id: string): Promise<{
        seller: {
            id: string;
            code: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            email: string | null;
            phone: string | null;
            status: import(".prisma/client").$Enums.SellerStatus;
            address: string | null;
            logoUrl: string | null;
        };
        preferences: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            language: import(".prisma/client").$Enums.Language;
            theme: string;
            timezone: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        deletedAt: Date | null;
        email: string;
        password: string;
        phone: string | null;
        status: import(".prisma/client").$Enums.UserStatus;
        sellerId: string | null;
        avatarUrl: string | null;
        lastLoginAt: Date | null;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, currentUserId?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        deletedAt: Date | null;
        email: string;
        password: string;
        phone: string | null;
        status: import(".prisma/client").$Enums.UserStatus;
        sellerId: string | null;
        avatarUrl: string | null;
        lastLoginAt: Date | null;
    }>;
    remove(id: string, currentUserId?: string): Promise<{
        message: string;
    }>;
    getPreferences(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        language: import(".prisma/client").$Enums.Language;
        theme: string;
        timezone: string;
    }>;
    updatePreferences(userId: string, dto: UpdatePreferenceDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        language: import(".prisma/client").$Enums.Language;
        theme: string;
        timezone: string;
    }>;
}
