import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as PDFDocument from 'pdfkit';

// ─── Label Dimensions ─────────────────────────────────────────────────────────
const LW  = 595;   // 210mm (A5 landscape width)
const LH  = 284;   // 100mm
const M   = 5;     // outer margin
const DX  = 390;   // x-coordinate of left/right panel divider (~65% split)

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
    let cx = x + 4;
    let i  = 0;
    doc.fillColor('#000000');
    while (cx < x + w - 4) {
      const bw = (pat[(i + sv) % pat.length] * 0.9) + 0.4;
      const gw = (pat[(i + 1 + sv) % pat.length] * 0.4) + 0.6;
      if (cx + bw > x + w - 4) break;
      doc.rect(cx, y + 2, bw, h - 4).fill();
      cx += bw + gw;
      i++;
    }
  }

  // ── Format date helper ────────────────────────────────────────────────────────
  private formatDate(d: Date | string | null): string {
    if (!d) return '';
    const dt = new Date(d);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear().toString().slice(-2)} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  }

  // ── Draw single label ─────────────────────────────────────────────────────────
  private drawLabel(doc: PDFKit.PDFDocument, ob: any) {
    const courierName = (ob.courier?.name || 'SELF PICKUP').toUpperCase();
    const bookingNo   = ob.trackingNumber || ob.sellerAwbNo || ob.outboundNo;
    const items: any[] = ob.items || [];
    const totalQty = items.reduce((s: number, i: any) => s + (i.quantity || 0), 0);

    // ─────────────────────────────────────────────────────────────────────────────
    // OUTER BORDER
    // ─────────────────────────────────────────────────────────────────────────────
    doc.rect(M / 2, M / 2, LW - M, LH - M).strokeColor('#000000').lineWidth(1).stroke();

    // ─────────────────────────────────────────────────────────────────────────────
    // LEFT PANEL  (x: M → DX)
    // ─────────────────────────────────────────────────────────────────────────────
    const lx = M;
    const lw = DX - M - 1;

    // ── [1] HEADER BAR  (y: M → M+22) ──────────────────────────────────────────
    const hY = M, hH = 22;
    doc.rect(lx, hY, lw, hH).fillColor('#f1f5f9').fill().strokeColor('#cbd5e1').lineWidth(0.5).stroke();

    // "Kode Booking | JNE CASHLESS"
    doc.fillColor('#374151').fontSize(7).font('Helvetica')
      .text('Kode Booking | ', lx + 4, hY + 7, { continued: true, lineBreak: false });
    doc.font('Helvetica-Bold').fillColor('#0f172a')
      .text(courierName, { lineBreak: false });

    // Courier badge (right side)
    const badgeW = 66, badgeH = 14;
    const badgeX = lx + lw - badgeW - 4;
    doc.rect(badgeX, hY + 4, badgeW, badgeH).fillColor('#1e3a5f').fill();
    doc.fillColor('#ffffff').fontSize(6.5).font('Helvetica-Bold')
      .text(courierName.substring(0, 10), badgeX + 2, hY + 8, {
        width: badgeW - 4, align: 'center', lineBreak: false,
      });

    // ── [2] TOP BARCODE  (y: M+22 → M+52) ─────────────────────────────────────
    const bcTopY = hY + hH;
    this.drawBarcode(doc, lx, bcTopY, lw, 30, bookingNo);

    // ── [3] BARCODE DIGIT ROW  (y: M+52 → M+64) ────────────────────────────────
    const numY = bcTopY + 30;
    const digitStr = bookingNo.replace(/[^A-Z0-9]/gi, '').padEnd(14, '0').substring(0, 14);
    doc.fillColor('#000000').fontSize(6).font('Helvetica')
      .text(digitStr.split('').join('  '), lx + 2, numY + 1, {
        width: lw - 4, align: 'center', lineBreak: false,
      });

    // Horizontal separator
    const sep1Y = numY + 12;
    doc.moveTo(lx, sep1Y).lineTo(lx + lw, sep1Y).strokeColor('#94a3b8').lineWidth(0.5).stroke();

    // ── [4] MIDDLE CONTENT ──────────────────────────────────────────────────────
    const midY   = sep1Y + 3;
    const lSubW  = 183;       // left sub-column (Penerima) width
    const rSubX  = lx + lSubW + 5;
    const rSubW  = lw - lSubW - 6;

    // Vertical sub-divider
    const sep2Y = sep1Y + 152;
    doc.moveTo(lx + lSubW + 2, sep1Y).lineTo(lx + lSubW + 2, sep2Y)
      .strokeColor('#94a3b8').lineWidth(0.5).stroke();

    // ── Penerima (left sub) ──────────────────────────────────────────────────
    doc.fillColor('#000000').fontSize(7).font('Helvetica-Bold')
      .text('Penerima :', lx + 2, midY, { lineBreak: false });
    doc.fillColor('#6b7280').fontSize(6).font('Helvetica')
      .text(this.formatDate(ob.createdAt), lx + 2, midY, {
        width: lSubW - 4, align: 'right', lineBreak: false,
      });

    doc.fillColor('#000000').fontSize(8.5).font('Helvetica-Bold')
      .text(ob.recipientName || '-', lx + 2, midY + 11, { width: lSubW - 4 });

    const addrParts = [
      ob.recipientAddress ? `Alamat: ${ob.recipientAddress}` : 'Alamat: -',
      ob.recipientCity    ? `Kec. ${ob.recipientCity}`       : null,
      ob.recipientProvince ? `Prov. ${ob.recipientProvince}` : null,
      ob.recipientPostcode                                    || null,
    ].filter(Boolean).join(', ');

    doc.fillColor('#374151').fontSize(6.5).font('Helvetica')
      .text(addrParts, lx + 2, midY + 24, { width: lSubW - 4, height: 75, lineGap: 0.5 });

    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold')
      .text(ob.recipientPhone || '', lx + 2, midY + 102, { width: lSubW - 4, lineBreak: false });

    // ── Jenis Packaging / Catatan / Pengirim (right sub) ────────────────────
    let ry = midY;

    doc.fillColor('#000000').fontSize(7).font('Helvetica-Bold')
      .text('Jenis Packaging :', rSubX, ry, { lineBreak: false });
    ry += 11;

    const packNotes = ob.notes ? ob.notes.substring(0, 100) : '-';
    doc.fillColor('#374151').fontSize(6.5).font('Helvetica')
      .text(`"${packNotes}"`, rSubX, ry, { width: rSubW, height: 36, lineGap: 0.5 });
    ry += 38;

    doc.fillColor('#000000').fontSize(7).font('Helvetica-Bold')
      .text('Catatan :', rSubX, ry, { lineBreak: false });
    ry += 11;
    doc.fillColor('#374151').fontSize(6.5).font('Helvetica')
      .text('""', rSubX, ry, { width: rSubW, height: 18 });
    ry += 20;

    doc.fillColor('#000000').fontSize(7).font('Helvetica-Bold')
      .text('Pengirim :', rSubX, ry, { lineBreak: false });
    ry += 11;
    doc.fillColor('#000000').fontSize(7).font('Helvetica')
      .text(`Nama      : ${(ob.seller?.name || '-').substring(0, 18)}`, rSubX, ry, { width: rSubW, lineBreak: false });
    ry += 9;
    doc.text(`Telepon   : ${ob.seller?.phone || '-'}`, rSubX, ry, { width: rSubW, lineBreak: false });

    // ── [5] TOTAL QTY BAR ─────────────────────────────────────────────────────
    const tqBarH = 20;
    doc.moveTo(lx, sep2Y).lineTo(lx + lw, sep2Y).strokeColor('#94a3b8').lineWidth(0.5).stroke();

    const halfLW = Math.floor(lw / 2);
    // Left half: Total Qty
    doc.fillColor('#000000').fontSize(9).font('Helvetica-Bold')
      .text(`Total Qty : ${totalQty} Pcs`, lx + 4, sep2Y + 6, {
        width: halfLW - 8, lineBreak: false,
      });

    // Right half: courier type / NON-MP
    doc.rect(lx + halfLW, sep2Y, lw - halfLW, tqBarH)
      .fillColor('#e2e8f0').fill().strokeColor('#94a3b8').lineWidth(0.5).stroke();
    doc.fillColor('#475569').fontSize(8).font('Helvetica-Bold')
      .text(ob.courier?.code || 'NON-MP', lx + halfLW + 2, sep2Y + 6, {
        width: lw - halfLW - 4, align: 'center', lineBreak: false,
      });

    // Vertical divider in total bar
    doc.moveTo(lx + halfLW, sep2Y).lineTo(lx + halfLW, sep2Y + tqBarH)
      .strokeColor('#94a3b8').lineWidth(0.5).stroke();

    // ── [6] BOTTOM BARCODE  (y: sep2Y+tqBarH → +24) ──────────────────────────
    const bcBotY = sep2Y + tqBarH;
    this.drawBarcode(doc, lx, bcBotY, lw, 23, ob.outboundNo);

    // ── [7] BOTTOM DIGIT ROW ─────────────────────────────────────────────────
    const botNumY = bcBotY + 23;
    const botStr  = `[ ${ob.outboundNo.split('').join(' ')} ]`;
    doc.fillColor('#000000').fontSize(5.5).font('Helvetica')
      .text(botStr, lx + 2, botNumY + 1, { width: lw - 4, align: 'center', lineBreak: false });

    // ─────────────────────────────────────────────────────────────────────────────
    // VERTICAL DIVIDER
    // ─────────────────────────────────────────────────────────────────────────────
    doc.moveTo(DX, M / 2).lineTo(DX, LH - M / 2).strokeColor('#000000').lineWidth(1).stroke();

    // ─────────────────────────────────────────────────────────────────────────────
    // RIGHT PANEL — PICKLIST  (x: DX → LW-M)
    // ─────────────────────────────────────────────────────────────────────────────
    const px = DX + 4;
    const pw = LW - M - px - 2;

    // ── [8] PICKLIST HEADER ──────────────────────────────────────────────────
    doc.rect(DX, M, LW - M - DX, hH)
      .fillColor('#f1f5f9').fill().strokeColor('#cbd5e1').lineWidth(0.5).stroke();

    const sellerShort = (ob.seller?.name || 'SELLER').substring(0, 16).toUpperCase();
    doc.fillColor('#000000').fontSize(7.5).font('Helvetica-Bold')
      .text(`Picklist : (${sellerShort})`, px, M + 7, { lineBreak: false });
    doc.fontSize(7.5).font('Helvetica-Bold')
      .text('Qty', px, M + 7, { width: pw, align: 'right', lineBreak: false });

    // Separator below picklist header
    doc.moveTo(DX, M + hH).lineTo(LW - M, M + hH)
      .strokeColor('#000000').lineWidth(0.7).stroke();

    // ── [9] PICKLIST ITEMS ───────────────────────────────────────────────────
    let iy = M + hH + 3;
    const maxIY = LH - M - 14; // leave room for footer

    for (const item of items) {
      if (iy + 24 > maxIY) break;

      const sku  = (item.product?.sku || item.productId?.substring(0, 14) || '-');
      const name = (item.product?.name || 'Unknown').substring(0, 24);
      const qty  = item.quantity || 0;

      // SKU line (tiny, gray)
      doc.fillColor('#6b7280').fontSize(5.5).font('Helvetica')
        .text(sku, px, iy, { width: pw, lineBreak: false });
      iy += 7;

      // Product name (bold) + qty (right aligned, same baseline)
      doc.fillColor('#000000').fontSize(7).font('Helvetica-Bold')
        .text(name, px, iy, { width: pw - 16, lineBreak: false });
      doc.fontSize(8.5).font('Helvetica-Bold')
        .text(String(qty), px, iy, { width: pw, align: 'right', lineBreak: false });
      iy += 9;

      // BIN label + dashed line
      doc.fillColor('#374151').fontSize(6).font('Helvetica');
      const binLabel = 'BIN : -';
      doc.text(binLabel, px, iy, { lineBreak: false });

      // Dashed line from after BIN text to right edge
      doc.fontSize(6).font('Helvetica'); // ensure font set for widthOfString
      const binW     = doc.widthOfString(binLabel);
      const dashSX   = px + binW + 3;
      const dashEX   = px + pw;
      doc.dash(2, { space: 2 });
      doc.moveTo(dashSX, iy + 4).lineTo(dashEX, iy + 4)
        .strokeColor('#aaaaaa').lineWidth(0.5).stroke();
      doc.undash();
      iy += 7;

      // Thin item separator
      doc.moveTo(DX + 3, iy).lineTo(LW - M - 3, iy)
        .strokeColor('#e5e7eb').lineWidth(0.3).stroke();
      iy += 3;
    }

    // ── [10] PICKLIST FOOTER ─────────────────────────────────────────────────
    const pfY = LH - M - 12;
    doc.moveTo(DX, pfY).lineTo(LW - M, pfY).strokeColor('#e5e7eb').lineWidth(0.3).stroke();
    doc.fillColor('#9ca3af').fontSize(5.5).font('Helvetica')
      .text('Powered by WMS 3PL System', px, pfY + 3, {
        width: pw, align: 'center', lineBreak: false,
      });
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

  // ── Public: bulk multi-page label ────────────────────────────────────────────
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
