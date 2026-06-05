import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateManifestDto } from './dto/create-manifest.dto';
import { AddShipmentsDto } from './dto/add-shipments.dto';
import { PaginationDto, paginate, getPaginationParams } from '../../common/dto/pagination.dto';
import { AuditLogService } from '../../common/services/audit-log.service';
import { ManifestStatus, AuditAction, OutboundStatus } from '@prisma/client';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ManifestsService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async create(dto: CreateManifestDto, currentUserId: string) {
    const { courierId, notes } = dto;

    // Check Courier exists
    const courier = await this.prisma.courier.findUnique({ where: { id: courierId } });
    if (!courier) {
      throw new NotFoundException('Courier not found');
    }

    // RULE: No duplicate open manifests for the same courier
    const existingOpen = await this.prisma.manifest.findFirst({
      where: {
        courierId,
        status: ManifestStatus.OPEN,
      },
    });
    if (existingOpen) {
      throw new BadRequestException(
        `There is already an open manifest (${existingOpen.manifestNo}) for courier ${courier.name}. Close it before creating a new one.`,
      );
    }

    // Generate unique Manifest Number
    const prefixConfig = await this.prisma.warehouseConfig.findUnique({ where: { key: 'manifest.prefix' } });
    const prefix = prefixConfig ? prefixConfig.value : 'MNF';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.manifest.count({
      where: { manifestNo: { startsWith: `${prefix}-${dateStr}` } },
    });
    const seq = (count + 1).toString().padStart(4, '0');
    const manifestNo = `${prefix}-${dateStr}-${seq}`;

    const manifest = await this.prisma.manifest.create({
      data: {
        manifestNo,
        courierId,
        notes,
        status: ManifestStatus.OPEN,
        createdById: currentUserId,
      },
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.CREATE,
      entity: 'manifests',
      entityId: manifest.id,
      entityNo: manifest.manifestNo,
      description: `Open manifest ${manifest.manifestNo} created for courier ${courier.name}`,
      after: manifest,
    });

    return manifest;
  }

  async addShipments(id: string, dto: AddShipmentsDto, currentUserId: string) {
    const manifest = await this.findOne(id);
    if (manifest.status !== ManifestStatus.OPEN) {
      throw new BadRequestException('Cannot add shipments to a closed manifest');
    }

    const addedItems = await this.prisma.$transaction(async (tx) => {
      const itemsCreated = [];
      for (const outboundId of dto.outboundIds) {
        const outbound = await tx.outbound.findUnique({
          where: { id: outboundId },
        });

        if (!outbound) {
          throw new NotFoundException(`Outbound order ID ${outboundId} not found`);
        }

        // VALIDATION: Verify outbound matches courier
        if (outbound.courierId !== manifest.courierId) {
          throw new BadRequestException(
            `Courier mismatch. Order ${outbound.outboundNo} belongs to courier ID ${outbound.courierId}, but manifest is for courier ID ${manifest.courierId}`,
          );
        }

        // VALIDATION: Verify outbound status is READY_TO_SHIP or SHIPPED
        const allowed: OutboundStatus[] = [OutboundStatus.READY_TO_SHIP, OutboundStatus.SHIPPED];
        if (!allowed.includes(outbound.status)) {
          throw new BadRequestException(
            `Order ${outbound.outboundNo} is in status ${outbound.status}. Only orders in READY_TO_SHIP or SHIPPED state can be added to manifests`,
          );
        }

        // Check if duplicate manifest items exist
        const duplicate = await tx.manifestItem.findFirst({
          where: {
            manifestId: id,
            outboundId,
          },
        });
        if (duplicate) continue;

        const item = await tx.manifestItem.create({
          data: {
            manifestId: id,
            outboundId,
          },
        });

        await tx.outboundTimeline.create({
          data: {
            outboundId,
            action: 'Manifest Added',
            notes: `Added to manifest shipment sheet ${manifest.manifestNo}`,
            userId: currentUserId,
            userName: (await tx.user.findUnique({ where: { id: currentUserId } }))?.name || 'User',
          },
        });

        itemsCreated.push(item);
      }
      return itemsCreated;
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.UPDATE,
      entity: 'manifests',
      entityId: id,
      entityNo: manifest.manifestNo,
      description: `Added ${addedItems.length} orders to manifest ${manifest.manifestNo}`,
    });

    return this.findOne(id);
  }

  async closeManifest(id: string, currentUserId: string) {
    const manifest = await this.findOne(id);
    if (manifest.status !== ManifestStatus.OPEN) {
      throw new BadRequestException('Manifest is already closed or cancelled');
    }

    if (manifest.items.length === 0) {
      throw new BadRequestException('Cannot close an empty manifest. Add shipments first.');
    }

    const updated = await this.prisma.manifest.update({
      where: { id },
      data: {
        status: ManifestStatus.CLOSED,
        closedAt: new Date(),
      },
    });

    await this.auditLogService.log({
      userId: currentUserId,
      action: AuditAction.STATUS_CHANGE,
      entity: 'manifests',
      entityId: id,
      entityNo: manifest.manifestNo,
      description: `Manifest ${manifest.manifestNo} closed and handed over to courier dispatch`,
    });

    return updated;
  }

  async generateManifestPdf(id: string): Promise<Buffer> {
    const manifest = await this.findOne(id);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // --- LOGO & HEADER ---
      doc.fontSize(16).font('Helvetica-Bold').text('ENTERPRISE 3PL WMS', 30, 30);
      doc.fontSize(9).font('Helvetica').text('DISPATCH MANIFEST DOCUMENT', 30, 48);

      // --- METADATA BOX ---
      const infoBoxY = 70;
      doc.rect(30, infoBoxY, 552, 60).stroke('#aaaaaa');

      doc.fontSize(8).font('Helvetica-Bold');
      doc.text('Manifest No:', 40, infoBoxY + 8);
      doc.text('Courier Brand:', 40, infoBoxY + 22);
      doc.text('Handover Date:', 40, infoBoxY + 36);

      doc.font('Helvetica');
      doc.text(manifest.manifestNo, 120, infoBoxY + 8);
      doc.text(manifest.courier.name, 120, infoBoxY + 22);
      doc.text(new Date(manifest.date).toLocaleString('id-ID'), 120, infoBoxY + 36);

      doc.font('Helvetica-Bold');
      doc.text('Total Orders:', 320, infoBoxY + 8);
      doc.text('Handover Status:', 320, infoBoxY + 22);
      doc.text('Created By:', 320, infoBoxY + 36);

      doc.font('Helvetica');
      doc.text(manifest.items.length.toString(), 410, infoBoxY + 8);
      doc.text(manifest.status, 410, infoBoxY + 22);
      doc.text(manifest.createdBy.name, 410, infoBoxY + 36);

      // --- ITEMS TABLE ---
      let itemY = 150;
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('No', 30, itemY);
      doc.text('Outbound order No', 60, itemY);
      doc.text('Recipient Name', 160, itemY);
      doc.text('Seller Owner', 280, itemY);
      doc.text('Tracking Number', 400, itemY);
      doc.text('Status', 510, itemY);

      doc.moveTo(30, itemY + 12).lineTo(582, itemY + 12).stroke('#000000');
      itemY += 18;

      doc.font('Helvetica').fontSize(8);
      manifest.items.forEach((item, index) => {
        const order = item.outbound;
        doc.text((index + 1).toString(), 30, itemY);
        doc.text(order.outboundNo, 60, itemY);
        doc.text(order.recipientName.slice(0, 20), 160, itemY);
        doc.text(order.seller.name.slice(0, 20), 280, itemY);
        doc.text(order.trackingNumber || 'PENDING', 400, itemY);
        doc.text(order.status, 510, itemY);

        doc.moveTo(30, itemY + 10).lineTo(582, itemY + 10).stroke('#dddddd');
        itemY += 15;

        // Page break logic if long list
        if (itemY > 700) {
          doc.addPage();
          itemY = 40;
          doc.fontSize(9).font('Helvetica-Bold').text('Manifest Items List (Continued)', 30, itemY);
          itemY += 20;
        }
      });

      // --- SIGNATURE BLOCK ---
      const sigY = 680;
      doc.fontSize(8).font('Helvetica-Bold');
      doc.text('PREPARED BY (WMS ADMIN)', 30, sigY, { width: 150, align: 'center' });
      doc.text('HANDED OVER BY (COURIER DRIVER)', 432, sigY, { width: 150, align: 'center' });

      doc.moveTo(30, sigY + 50).lineTo(180, sigY + 50).stroke();
      doc.moveTo(432, sigY + 50).lineTo(582, sigY + 50).stroke();

      doc.font('Helvetica').fontSize(7);
      doc.text('Driver Name:', 432, sigY + 55);
      doc.text('Vehicle Plate:', 432, sigY + 65);

      doc.end();
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { manifestNo: { contains: search, mode: 'insensitive' } },
        { courier: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [manifests, total] = await Promise.all([
      this.prisma.manifest.findMany({
        where,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
        include: {
          courier: { select: { name: true } },
          createdBy: { select: { name: true } },
        },
      }),
      this.prisma.manifest.count({ where }),
    ]);

    return paginate(manifests, total, page, limit);
  }

  async findOne(id: string) {
    const manifest = await this.prisma.manifest.findUnique({
      where: { id },
      include: {
        courier: true,
        createdBy: { select: { name: true, email: true } },
        items: {
          include: {
            outbound: {
              include: {
                seller: true,
              },
            },
          },
        },
      },
    });

    if (!manifest) {
      throw new NotFoundException('Manifest sheet not found');
    }

    return manifest;
  }
}
