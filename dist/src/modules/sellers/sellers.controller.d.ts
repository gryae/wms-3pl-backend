import { SellersService } from './sellers.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';
export declare class SellersController {
    private readonly sellersService;
    constructor(sellersService: SellersService);
    create(createSellerDto: CreateSellerDto, currentUserId: string): Promise<{
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
    }>;
    findAll(paginationDto: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
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
    }>>;
    findOne(id: string, currentUserSellerId?: string, role?: UserRole): Promise<{
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
    }>;
    update(id: string, updateSellerDto: UpdateSellerDto, currentUserId: string, currentUserSellerId?: string): Promise<{
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
    }>;
    remove(id: string, currentUserId: string): Promise<{
        message: string;
    }>;
}
