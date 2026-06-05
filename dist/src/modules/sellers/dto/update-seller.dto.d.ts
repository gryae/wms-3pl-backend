import { SellerStatus } from '@prisma/client';
export declare class UpdateSellerDto {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    status?: SellerStatus;
    logoUrl?: string;
}
