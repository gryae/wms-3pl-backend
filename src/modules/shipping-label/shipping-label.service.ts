import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as PDFDocument from 'pdfkit';

// ─── Label Dimensions ─────────────────────────────────────────────────────────
// Left panel (shipping label): 100mm × 78mm  = 283pt × 221pt
// Right panel (picklist):       70mm × 78mm  = 198pt × 221pt
// Total document:               170mm × 78mm = 481pt × 221pt
const LW  = 482;   // total width  (170mm)
const LH  = 221;   // label height (78mm)
const M   = 4;     // outer margin
const DX  = 283;   // x divider — right edge of 100mm shipping label

@Injectable()
export class ShippingLabelService {
  constructor(private prisma: PrismaService) {}

  // ── Data Fetcher ─────────────────────────────────────────────────────────────
  private async fetchOutbound(id: string) {
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
    if (!ob) throw new NotFoundException('Outbound order not found');
    return ob;
  }

  // ── Simulated Barcode ─────────────────────────────────────────────────────────
  private drawBarcode(
    doc: PDFKit.PDFDocument,
    x: number, y: number,
    w: number, h: number,
    seed: string,
  ) {
    doc.rect(x, y, w, h).fillColor('#ffffff').fill().strokeColor('#000000').lineWidth(0.5).stroke();
    const pat = [2, 4, 1, 3, 2, 5, 2, 1, 4, 2, 3, 1, 2, 4, 5, 1, 3, 2, 4, 1, 3, 2];
    const sv  = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    let cx = x + 3;
    let i  = 0;
    doc.fillColor('#000000');
    while (cx < x + w - 3) {
      const bw = (pat[(i + sv) % pat.length] * 0.8) + 0.3;
      const gw = (pat[(i + 1 + sv) % pat.length] * 0.35) + 0.5;
      if (cx + bw > x + w - 3) break;
      doc.rect(cx, y + 1.5, bw, h - 3).fill();
      cx += bw + gw;
      i++;
    }
  }

  // ── Date formatter ────────────────────────────────────────────────────────────
  private formatDate(d: Date | string | null): string {
    if (!d) return '';
    const dt = new Date(d);
    const p = (n: number) => n.toString().padStart(2, '0');
    return `${p(dt.getDate())}/${p(dt.getMonth() + 1)}/${dt.getFullYear().toString().slice(-2)} ${p(dt.getHours())}:${p(dt.getMinutes())}`;
  }

