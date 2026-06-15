import { PrismaService } from '../../prisma/prisma.service';
export declare class ShippingLabelService {
    private prisma;
    constructor(prisma: PrismaService);
    private fetchOutbound;
    private drawBarcode;
    private formatDate;
    private drawLabel;
    generateLabelPdf(outboundId: string): Promise<Buffer>;
    generateBulkLabelPdf(outboundIds: string[]): Promise<Buffer>;
}
