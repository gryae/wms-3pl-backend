import { SellerStatus } from '@prisma/client';
export declare class CreateSellerDto {
    code: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    status?: SellerStatus;
    logoUrl?: string;
}