  // ── Draw a single label page ──────────────────────────────────────────────────
  private drawLabel(doc: PDFKit.PDFDocument, ob: any) {
    const courierName = (ob.courier?.name || 'SELF PICKUP').toUpperCase();
    const bookingNo   = ob.trackingNumber || ob.sellerAwbNo || ob.outboundNo;
    const items: any[] = ob.items || [];
    const totalQty = items.reduce((s: number, i: any) => s + (i.quantity || 0), 0);

    // ─── Outer border ───────────────────────────────────────────────────────────
    doc.rect(M / 2, M / 2, LW - M, LH - M).strokeColor('#000000').lineWidth(0.8).stroke();

    // ═══════════════════════════════════════════════════════════════════════════
    // LEFT PANEL  — Shipping Label  (x: M → DX)
    // ═══════════════════════════════════════════════════════════════════════════
    const lx = M;
    const lw = DX - M - 1;   // ≈ 278pt

    // ── [1] HEADER  (y: 4 → 22, height: 18pt) ──────────────────────────────────
    const hY = M, hH = 18;
    doc.rect(lx, hY, lw, hH).fillColor('#f1f5f9').fill().strokeColor('#cbd5e1').lineWidth(0.4).stroke();

    doc.fillColor('#374151').fontSize(6).font('Helvetica')
      .text('Kode Booking | ', lx + 3, hY + 5, { continued: true, lineBreak: false });
    doc.font('Helvetica-Bold').fillColor('#0f172a')
      .text(courierName, { lineBreak: false });

    // Courier badge
    const bW = 52, bH = 12;
    const bX = lx + lw - bW - 3;
    doc.rect(bX, hY + 3, bW, bH).fillColor('#1e3a5f').fill();
    doc.fillColor('#ffffff').fontSize(5.5).font('Helvetica-Bold')
      .text(courierName.substring(0, 10), bX + 2, hY + 6, { width: bW - 4, align: 'center', lineBreak: false });

    // ── [2] TOP BARCODE  (y: 22 → 44, height: 22pt) ────────────────────────────
    const bcTopY = hY + hH;
    this.drawBarcode(doc, lx, bcTopY, lw, 22, bookingNo);

    // ── [3] BARCODE DIGIT ROW  (y: 44 → 54) ────────────────────────────────────
    const numY    = bcTopY + 22;
    const digitStr = bookingNo.replace(/[^A-Z0-9]/gi, '').padEnd(14, '0').substring(0, 14);
    doc.fillColor('#000000').fontSize(5).font('Helvetica')
      .text(digitStr.split('').join('  '), lx + 2, numY + 2, { width: lw - 4, align: 'center', lineBreak: false });

    // ── Horizontal separator ────────────────────────────────────────────────────
    const sep1Y = numY + 10;
    doc.moveTo(lx, sep1Y).lineTo(lx + lw, sep1Y).strokeColor('#94a3b8').lineWidth(0.4).stroke();

    // ── [4] MIDDLE CONTENT ──────────────────────────────────────────────────────
    const midY  = sep1Y + 3;
    const sep2Y = sep1Y + 108;   // leaves room: 108pt for middle content
    const lSubW = 128;           // left sub-column (Penerima) width
    const rSubX = lx + lSubW + 4;
    const rSubW = lw - lSubW - 5;

    // Vertical sub-divider (from sep1Y to sep2Y)
    doc.moveTo(lx + lSubW + 2, sep1Y).lineTo(lx + lSubW + 2, sep2Y)
      .strokeColor('#94a3b8').lineWidth(0.4).stroke();

    // ── Penerima (left sub-column) ───────────────────────────────────────────
    doc.fillColor('#000000').fontSize(6).font('Helvetica-Bold')
      .text('Penerima :', lx + 2, midY, { lineBreak: false });
    doc.fillColor('#6b7280').fontSize(5).font('Helvetica')
      .text(this.formatDate(ob.createdAt), lx + 2, midY, { width: lSubW - 3, align: 'right', lineBreak: false });

    doc.fillColor('#000000').fontSize(7).font('Helvetica-Bold')
      .text(ob.recipientName || '-', lx + 2, midY + 9, { width: lSubW - 3 });

    const addrParts = [
      ob.recipientAddress ? `Alamat: ${ob.recipientAddress}` : 'Alamat: -',
      ob.recipientCity     ? `Kec. ${ob.recipientCity}`     : null,
      ob.recipientProvince ? `Prov. ${ob.recipientProvince}` : null,
      ob.recipientPostcode                                   || null,
    ].filter(Boolean).join(', ');

    doc.fillColor('#374151').fontSize(5.5).font('Helvetica')
      .text(addrParts, lx + 2, midY + 20, { width: lSubW - 3, height: 62, lineGap: 0.3 });

    doc.fillColor('#000000').fontSize(6.5).font('Helvetica-Bold')
      .text(ob.recipientPhone || '', lx + 2, midY + 84, { width: lSubW - 3, lineBreak: false });

    // ── Jenis Packaging / Catatan / Pengirim (right sub-column) ─────────────
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

    // ── [5] TOTAL QTY BAR  (y: sep2Y → sep2Y+16) ────────────────────────────
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

    // ── [6] BOTTOM BARCODE  (y: sep2Y+16 → sep2Y+34) ────────────────────────
    const bcBotY = sep2Y + tqBarH;
    this.drawBarcode(doc, lx, bcBotY, lw, 18, ob.outboundNo);

    // ── [7] BOTTOM DIGIT ROW ─────────────────────────────────────────────────
    const botNumY = bcBotY + 18;
    doc.fillColor('#000000').fontSize(5).font('Helvetica')
      .text(`[ ${ob.outboundNo.split('').join(' ')} ]`, lx + 2, botNumY + 1, {
        width: lw - 4, align: 'center', lineBreak: false,
      });
    // Verify bottom: botNumY + 1 + 6 = sep2Y + 16 + 18 + 1 + 6 ≈ should be < LH-M=217

    // ═══════════════════════════════════════════════════════════════════════════
    // VERTICAL DIVIDER
    // ═══════════════════════════════════════════════════════════════════════════
    doc.moveTo(DX, M / 2).lineTo(DX, LH - M / 2).strokeColor('#000000').lineWidth(0.8).stroke();

    // ═══════════════════════════════════════════════════════════════════════════
    // RIGHT PANEL — Picklist  (x: DX → LW-M)
    // ═══════════════════════════════════════════════════════════════════════════
    const px = DX + 3;
    const pw = LW - M - px - 1;   // ≈ 191pt

    // ── [8] PICKLIST HEADER ──────────────────────────────────────────────────
    doc.rect(DX, M, LW - M - DX, hH)
      .fillColor('#f1f5f9').fill().strokeColor('#cbd5e1').lineWidth(0.4).stroke();

    const sellerShort = (ob.seller?.name || 'SELLER').substring(0, 18).toUpperCase();
    doc.fillColor('#000000').fontSize(6.5).font('Helvetica-Bold')
      .text(`Picklist : (${sellerShort})`, px, M + 5, { lineBreak: false });
    doc.fontSize(6.5).font('Helvetica-Bold')
      .text('Qty', px, M + 5, { width: pw, align: 'right', lineBreak: false });

    doc.moveTo(DX, M + hH).lineTo(LW - M, M + hH).strokeColor('#000000').lineWidth(0.6).stroke();

    // ── [9] PICKLIST ITEMS ───────────────────────────────────────────────────
    let iy = M + hH + 2;
    const maxIY = LH - M - 10;   // leave room for footer

    for (const item of items) {
      if (iy + 20 > maxIY) break;

      const sku  = item.product?.sku || '-';
      const name = (item.product?.name || 'Unknown').substring(0, 26);
      const qty  = item.quantity || 0;

      // SKU line (tiny, gray)
      doc.fillColor('#6b7280').fontSize(5).font('Helvetica')
        .text(sku, px, iy, { width: pw, lineBreak: false });
      iy += 6;

      // Product name (bold) + qty (right)
      doc.fillColor('#000000').fontSize(6).font('Helvetica-Bold')
        .text(name, px, iy, { width: pw - 14, lineBreak: false });
      doc.fontSize(7).font('Helvetica-Bold')
        .text(String(qty), px, iy, { width: pw, align: 'right', lineBreak: false });
      iy += 8;

      // BIN : - with dashed line
      doc.fontSize(5.5).font('Helvetica').fillColor('#374151');
      const binLabel = 'BIN : -';
      doc.text(binLabel, px, iy, { lineBreak: false });

      doc.fontSize(5.5).font('Helvetica');
      const binW   = doc.widthOfString(binLabel);
      const dashSX = px + binW + 2;
      const dashEX = px + pw;
      doc.dash(1.5, { space: 1.5 });
      doc.moveTo(dashSX, iy + 3.5).lineTo(dashEX, iy + 3.5)
        .strokeColor('#aaaaaa').lineWidth(0.4).stroke();
      doc.undash();
      iy += 6;

      // Thin separator
      doc.moveTo(DX + 2, iy).lineTo(LW - M - 2, iy).strokeColor('#e5e7eb').lineWidth(0.3).stroke();
      iy += 2;
    }

    // ── [10] PICKLIST FOOTER ─────────────────────────────────────────────────
    const pfY = LH - M - 10;
    doc.moveTo(DX, pfY).lineTo(LW - M, pfY).strokeColor('#e5e7eb').lineWidth(0.3).stroke();
    doc.fillColor('#9ca3af').fontSize(5).font('Helvetica')
      .text('Powered by WMS 3PL System', px, pfY + 2, { width: pw, align: 'center', lineBreak: false });
  }

  // ── Public: single label ──────────────────────────────────────────────────────
  async generateLabelPdf(outboundId: string): Promise<Buffer> {
    const ob = await this.fetchOutbound(outboundId);
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: [LW, LH],
        margins: { top: M, bottom: M, left: M, right: M },
      });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      this.drawLabel(doc, ob);
      doc.end();
    });
  }

  // ── Public: bulk multi-page labels ───────────────────────────────────────────
  async generateBulkLabelPdf(outboundIds: string[]): Promise<Buffer> {
    if (!outboundIds?.length) {
      throw new BadRequestException('No outbound IDs provided');
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
      throw new NotFoundException('No outbound orders found for given IDs');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: [LW, LH],
        margins: { top: M, bottom: M, left: M, right: M },
        autoFirstPage: false,
      });
      const chunks: Buffer[] = [];
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
}
