import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getInventoryReport(paginationDto: PaginationDto, sellerId?: string) {
    const where: any = {
      product: { deletedAt: null },
    };
    if (sellerId) {
      where.sellerId = sellerId;
    }
    if (paginationDto.search) {
      where.product = {
        deletedAt: null,
        OR: [
          { sku: { contains: paginationDto.search, mode: 'insensitive' } },
          { name: { contains: paginationDto.search, mode: 'insensitive' } },
        ],
      };
    }

    return this.prisma.inventoryBalance.findMany({
      where,
      include: {
        product: true,
        seller: { select: { code: true, name: true } },
      },
      orderBy: { product: { sku: 'asc' } },
    });
  }

  async exportInventoryExcel(sellerId?: string): Promise<Buffer> {
    const data = await this.getInventoryReport({ page: 1, limit: 1000 }, sellerId);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventory Report');

    worksheet.columns = [
      { header: 'Seller', key: 'seller', width: 20 },
      { header: 'SKU', key: 'sku', width: 20 },
      { header: 'Product Name', key: 'name', width: 30 },
      { header: 'Available', key: 'available', width: 12 },
      { header: 'Reserved', key: 'reserved', width: 12 },
      { header: 'Damaged', key: 'damaged', width: 12 },
      { header: 'Reject', key: 'reject', width: 12 },
      { header: 'Total Stock', key: 'total', width: 12 },
    ];

    data.forEach((b) => {
      worksheet.addRow({
        seller: `[${b.seller.code}] ${b.seller.name}`,
        sku: b.product.sku,
        name: b.product.name,
        available: b.available,
        reserved: b.reserved,
        damaged: b.damaged,
        reject: b.reject,
        total: b.available + b.reserved + b.damaged + b.reject,
      });
    });

    worksheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async getInboundReport(startDate?: string, endDate?: string, sellerId?: string) {
    const where: any = { deletedAt: null };
    if (sellerId) {
      where.sellerId = sellerId;
    }
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prisma.inbound.findMany({
      where,
      include: {
        seller: { select: { code: true, name: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async exportInboundExcel(startDate?: string, endDate?: string, sellerId?: string): Promise<Buffer> {
    const data = await this.getInboundReport(startDate, endDate, sellerId);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inbound Report');

    worksheet.columns = [
      { header: 'Inbound No', key: 'inboundNo', width: 20 },
      { header: 'Seller', key: 'seller', width: 20 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Ref No', key: 'refNo', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'SKU', key: 'sku', width: 20 },
      { header: 'Product Name', key: 'name', width: 25 },
      { header: 'Expected Qty', key: 'expected', width: 12 },
      { header: 'Received Qty', key: 'received', width: 12 },
      { header: 'Reject Qty', key: 'reject', width: 12 },
    ];

    data.forEach((inb) => {
      inb.items.forEach((item) => {
        worksheet.addRow({
          inboundNo: inb.inboundNo,
          seller: inb.seller.name,
          type: inb.type,
          status: inb.status,
          refNo: inb.referenceNo || '',
          date: new Date(inb.createdAt).toLocaleDateString(),
          sku: item.product.sku,
          name: item.product.name,
          expected: item.expectedQty,
          received: item.receivedQty,
          reject: item.rejectQty,
        });
      });
    });

    worksheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async getOutboundReport(startDate?: string, endDate?: string, sellerId?: string) {
    const where: any = { deletedAt: null };
    if (sellerId) {
      where.sellerId = sellerId;
    }
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prisma.outbound.findMany({
      where,
      include: {
        seller: { select: { code: true, name: true } },
        courier: { select: { name: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async exportOutboundExcel(startDate?: string, endDate?: string, sellerId?: string): Promise<Buffer> {
    const data = await this.getOutboundReport(startDate, endDate, sellerId);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Outbound Report');

    worksheet.columns = [
      { header: 'Outbound No', key: 'outboundNo', width: 20 },
      { header: 'Seller', key: 'seller', width: 20 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Courier', key: 'courier', width: 15 },
      { header: 'Tracking No', key: 'tracking', width: 20 },
      { header: 'Recipient', key: 'recipient', width: 20 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'SKU', key: 'sku', width: 20 },
      { header: 'Product Name', key: 'name', width: 25 },
      { header: 'Qty Ordered', key: 'qty', width: 12 },
    ];

    data.forEach((outb) => {
      outb.items.forEach((item) => {
        worksheet.addRow({
          outboundNo: outb.outboundNo,
          seller: outb.seller.name,
          type: outb.type,
          status: outb.status,
          courier: outb.courier?.name || 'SELF PICKUP',
          tracking: outb.trackingNumber || 'PENDING',
          recipient: outb.recipientName,
          address: outb.recipientAddress,
          date: new Date(outb.createdAt).toLocaleDateString(),
          sku: item.product.sku,
          name: item.product.name,
          qty: item.quantity,
        });
      });
    });

    worksheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async getReturnReport(startDate?: string, endDate?: string, sellerId?: string) {
    const where: any = {};
    if (sellerId) {
      where.sellerId = sellerId;
    }
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prisma.return.findMany({
      where,
      include: {
        seller: { select: { code: true, name: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async exportReturnExcel(startDate?: string, endDate?: string, sellerId?: string): Promise<Buffer> {
    const data = await this.getReturnReport(startDate, endDate, sellerId);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Returns Report');

    worksheet.columns = [
      { header: 'Return No', key: 'returnNo', width: 20 },
      { header: 'Seller', key: 'seller', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Reason', key: 'reason', width: 25 },
      { header: 'Date Filed', key: 'date', width: 15 },
      { header: 'SKU', key: 'sku', width: 20 },
      { header: 'Product Name', key: 'name', width: 25 },
      { header: 'Total Return Qty', key: 'quantity', width: 15 },
      { header: 'QC Good Qty', key: 'good', width: 12 },
      { header: 'QC Damaged Qty', key: 'damaged', width: 12 },
      { header: 'QC Reject Qty', key: 'reject', width: 12 },
    ];

    data.forEach((ret) => {
      ret.items.forEach((item) => {
        worksheet.addRow({
          returnNo: ret.returnNo,
          seller: ret.seller.name,
          status: ret.status,
          reason: ret.reason,
          date: new Date(ret.createdAt).toLocaleDateString(),
          sku: item.product.sku,
          name: item.product.name,
          quantity: item.quantity,
          good: item.goodQty,
          damaged: item.damagedQty,
          reject: item.rejectQty,
        });
      });
    });

    worksheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async getManifestReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prisma.manifest.findMany({
      where,
      include: {
        courier: { select: { name: true } },
        items: { include: { outbound: { include: { seller: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async exportManifestExcel(startDate?: string, endDate?: string): Promise<Buffer> {
    const data = await this.getManifestReport(startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Manifest Report');

    worksheet.columns = [
      { header: 'Manifest No', key: 'manifestNo', width: 20 },
      { header: 'Courier', key: 'courier', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Assigned Order No', key: 'orderNo', width: 20 },
      { header: 'Recipient', key: 'recipient', width: 20 },
      { header: 'Seller', key: 'seller', width: 20 },
      { header: 'Tracking No', key: 'tracking', width: 20 },
    ];

    data.forEach((mnf) => {
      mnf.items.forEach((item) => {
        worksheet.addRow({
          manifestNo: mnf.manifestNo,
          courier: mnf.courier.name,
          status: mnf.status,
          date: new Date(mnf.date).toLocaleDateString(),
          orderNo: item.outbound.outboundNo,
          recipient: item.outbound.recipientName,
          seller: item.outbound.seller.name,
          tracking: item.outbound.trackingNumber || 'PENDING',
        });
      });
    });

    worksheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async getStockMovementReport(startDate?: string, endDate?: string, sellerId?: string) {
    const where: any = {};
    if (sellerId) {
      where.sellerId = sellerId;
    }
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prisma.inventoryMovement.findMany({
      where,
      include: {
        product: { select: { sku: true, name: true } },
        seller: { select: { code: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async exportMovementExcel(startDate?: string, endDate?: string, sellerId?: string): Promise<Buffer> {
    const data = await this.getStockMovementReport(startDate, endDate, sellerId);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stock Movements Ledger');

    worksheet.columns = [
      { header: 'Movement Date', key: 'date', width: 18 },
      { header: 'Seller Owner', key: 'seller', width: 20 },
      { header: 'SKU', key: 'sku', width: 20 },
      { header: 'Product Name', key: 'name', width: 25 },
      { header: 'Movement Type', key: 'type', width: 15 },
      { header: 'Quantity Traded', key: 'qty', width: 15 },
      { header: 'Source Status', key: 'fromStatus', width: 15 },
      { header: 'Target Status', key: 'toStatus', width: 15 },
      { header: 'Ref Type', key: 'refType', width: 12 },
      { header: 'Reference No', key: 'refNo', width: 20 },
      { header: 'Remarks', key: 'notes', width: 25 },
    ];

    data.forEach((m) => {
      worksheet.addRow({
        date: new Date(m.createdAt).toLocaleString(),
        seller: m.seller.name,
        sku: m.product.sku,
        name: m.product.name,
        type: m.movementType,
        qty: m.quantity,
        fromStatus: m.fromStatus || 'NULL',
        toStatus: m.toStatus || 'NULL',
        refType: m.referenceType || '',
        refNo: m.referenceNo || '',
        notes: m.notes || '',
      });
    });

    worksheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async getStockOpnameReport(startDate?: string, endDate?: string, sellerId?: string) {
    const where: any = {};
    if (sellerId) {
      where.sellerId = sellerId;
    }
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prisma.stockOpname.findMany({
      where,
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async exportOpnameExcel(startDate?: string, endDate?: string, sellerId?: string): Promise<Buffer> {
    const data = await this.getStockOpnameReport(startDate, endDate, sellerId);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stock Opname Count History');

    worksheet.columns = [
      { header: 'Opname Session No', key: 'opnameNo', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Session Date', key: 'date', width: 15 },
      { header: 'SKU', key: 'sku', width: 20 },
      { header: 'Product Name', key: 'name', width: 25 },
      { header: 'System Qty', key: 'system', width: 12 },
      { header: 'Physical Checked Qty', key: 'physical', width: 18 },
      { header: 'Variance Discrepancy', key: 'variance', width: 18 },
      { header: 'Discrepancy Reason', key: 'reason', width: 25 },
    ];

    data.forEach((opn) => {
      opn.items.forEach((item) => {
        worksheet.addRow({
          opnameNo: opn.opnameNo,
          status: opn.status,
          date: new Date(opn.createdAt).toLocaleDateString(),
          sku: item.product.sku,
          name: item.product.name,
          system: item.systemQty,
          physical: item.physicalQty,
          variance: item.variance,
          reason: item.reason || '',
        });
      });
    });

    worksheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
