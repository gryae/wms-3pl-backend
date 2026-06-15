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
const common_2 = require("@nestjs/common");
const LABEL_WIDTH_PT = 283.46;
const LABEL_HEIGHT_PT = 221.1;
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
                size: [LABEL_WIDTH_PT, LABEL_HEIGHT_PT],
                margins: { top: 8, bottom: 8, left: 8, right: 8 },
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));
            const W = LABEL_WIDTH_PT;
            const H = LABEL_HEIGHT_PT;
            const margin = 8;
            doc.rect(margin / 2, margin / 2, W - margin, H - margin).stroke();
            doc.rect(margin / 2, margin / 2, W - margin, 22).fill('#1e293b');
            doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
                .text('SHIPPING LABEL', margin, 9, { align: 'center', width: W - margin * 2 });
            doc.fillColor('#000000');
            doc.moveTo(margin / 2, 26).lineTo(W - margin / 2, 26).stroke();
            const courierName = outbound.courier?.name || 'SELF PICKUP';
            doc.fontSize(11).font('Helvetica-Bold')
                .text(courierName.toUpperCase(), margin, 30, { width: (W / 2) - margin - 4 });
            doc.fontSize(6).font('Helvetica-Bold').fillColor('#475569')
                .text('NO. ORDER:', W / 2 + 2, 30);
            doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#000000')
                .text(outbound.outboundNo, W / 2 + 2, 39, { width: W / 2 - margin - 2 });
            doc.moveTo(margin / 2, 56).lineTo(W - margin / 2, 56).stroke();
            doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#94a3b8')
                .text('PENGIRIM:', margin, 60);
            doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#000000')
                .text(outbound.seller.name, margin, 68, { width: W / 2 - margin - 4 });
            if (outbound.seller.phone) {
                doc.fontSize(6).font('Helvetica').text(outbound.seller.phone, margin, 77, { width: W / 2 - margin - 4 });
            }
            doc.moveTo(W / 2, 56).lineTo(W / 2, 138).stroke();
            doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#94a3b8')
                .text('PENERIMA:', W / 2 + 4, 60);
            doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#000000')
                .text(outbound.recipientName, W / 2 + 4, 68, { width: W / 2 - margin - 4 });
            doc.fontSize(6.5).font('Helvetica-Bold')
                .text(outbound.recipientPhone, W / 2 + 4, 79);
            doc.fontSize(5.5).font('Helvetica')
                .text([outbound.recipientAddress, outbound.recipientCity, outbound.recipientProvince, outbound.recipientPostcode]
                .filter(Boolean).join(', '), W / 2 + 4, 89, { width: W / 2 - margin - 4, height: 40 });
            doc.moveTo(margin / 2, 138).lineTo(W - margin / 2, 138).stroke();
            const trackingNo = outbound.trackingNumber || outbound.sellerAwbNo || outbound.outboundNo;
            doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#94a3b8')
                .text('NO. RESI / AWB:', margin, 142);
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000')
                .text(trackingNo, margin, 151, { width: W - margin * 2, align: 'center' });
            const barcodeY = 165;
            const barcodeX = margin + 4;
            const barcodeW = W - margin * 2 - 8;
            const barcodeH = 24;
            doc.rect(barcodeX, barcodeY, barcodeW, barcodeH).fill('#ffffff').stroke('#000000');
            let currentX = barcodeX + 3;
            const pattern = [2, 4, 1, 3, 2, 5, 2, 1, 4, 2, 3, 1, 2, 4, 5, 1, 3, 2, 4, 1, 3, 2, 4, 1, 2, 4, 1, 3, 2, 5, 2, 1, 4, 2, 3, 1, 2, 4, 5];
            let patternIdx = 0;
            doc.fillColor('#000000');
            while (currentX < (barcodeX + barcodeW - 3)) {
                const barWidth = pattern[patternIdx % pattern.length];
                const gapWidth = pattern[(patternIdx + 1) % pattern.length];
                if (currentX + barWidth > barcodeX + barcodeW - 3)
                    break;
                doc.rect(currentX, barcodeY + 2, barWidth, barcodeH - 4).fill();
                currentX += barWidth + gapWidth;
                patternIdx++;
            }
            doc.moveTo(margin / 2, 194).lineTo(W - margin / 2, 194).stroke();
            doc.fontSize(5).font('Helvetica').fillColor('#94a3b8')
                .text('Generated by WMS 3PL System', margin, 198, { align: 'center', width: W - margin * 2 });
            doc.end();
        });
    }
    async generateBulkLabelPdf(outboundIds) {
        if (!outboundIds || outboundIds.length === 0) {
            throw new common_2.BadRequestException('No outbound IDs provided');
        }
        const outbounds = await this.prisma.outbound.findMany({
            where: { id: { in: outboundIds } },
            include: { seller: true, courier: true },
        });
        if (outbounds.length === 0) {
            throw new common_1.NotFoundException('No outbound orders found for given IDs');
        }
        const W = LABEL_WIDTH_PT;
        const H = LABEL_HEIGHT_PT;
        const margin = 8;
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: [W, H],
                margins: { top: 8, bottom: 8, left: 8, right: 8 },
                autoFirstPage: false,
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));
            const drawLabel = (outbound) => {
                doc.addPage({ size: [W, H], margins: { top: 8, bottom: 8, left: 8, right: 8 } });
                doc.rect(margin / 2, margin / 2, W - margin, H - margin).stroke();
                doc.rect(margin / 2, margin / 2, W - margin, 22).fill('#1e293b');
                doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
                    .text('SHIPPING LABEL', margin, 9, { align: 'center', width: W - margin * 2 });
                doc.fillColor('#000000');
                doc.moveTo(margin / 2, 26).lineTo(W - margin / 2, 26).stroke();
                const courierName = outbound.courier?.name || 'SELF PICKUP';
                doc.fontSize(11).font('Helvetica-Bold')
                    .text(courierName.toUpperCase(), margin, 30, { width: (W / 2) - margin - 4 });
                doc.fontSize(6).font('Helvetica-Bold').fillColor('#475569')
                    .text('NO. ORDER:', W / 2 + 2, 30);
                doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#000000')
                    .text(outbound.outboundNo, W / 2 + 2, 39, { width: W / 2 - margin - 2 });
                doc.moveTo(margin / 2, 56).lineTo(W - margin / 2, 56).stroke();
                doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#94a3b8').text('PENGIRIM:', margin, 60);
                doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#000000')
                    .text(outbound.seller.name, margin, 68, { width: W / 2 - margin - 4 });
                if (outbound.seller.phone) {
                    doc.fontSize(6).font('Helvetica').text(outbound.seller.phone, margin, 77, { width: W / 2 - margin - 4 });
                }
                doc.moveTo(W / 2, 56).lineTo(W / 2, 138).stroke();
                doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#94a3b8').text('PENERIMA:', W / 2 + 4, 60);
                doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#000000')
                    .text(outbound.recipientName, W / 2 + 4, 68, { width: W / 2 - margin - 4 });
                doc.fontSize(6.5).font('Helvetica-Bold')
                    .text(outbound.recipientPhone, W / 2 + 4, 79);
                doc.fontSize(5.5).font('Helvetica')
                    .text([outbound.recipientAddress, outbound.recipientCity, outbound.recipientProvince, outbound.recipientPostcode]
                    .filter(Boolean).join(', '), W / 2 + 4, 89, { width: W / 2 - margin - 4, height: 40 });
                doc.moveTo(margin / 2, 138).lineTo(W - margin / 2, 138).stroke();
                const trackingNo = outbound.trackingNumber || outbound.sellerAwbNo || outbound.outboundNo;
                doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#94a3b8').text('NO. RESI / AWB:', margin, 142);
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000')
                    .text(trackingNo, margin, 151, { width: W - margin * 2, align: 'center' });
                const barcodeY = 165;
                const barcodeX = margin + 4;
                const barcodeW = W - margin * 2 - 8;
                const barcodeH = 24;
                doc.rect(barcodeX, barcodeY, barcodeW, barcodeH).fill('#ffffff').stroke('#000000');
                let currentX = barcodeX + 3;
                const pattern = [2, 4, 1, 3, 2, 5, 2, 1, 4, 2, 3, 1, 2, 4, 5, 1, 3, 2, 4, 1, 3, 2, 4, 1, 2, 4, 1, 3, 2, 5, 2, 1, 4, 2, 3, 1, 2, 4, 5];
                let patternIdx = 0;
                doc.fillColor('#000000');
                while (currentX < (barcodeX + barcodeW - 3)) {
                    const barWidth = pattern[patternIdx % pattern.length];
                    const gapWidth = pattern[(patternIdx + 1) % pattern.length];
                    if (currentX + barWidth > barcodeX + barcodeW - 3)
                        break;
                    doc.rect(currentX, barcodeY + 2, barWidth, barcodeH - 4).fill();
                    currentX += barWidth + gapWidth;
                    patternIdx++;
                }
                doc.moveTo(margin / 2, 194).lineTo(W - margin / 2, 194).stroke();
                doc.fontSize(5).font('Helvetica').fillColor('#94a3b8')
                    .text('Generated by WMS 3PL System', margin, 198, { align: 'center', width: W - margin * 2 });
            };
            const ordered = outboundIds
                .map((id) => outbounds.find((o) => o.id === id))
                .filter(Boolean);
            for (const outbound of ordered) {
                drawLabel(outbound);
            }
            doc.end();
        });
    }
};
exports.ShippingLabelService = ShippingLabelService;
exports.ShippingLabelService = ShippingLabelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShippingLabelService);
//# sourceMappingURL=shipping-label.service.js.map