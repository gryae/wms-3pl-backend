import { PrismaService } from '../../prisma/prisma.service';
export declare class ShippingLabelService {
    private prisma;
    constructor(prisma: PrismaService);
    generateLabelPdf(outboundId: string): Promise<Buffer>;
}
