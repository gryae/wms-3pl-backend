"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingLabelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const PDFDocument = require("pdfkit");
let ShippingLabelService = class ShippingLabelService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateLabelPdf(outboundId) {
        const outbound = await this.prisma.outbound.findUnique({
            where: { id: outboundId },
            include: {
                seller: true,
                courier: true,
            },
        });
        if (!outbound) {
            throw new common_1.NotFoundException('Outbound order not found');
        }
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: [288, 432],
                margins: { top: 15, bottom: 15, left: 15, right: 15 },
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));
            doc.rect(10, 10, 268, 412).stroke();
            doc.fontSize(12).font('Helvetica-Bold').text('3PL ENTERPRISE WMS', 15, 18, { align: 'center' });
            doc.fontSize(7).font('Helvetica').text('SHIPPING LABEL', 15, 32, { align: 'center' });
            doc.moveTo(10, 42).lineTo(278, 42).stroke();
            doc.fontSize(7).font('Helvetica-Bold').text('FROM (SENDER):', 15, 48);
            doc.fontSize(8).font('Helvetica-Bold').text(outbound.seller.name, 15, 58, { width: 120 });
            doc.fontSize(7).font('Helvetica').text(outbound.seller.phone || '-', 15, 68);
            doc.text(outbound.seller.address || '', 15, 78, { width: 120, height: 40 });
            doc.moveTo(144, 42).lineTo(144, 120).stroke();
            doc.fontSize(7).font('Helvetica-Bold').text('TO (RECIPIENT):', 149, 48);
            doc.fontSize(9).font('Helvetica-Bold').text(outbound.recipientName, 149, 58, { width: 120 });
            doc.fontSize(8).font('Helvetica-Bold').text(outbound.recipientPhone, 149, 70);
            doc.fontSize(7).font('Helvetica').text(outbound.recipientAddress, 149, 82, { width: 120, height: 35 });
            doc.moveTo(10, 120).lineTo(278, 120).stroke();
            doc.fontSize(8).font('Helvetica-Bold').text('COURIER SERVICE:', 15, 126);
            doc.fontSize(14).font('Helvetica-Bold').text(outbound.courier?.name || 'SELF PICKUP', 15, 136);
            doc.fontSize(8).font('Helvetica-Bold').text('OUTBOUND NO:', 149, 126);
            doc.fontSize(10).font('Helvetica-Bold').text(outbound.outboundNo, 149, 136);
            doc.moveTo(10, 156).lineTo(278, 156).stroke();
            const barcodeText = outbound.trackingNumber || outbound.outboundNo;
            doc.fontSize(8).font('Helvetica-Bold').text(`TRACKING NUMBER: ${barcodeText}`, 15, 164, { align: 'center' });
            const barcodeStartY = 178;
            const barcodeStartX = 25;
            const barcodeWidth = 238;
            const barcodeHeight = 55;
            doc.rect(barcodeStartX, barcodeStartY, barcodeWidth, barcodeHeight).fill('#ffffff').stroke('#000000');
            let currentX = barcodeStartX + 5;
            const pattern = [2, 4, 1, 3, 2, 5, 2, 1, 4, 2, 3, 1, 2, 4, 5, 1, 3, 2, 4, 1, 3, 2, 4, 1, 2, 4, 1, 3, 2, 5, 2, 1, 4, 2, 3, 1, 2, 4, 5];
            let patternIdx = 0;
            doc.fill('#000000');
            while (currentX < (barcodeStartX + barcodeWidth - 10)) {
                const barWidth = pattern[patternIdx % pattern.length];
                const gapWidth = pattern[(patternIdx + 1) % pattern.length];
                doc.rect(currentX, barcodeStartY + 5, barWidth, barcodeHeight - 10).fill();
                currentX += barWidth + gapWidth;
                patternIdx++;
            }
            doc.moveTo(10, 246).lineTo(278, 246).stroke();
            doc.fontSize(8).font('Helvetica-Bold').text('ORDER ITEM SUMMARY:', 15, 254);
            this.prisma.outboundItem.findMany({
                where: { outboundId },
                include: { product: true },
            }).then((items) => {
                let itemY = 268;
                doc.fontSize(7).font('Helvetica-Bold');
                doc.text('SKU', 15, itemY);
                doc.text('Product Name', 90, itemY);
                doc.text('Qty', 245, itemY, { align: 'right', width: 20 });
                doc.moveTo(15, itemY + 8).lineTo(265, itemY + 8).stroke();
                itemY += 12;
                doc.font('Helvetica');
                items.slice(0, 5).forEach((item) => {
                    doc.text(item.product.sku, 15, itemY, { width: 70 });
                    doc.text(item.product.name.slice(0, 25), 90, itemY, { width: 140 });
                    doc.text(item.quantity.toString(), 245, itemY, { align: 'right', width: 20 });
                    itemY += 12;
                });
                if (items.length > 5) {
                    doc.fontSize(6).font('Helvetica-Oblique').text(`... and ${items.length - 5} more items`, 15, itemY);
                }
                doc.moveTo(10, 395).lineTo(278, 395).stroke();
                doc.fontSize(7).font('Helvetica-Bold').text('WMS GENERATED PACKAGE LABEL - SECURE DELIVERY', 15, 404, { align: 'center' });
                doc.end();
            }).catch((err) => {
                doc.end();
                reject(err);
            });
        });
    }
};
exports.ShippingLabelService = ShippingLabelService;
exports.ShippingLabelService = ShippingLabelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShippingLabelService);
//# sourceMappingURL=shipping-label.service.js.map