import { OutboundType } from '@prisma/client';
export declare class OutboundItemDto {
    productId: string;
    quantity: number;
    notes?: string;
}
export declare class CreateOutboundDto {
    sellerId: string;
    type?: OutboundType;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    recipientCity?: string;
    recipientProvince?: string;
    recipientPostcode?: string;
    courierId?: string;
    shippingCost?: number;
    codAmount?: number;
    notes?: string;
    items: OutboundItemDto[];
}
