import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, currentUserId: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        sellerId: string | null;
        avatarUrl: string | null;
        lastLoginAt: Date | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(paginationDto: PaginationDto, sellerId?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        seller: {
            id: string;
            name: string;
            code: string;
        };
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        sellerId: string | null;
        avatarUrl: string | null;
        lastLoginAt: Date | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>>;
    getProfile(userId: string): Promise<{
        seller: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            status: import(".prisma/client").$Enums.SellerStatus;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            code: string;
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
        email: string;
        password: string;
        name: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        sellerId: string | null;
        avatarUrl: string | null;
        lastLoginAt: Date | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
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
    findOne(id: string): Promise<{
        seller: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            status: import(".prisma/client").$Enums.SellerStatus;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            code: string;
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
        email: string;
        password: string;
        name: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        sellerId: string | null;
        avatarUrl: string | null;
        lastLoginAt: Date | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, currentUserId: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        sellerId: string | null;
        avatarUrl: string | null;
        lastLoginAt: Date | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, currentUserId: string): Promise<{
        message: string;
    }>;
}
