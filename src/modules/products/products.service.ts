import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto, paginate, getPaginationParams } from '../../common/dto/pagination.dto';
import { AuditLogService } from '../../common/services/audit-log.service';
import { AuditAction, ProductStatus } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { Readable } from 'stream';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async create(createProductDto: CreateProductDto, currentUserId?: string) {
    const {
      sellerId,
      sku,
      barcode,
      name,
      description,
      hpp,
      length,
      width,
      height,
      weight,
      unit,
      status,
      imageUrl,
    } = createProductDto;

    // Check unique SKU per seller
    const existingSku = await this.prisma.product.findUnique({
      where: {
        sellerId_sku: {
          sellerId,
          sku,
        },
      },
    });
    if (existingSku && !existingSku.deletedAt) {
      throw new BadRequestException(`Product with SKU ${sku} already exists for this seller`);
    }

    const product = await this.prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          sellerId,
          sku,
          barcode,
          name,
          description,
          hpp,
          length,
          width,
          height,
          weight,
          unit,
          status: status || ProductStatus.ACTIVE,
          imageUrl,
        },
      });

      // Initialize inventory balance
      await tx.inventoryBalance.create({
        data: {
          sellerId,
          productId: prod.id,
          available: 0,
          reserved: 0,
          damaged: 0,
          reject: 0,
        },
      });

      return prod;
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.CREATE,
      entity: 'products',
      entityId: product.id,
      entityNo: product.sku,
      description: `Created product SKU ${product.sku} for sellerId ${product.sellerId}`,
      after: product,
    });

    return product;
  }

  async findAll(paginationDto: PaginationDto, sellerId?: string) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);

    const where: any = {
      deletedAt: null,
    };

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
        include: {
          seller: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          inventoryBalances: {
            select: {
              available: true,
              reserved: true,
              damaged: true,
              reject: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginate(products, total, page, limit);
  }

  async findOne(id: string, sellerId?: string) {
    const where: any = { id, deletedAt: null };
    if (sellerId) {
      where.sellerId = sellerId;
    }

    const product = await this.prisma.product.findFirst({
      where,
      include: {
        seller: true,
        inventoryBalances: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, currentUserId?: string, sellerId?: string) {
    const product = await this.findOne(id, sellerId);
    const before = { ...product };

    const updated = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.UPDATE,
      entity: 'products',
      entityId: id,
      entityNo: product.sku,
      description: `Updated product SKU ${product.sku}`,
      before,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, currentUserId?: string, sellerId?: string) {
    const product = await this.findOne(id, sellerId);

    // Verify stock is 0
    const balance = await this.prisma.inventoryBalance.findUnique({
      where: { sellerId_productId: { sellerId: product.sellerId, productId: product.id } },
    });

    if (balance) {
      const totalStock = balance.available + balance.reserved + balance.damaged + balance.reject;
      if (totalStock > 0) {
        throw new BadRequestException('Cannot delete product with existing stock in warehouse');
      }
    }

    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), status: ProductStatus.INACTIVE },
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.DELETE,
      entity: 'products',
      entityId: id,
      entityNo: product.sku,
      description: `Soft-deleted product SKU ${product.sku}`,
      before: product,
    });

    return { message: 'Product deleted successfully' };
  }

  async exportExcel(sellerId?: string): Promise<Buffer> {
    const where: any = { deletedAt: null };
    if (sellerId) {
      where.sellerId = sellerId;
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        seller: true,
        inventoryBalances: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    worksheet.columns = [
      { header: 'Seller Code', key: 'sellerCode', width: 15 },
      { header: 'Seller Name', key: 'sellerName', width: 20 },
      { header: 'SKU', key: 'sku', width: 20 },
      { header: 'Barcode', key: 'barcode', width: 15 },
      { header: 'Product Name', key: 'name', width: 30 },
      { header: 'HPP Cost', key: 'hpp', width: 15 },
      { header: 'Length (cm)', key: 'length', width: 12 },
      { header: 'Width (cm)', key: 'width', width: 12 },
      { header: 'Height (cm)', key: 'height', width: 12 },
      { header: 'Weight (kg)', key: 'weight', width: 12 },
      { header: 'Unit', key: 'unit', width: 10 },
      { header: 'Available Qty', key: 'available', width: 15 },
      { header: 'Reserved Qty', key: 'reserved', width: 15 },
    ];

    for (const p of products) {
      const balance = p.inventoryBalances[0];
      worksheet.addRow({
        sellerCode: p.seller.code,
        sellerName: p.seller.name,
        sku: p.sku,
        barcode: p.barcode || '',
        name: p.name,
        hpp: Number(p.hpp),
        length: p.length ? Number(p.length) : '',
        width: p.width ? Number(p.width) : '',
        height: p.height ? Number(p.height) : '',
        weight: p.weight ? Number(p.weight) : '',
        unit: p.unit,
        available: balance ? balance.available : 0,
        reserved: balance ? balance.reserved : 0,
      });
    }

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async importExcel(fileBuffer: any, targetSellerId: string, currentUserId?: string) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(fileBuffer) as any);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new BadRequestException('Excel sheet is empty');
    }

    const productsCreated = [];
    const errors = [];

    // Let's iterate over rows starting from row 2
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const sku = row.getCell(1).value?.toString()?.trim();
      const barcode = row.getCell(2).value?.toString()?.trim();
      const name = row.getCell(3).value?.toString()?.trim();
      const hppValue = row.getCell(4).value;
      const lengthValue = row.getCell(5).value;
      const widthValue = row.getCell(6).value;
      const heightValue = row.getCell(7).value;
      const weightValue = row.getCell(8).value;
      const unit = row.getCell(9).value?.toString()?.trim() || 'pcs';

      if (!sku || !name) {
        if (sku || name) {
          errors.push(`Row ${i}: SKU and Product Name are required.`);
        }
        continue;
      }

      const hpp = hppValue ? Number(hppValue) : 0;
      const length = lengthValue ? Number(lengthValue) : null;
      const width = widthValue ? Number(widthValue) : null;
      const height = heightValue ? Number(heightValue) : null;
      const weight = weightValue ? Number(weightValue) : null;

      try {
        const prod = await this.create(
          {
            sellerId: targetSellerId,
            sku,
            barcode,
            name,
            hpp,
            length,
            width,
            height,
            weight,
            unit,
            status: ProductStatus.ACTIVE,
          },
          currentUserId,
        );
        productsCreated.push(prod);
      } catch (err) {
        errors.push(`Row ${i} (SKU ${sku}): ${err.message}`);
      }
    }

    return {
      message: `Import complete. ${productsCreated.length} products imported.`,
      successCount: productsCreated.length,
      errors,
    };
  }
}
