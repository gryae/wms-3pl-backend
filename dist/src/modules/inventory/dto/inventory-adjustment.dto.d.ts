import { InventoryStatus } from '@prisma/client';
export declare class InventoryAdjustmentDto {
    productId: string;
    status: InventoryStatus;
    quantity: number;
    reason: string;
    notes?: string;
}
