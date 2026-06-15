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
const LW = 482;
const LH = 221;
const M = 4;
const DX = 283;
let ShippingLabelService = class ShippingLabelService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async fetchOutbound(id) {
        const ob = await this.prisma.outbound.findUnique({
            where: { id },
            include: {
                seller: true,
                courier: true,
                items: {
                    include: {
                        product: { select: { sku: true, name: true } },
                    },
                },
            },
        });
        if (!ob)
            throw new common_1.NotFoundException('Outbound order not found');
        return ob;
    }
    drawBarcode(doc, x, y, w, h, seed) {
        doc.rect(x, y, w, h).fillColor('#ffffff').fill().strokeColor('#000000').lineWidth(0.5).stroke();
        const pat = [2, 4, 1, 3, 2, 5, 2, 1, 4, 2, 3, 1, 2, 4, 5, 1, 3, 2, 4, 1, 3, 2];
        const sv = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        let cx = x + 3;
        let i = 0;
        doc.fillColor('#000000');
        while (cx < x + w - 3) {
            const bw = (pat[(i + sv) % pat.length] * 0.8) + 0.3;
            const gw = (pat[(i + 1 + sv) % pat.length] * 0.35) + 0.5;
            if (cx + bw > x + w - 3)
                break;
            doc.rect(cx, y + 1.5, bw, h - 3).fill();
            cx += bw + gw;
            i++;
        }
    }
    formatDate(d) {
        if (!d)
            return '';
        const dt = new Date(d);
        const p = (n) => n.toString().padStart(2, '0');
        return `${p(dt.getDate())}/${p(dt.getMonth() + 1)}/${dt.getFullYear().toString().slice(-2)} ${p(dt.getHours())}:${p(dt.getMinutes())}`;
    }
    drawLabel(doc, ob) {
        const courierName = (ob.courier?.name || 'SELF PICKUP').toUpperCase();
        const bookingNo = ob.trackingNumber || ob.sellerAwbNo || ob.outboundNo;
        const items = ob.items || [];
        const totalQty = items.reduce((s, i) => s + (i.quantity || 0), 0);
        doc.rect(M / 2, M / 2, LW - M, LH - M).strokeColor('#000000').lineWidth(0.8).stroke();
        const lx = M;
        const lw = DX - M - 1;
        const hY = M, hH = 18;
        doc.rect(lx, hY, lw, hH).fillColor('#f1f5f9').fill().strokeColor('#cbd5e1').lineWidth(0.4).stroke();
        doc.fillColor('#374151').fontSize(6).font('Helvetica')
            .text('Kode Booking | ', lx + 3, hY + 5, { continued: true, lineBreak: false });
        doc.font('Helvetica-Bold').fillColor('#0f172a')
            .text(courierName, { lineBreak: false });
        const bW = 52, bH = 12;
        const bX = lx + lw - bW - 3;
        doc.rect(bX, hY + 3, bW, bH).fillColor('#1e3a5f').fill();
        doc.fillColor('#ffffff').fontSize(5.5).font('Helvetica-Bold')
            .text(courierName.substring(0, 10), bX + 2, hY + 6, { width: bW - 4, align: 'center', lineBreak: false });
        const bcTopY = hY + hH;
        this.drawBarcode(doc, lx, bcTopY, lw, 22, bookingNo);
        const numY = bcTopY + 22;
        const digitStr = bookingNo.replace(/[^A-Z0-9]/gi, '').padEnd(14, '0').substring(0, 14);
        doc.fillColor('#000000').fontSize(5).font('Helvetica')
            .text(digitStr.split('').join('  '), lx + 2, numY + 2, { width: lw - 4, align: 'center', lineBreak: false });
        const sep1Y = numY + 10;
        doc.moveTo(lx, sep1Y).lineTo(lx + lw, sep1Y).strokeColor('#94a3b8').lineWidth(0.4).stroke();
        const midY = sep1Y + 3;
        const sep2Y = sep1Y + 108;
        const lSubW = 128;
        const rSubX = lx + lSubW + 4;
        const rSubW = lw - lSubW - 5;
        doc.moveTo(lx + lSubW + 2, sep1Y).lineTo(lx + lSubW + 2, sep2Y)
            .strokeColor('#94a3b8').lineWidth(0.4).stroke();
        doc.fillColor('#000000').fontSize(6).font('Helvetica-Bold')
            .text('Penerima :', lx + 2, midY, { lineBreak: false });
        doc.fillColor('#6b7280').fontSize(5).font('Helvetica')
            .text(this.formatDate(ob.createdAt), lx + 2, midY, { width: lSubW - 3, align: 'right', lineBreak: false });
        doc.fillColor('#000000').fontSize(7).font('Helvetica-Bold')
            .text(ob.recipientName || '-', lx + 2, midY + 9, { width: lSubW - 3 });
        const addrParts = [
            ob.recipientAddress ? `Alamat: ${ob.recipientAddress}` : 'Alamat: -',
            ob.recipientCity ? `Kec. ${ob.recipientCity}` : null,
            ob.recipientProvince ? `Prov. ${ob.recipientProvince}` : null,
            ob.recipientPostcode || null,
        ].filter(Boolean).join(', ');
        doc.fillColor('#374151').fontSize(5.5).font('Helvetica')
            .text(addrParts, lx + 2, midY + 20, { width: lSubW - 3, height: 62, lineGap: 0.3 });
        doc.fillColor('#000000').fontSize(6.5).font('Helvetica-Bold')
            .text(ob.recipientPhone || '', lx + 2, midY + 84, { width: lSubW - 3, lineBreak: false });
        let ry = midY;
        doc.fillColor('#000000').fontSize(6).font('Helvetica-Bold')
            .text('Jenis Packaging :', rSubX, ry, { lineBreak: false });
        ry += 9;
        doc.fillColor('#374151').fontSize(5.5).font('Helvetica')
            .text(`"${(ob.notes || '-').substring(0, 80)}"`, rSubX, ry, { width: rSubW, height: 28, lineGap: 0.3 });
        ry += 30;
        doc.fillColor('#000000').fontSize(6).font('Helvetica-Bold')
            .text('Catatan :', rSubX, ry, { lineBreak: false });
        ry += 9;
        doc.fillColor('#374151').fontSize(5.5).font('Helvetica')
            .text('""', rSubX, ry, { width: rSubW, height: 14 });
        ry += 16;
        doc.fillColor('#000000').fontSize(6).font('Helvetica-Bold')
            .text('Pengirim :', rSubX, ry, { lineBreak: false });
        ry += 9;
        doc.fillColor('#000000').fontSize(5.5).font('Helvetica')
            .text(`Nama      : ${(ob.seller?.name || '-').substring(0, 20)}`, rSubX, ry, { width: rSubW, lineBreak: false });
        ry += 7;
        doc.text(`Telepon   : ${ob.seller?.phone || '-'}`, rSubX, ry, { width: rSubW, lineBreak: false });
        const tqBarH = 16;
        doc.moveTo(lx, sep2Y).lineTo(lx + lw, sep2Y).strokeColor('#94a3b8').lineWidth(0.4).stroke();
        const halfLW = Math.floor(lw / 2);
        doc.fillColor('#000000').fontSize(7.5).font('Helvetica-Bold')
            .text(`Total Qty : ${totalQty} Pcs`, lx + 3, sep2Y + 5, { width: halfLW - 6, lineBreak: false });
        doc.rect(lx + halfLW, sep2Y, lw - halfLW, tqBarH)
            .fillColor('#e2e8f0').fill().strokeColor('#94a3b8').lineWidth(0.4).stroke();
        doc.fillColor('#475569').fontSize(6.5).font('Helvetica-Bold')
            .text(ob.courier?.code || 'NON-MP', lx + halfLW + 2, sep2Y + 5, {
            width: lw - halfLW - 4, align: 'center', lineBreak: false,
        });
        doc.moveTo(lx + halfLW, sep2Y).lineTo(lx + halfLW, sep2Y + tqBarH)
            .strokeColor('#94a3b8').lineWidth(0.4).stroke();
        const bcBotY = sep2Y + tqBarH;
        this.drawBarcode(doc, lx, bcBotY, lw, 18, ob.outboundNo);
        const botNumY = bcBotY + 18;
        doc.fillColor('#000000').fontSize(5).font('Helvetica')
            .text(`[ ${ob.outboundNo.split('').join(' ')} ]`, lx + 2, botNumY + 1, {
            width: lw - 4, align: 'center', lineBreak: false,
        });
        doc.moveTo(DX, M / 2).lineTo(DX, LH - M / 2).strokeColor('#000000').lineWidth(0.8).stroke();
        const px = DX + 3;
        const pw = LW - M - px - 1;
        doc.rect(DX, M, LW - M - DX, hH)
            .fillColor('#f1f5f9').fill().strokeColor('#cbd5e1').lineWidth(0.4).stroke();
        const sellerShort = (ob.seller?.name || 'SELLER').substring(0, 18).toUpperCase();
        doc.fillColor('#000000').fontSize(6.5).font('Helvetica-Bold')
            .text(`Picklist : (${sellerShort})`, px, M + 5, { lineBreak: false });
        doc.fontSize(6.5).font('Helvetica-Bold')
            .text('Qty', px, M + 5, { width: pw, align: 'right', lineBreak: false });
        doc.moveTo(DX, M + hH).lineTo(LW - M, M + hH).strokeColor('#000000').lineWidth(0.6).stroke();
        let iy = M + hH + 2;
        const maxIY = LH - M - 10;
        for (const item of items) {
            if (iy + 20 > maxIY)
                break;
            const sku = item.product?.sku || '-';
            const name = (item.product?.name || 'Unknown').substring(0, 26);
            const qty = item.quantity || 0;
            doc.fillColor('#6b7280').fontSize(5).font('Helvetica')
                .text(sku, px, iy, { width: pw, lineBreak: false });
            iy += 6;
            doc.fillColor('#000000').fontSize(6).font('Helvetica-Bold')
                .text(name, px, iy, { width: pw - 14, lineBreak: false });
            doc.fontSize(7).font('Helvetica-Bold')
                .text(String(qty), px, iy, { width: pw, align: 'right', lineBreak: false });
            iy += 8;
            doc.fontSize(5.5).font('Helvetica').fillColor('#374151');
            const binLabel = 'BIN : -';
            doc.text(binLabel, px, iy, { lineBreak: false });
            doc.fontSize(5.5).font('Helvetica');
            const binW = doc.widthOfString(binLabel);
            const dashSX = px + binW + 2;
            const dashEX = px + pw;
            doc.dash(1.5, { space: 1.5 });
            doc.moveTo(dashSX, iy + 3.5).lineTo(dashEX, iy + 3.5)
                .strokeColor('#aaaaaa').lineWidth(0.4).stroke();
            doc.undash();
            iy += 6;
            doc.moveTo(DX + 2, iy).lineTo(LW - M - 2, iy).strokeColor('#e5e7eb').lineWidth(0.3).stroke();
            iy += 2;
        }
        const pfY = LH - M - 10;
        doc.moveTo(DX, pfY).lineTo(LW - M, pfY).strokeColor('#e5e7eb').lineWidth(0.3).stroke();
        doc.fillColor('#9ca3af').fontSize(5).font('Helvetica')
            .text('Powered by WMS 3PL System', px, pfY + 2, { width: pw, align: 'center', lineBreak: false });
    }
    async generateLabelPdf(outboundId) {
        const ob = await this.fetchOutbound(outboundId);
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: [LW, LH],
                margins: { top: M, bottom: M, left: M, right: M },
            });
            const chunks = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            this.drawLabel(doc, ob);
            doc.end();
        });
    }
    async generateBulkLabelPdf(outboundIds) {
        if (!outboundIds?.length) {
            throw new common_1.BadRequestException('No outbound IDs provided');
        }
        const obs = await this.prisma.outbound.findMany({
            where: { id: { in: outboundIds } },
            include: {
                seller: true,
                courier: true,
                items: {
                    include: {
                        product: { select: { sku: true, name: true } },
                    },
                },
            },
        });
        if (!obs.length) {
            throw new common_1.NotFoundException('No outbound orders found for given IDs');
        }
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: [LW, LH],
                margins: { top: M, bottom: M, left: M, right: M },
                autoFirstPage: false,
            });
            const chunks = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const ordered = outboundIds
                .map((id) => obs.find((o) => o.id === id))
                .filter(Boolean);
            for (const ob of ordered) {
                doc.addPage({ size: [LW, LH], margins: { top: M, bottom: M, left: M, right: M } });
                this.drawLabel(doc, ob);
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