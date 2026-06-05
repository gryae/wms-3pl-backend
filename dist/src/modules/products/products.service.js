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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const audit_log_service_1 = require("../../common/services/audit-log.service");
const client_1 = require("@prisma/client");
const ExcelJS = require("exceljs");
let ProductsService = class ProductsService {
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    async create(createProductDto, currentUserId) {
        const { sellerId, sku, barcode, name, description, hpp, length, width, height, weight, unit, status, imageUrl, } = createProductDto;
        const existingSku = await this.prisma.product.findUnique({
            where: {
                sellerId_sku: {
                    sellerId,
                    sku,
                },
            },
        });
        if (existingSku && !existingSku.deletedAt) {
            throw new common_1.BadRequestException(`Product with SKU ${sku} already exists for this seller`);
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
                    status: status || client_1.ProductStatus.ACTIVE,
                    imageUrl,
                },
            });
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
            action: client_1.AuditAction.CREATE,
            entity: 'products',
            entityId: product.id,
            entityNo: product.sku,
            description: `Created product SKU ${product.sku} for sellerId ${product.sellerId}`,
            after: product,
        });
        return product;
    }
    async findAll(paginationDto, sellerId) {
        const { page, limit, search, sortBy, sortOrder } = paginationDto;
        const { skip, take } = (0, pagination_dto_1.getPaginationParams)(page, limit);
        const where = {
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
        return (0, pagination_dto_1.paginate)(products, total, page, limit);
    }
    async findOne(id, sellerId) {
        const where = { id, deletedAt: null };
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
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    async update(id, updateProductDto, currentUserId, sellerId) {
        const product = await this.findOne(id, sellerId);
        const before = { ...product };
        const updated = await this.prisma.product.update({
            where: { id },
            data: updateProductDto,
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.UPDATE,
            entity: 'products',
            entityId: id,
            entityNo: product.sku,
            description: `Updated product SKU ${product.sku}`,
            before,
            after: updated,
        });
        return updated;
    }
    async remove(id, currentUserId, sellerId) {
        const product = await this.findOne(id, sellerId);
        const balance = await this.prisma.inventoryBalance.findUnique({
            where: { sellerId_productId: { sellerId: product.sellerId, productId: product.id } },
        });
        if (balance) {
            const totalStock = balance.available + balance.reserved + balance.damaged + balance.reject;
            if (totalStock > 0) {
                throw new common_1.BadRequestException('Cannot delete product with existing stock in warehouse');
            }
        }
        await this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date(), status: client_1.ProductStatus.INACTIVE },
        });
        await this.auditLogService.log({
            userId: currentUserId,
            action: client_1.AuditAction.DELETE,
            entity: 'products',
            entityId: id,
            entityNo: product.sku,
            description: `Soft-deleted product SKU ${product.sku}`,
            before: product,
        });
        return { message: 'Product deleted successfully' };
    }
    async exportExcel(sellerId) {
        const where = { deletedAt: null };
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
    async importExcel(fileBuffer, targetSellerId, currentUserId) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(Buffer.from(fileBuffer));
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
            throw new common_1.BadRequestException('Excel sheet is empty');
        }
        const productsCreated = [];
        const errors = [];
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
                const prod = await this.create({
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
                    status: client_1.ProductStatus.ACTIVE,
                }, currentUserId);
                productsCreated.push(prod);
            }
            catch (err) {
                errors.push(`Row ${i} (SKU ${sku}): ${err.message}`);
            }
        }
        return {
            message: `Import complete. ${productsCreated.length} products imported.`,
            successCount: productsCreated.length,
            errors,
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], ProductsService);
//# sourceMappingURL=products.service.js.map