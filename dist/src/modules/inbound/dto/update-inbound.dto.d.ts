import { InboundType } from '@prisma/client';
import { InboundItemDto } from './create-inbound.dto';
export declare class UpdateInboundDto {
    type?: InboundType;
    referenceNo?: string;
    notes?: string;
    items?: InboundItemDto[];
}
