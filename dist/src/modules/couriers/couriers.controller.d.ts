import { CouriersService } from './couriers.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { UpdateCourierDto } from './dto/update-courier.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class CouriersController {
    private readonly couriersService;
    constructor(couriersService: CouriersService);
    create(createCourierDto: CreateCourierDto, currentUserId: string): Promise<{
        id: string;
        code: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        logo: string | null;
        isActive: boolean;
        deletedAt: Date | null;
    }>;
    findAll(paginationDto: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<{
        id: string;
        code: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        logo: string | null;
        isActive: boolean;
        deletedAt: Date | null;
    }>>;
    findOne(id: string): Promise<{
        id: string;
        code: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        logo: string | null;
        isActive: boolean;
        deletedAt: Date | null;
    }>;
    update(id: string, updateCourierDto: UpdateCourierDto, currentUserId: string): Promise<{
        id: string;
        code: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        logo: string | null;
        isActive: boolean;
        deletedAt: Date | null;
    }>;
    remove(id: string, currentUserId: string): Promise<{
        message: string;
    }>;
}
