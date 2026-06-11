import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as PDFDocument from 'pdfkit';

// 100mm x 78mm shipping label
// 1 inch = 72 points (PDF unit)
// 100mm = 283.46pt, 78mm = 221.1pt
const LABEL_WIDTH_PT = 283.46;
const LABEL_HEIGHT_PT = 221.1;

@Injectable()
export class ShippingLabelService {
  constructor(private prisma: PrismaService) {}

  async generateLabelPdf(outboundId: string): Promise<Buffer> {
    const outbound = await this.prisma.outbound.findUnique({
      where: { id: outboundId },
      include: {
        seller: true,
        courier: true,
      },
    });

    if (!outbound) {
      throw new NotFoundException('Outbound order not found');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: [LABEL_WIDTH_PT, LABEL_HEIGHT_PT], // 100x78mm
        margins: { top: 8, bottom: 8, left: 8, right: 8 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const W = LABEL_WIDTH_PT;
      const H = LABEL_HEIGHT_PT;
      const margin = 8;

      // Outer border
      doc.rect(margin / 2, margin / 2, W - margin, H - margin).stroke();

      // --- HEADER (top 24pt) ---
      doc.rect(margin / 2, margin / 2, W - margin, 22).fill('#1e293b');
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
        .text('SHIPPING LABEL', margin, 9, { align: 'center', width: W - margin * 2 });
      doc.fillColor('#000000');

      // --- COURIER + ORDER NO row ---
      doc.moveTo(margin / 2, 26).lineTo(W - margin / 2, 26).stroke();
      const courierName = outbound.courier?.name || 'SELF PICKUP';
      doc.fontSize(11).font('Helvetica-Bold')
        .text(courierName.toUpperCase(), margin, 30, { width: (W / 2) - margin - 4 });
      doc.fontSize(6).font('Helvetica-Bold').fillColor('#475569')
        .text('NO. ORDER:', W / 2 + 2, 30);
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#000000')
        .text(outbound.outboundNo, W / 2 + 2, 39, { width: W / 2 - margin - 2 });

      // --- SEPARATOR ---
      doc.moveTo(margin / 2, 56).lineTo(W - margin / 2, 56).stroke();

      // --- FROM / TO ---
      // FROM (left half)
      doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#94a3b8')
        .text('PENGIRIM:', margin, 60);
      doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#000000')
        .text(outbound.seller.name, margin, 68, { width: W / 2 - margin - 4 });
      if (outbound.seller.phone) {
        doc.fontSize(6).font('Helvetica').text(outbound.seller.phone, margin, 77, { width: W / 2 - margin - 4 });
      }

      // Vertical divider between FROM/TO
      doc.moveTo(W / 2, 56).lineTo(W / 2, 138).stroke();

      // TO (right half)
      doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#94a3b8')
        .text('PENERIMA:', W / 2 + 4, 60);
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#000000')
        .text(outbound.recipientName, W / 2 + 4, 68, { width: W / 2 - margin - 4 });
      doc.fontSize(6.5).font('Helvetica-Bold')
        .text(outbound.recipientPhone, W / 2 + 4, 79);
      doc.fontSize(5.5).font('Helvetica')
        .text(
          [outbound.recipientAddress, outbound.recipientCity, outbound.recipientProvince, outbound.recipientPostcode]
            .filter(Boolean).join(', '),
          W / 2 + 4, 89,
          { width: W / 2 - margin - 4, height: 40 }
        );

      // --- SEPARATOR ---
      doc.moveTo(margin / 2, 138).lineTo(W - margin / 2, 138).stroke();

      // --- TRACKING NO SECTION ---
      const trackingNo = outbound.trackingNumber || outbound.sellerAwbNo || outbound.outboundNo;
      doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#94a3b8')
        .text('NO. RESI / AWB:', margin, 142);
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000')
        .text(trackingNo, margin, 151, { width: W - margin * 2, align: 'center' });

      // Simulated barcode visual lines
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
        if (currentX + barWidth > barcodeX + barcodeW - 3) break;
        doc.rect(currentX, barcodeY + 2, barWidth, barcodeH - 4).fill();
        currentX += barWidth + gapWidth;
        patternIdx++;
      }

      // --- FOOTER ---
      doc.moveTo(margin / 2, 194).lineTo(W - margin / 2, 194).stroke();
      doc.fontSize(5).font('Helvetica').fillColor('#94a3b8')
        .text('Generated by WMS 3PL System', margin, 198, { align: 'center', width: W - margin * 2 });

      doc.end();
    });
  }
}
