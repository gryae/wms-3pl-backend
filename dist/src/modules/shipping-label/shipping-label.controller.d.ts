import { ShippingLabelService } from './shipping-label.service';
import { Response } from 'express';
export declare class ShippingLabelController {
    private readonly labelService;
    constructor(labelService: ShippingLabelService);
    getLabel(outboundId: string, res: Response, sellerId?: string): Promise<void>;
    getBulkLabels(body: {
        outboundIds: string[];
    }, res: Response, sellerId?: string): Promise<void>;
}
