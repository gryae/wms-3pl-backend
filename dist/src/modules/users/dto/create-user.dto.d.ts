import { UserRole, UserStatus } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: UserRole;
    sellerId?: string;
    status?: UserStatus;
}
