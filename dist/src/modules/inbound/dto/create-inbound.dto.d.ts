import { InboundType } from '@prisma/client';
export declare class InboundItemDto {
    productId: string;
    expectedQty: number;
    notes?: string;
}
export declare class CreateInboundDto {
    sellerId: string;
    type?: InboundType;
    referenceNo?: string;
    notes?: string;
    items: InboundItemDto[];
}
