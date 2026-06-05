import { OutboundType } from '@prisma/client';
import { OutboundItemDto } from './create-outbound.dto';
export declare class UpdateOutboundDto {
    type?: OutboundType;
    recipientName?: string;
    recipientPhone?: string;
    recipientAddress?: string;
    recipientCity?: string;
    recipientProvince?: string;
    recipientPostcode?: string;
    courierId?: string;
    shippingCost?: number;
    codAmount?: number;
    notes?: string;
    items?: OutboundItemDto[];
}
