import { Controller, Get, Post, Body, Param, Res, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShippingLabelService } from './shipping-label.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Response } from 'express';

@ApiTags('Outbound')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('shipping-label')
export class ShippingLabelController {
  constructor(private readonly labelService: ShippingLabelService) {}

  @Get(':outboundId')
  @ApiOperation({ summary: 'Generate and download standard 4x6 shipping label PDF' })
  async getLabel(
    @Param('outboundId') outboundId: string,
    @Res() res: Response,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    const outbound = await this.labelService.generateLabelPdf(outboundId);

    const checkOutbound = await this.labelService['prisma'].outbound.findUnique({
      where: { id: outboundId },
    });
    if (sellerId && checkOutbound?.sellerId !== sellerId) {
      throw new ForbiddenException('Tenant Isolation: You cannot access shipping labels for another seller');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=label_${checkOutbound?.outboundNo}.pdf`);
    res.send(outbound);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk download shipping labels as a single merged PDF (one label per page)' })
  async getBulkLabels(
    @Body() body: { outboundIds: string[] },
    @Res() res: Response,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    // If seller user, verify all orders belong to them
    if (sellerId) {
      const outbounds = await this.labelService['prisma'].outbound.findMany({
        where: { id: { in: body.outboundIds } },
        select: { sellerId: true, outboundNo: true },
      });
      const unauthorized = outbounds.filter((o) => o.sellerId !== sellerId);
      if (unauthorized.length > 0) {
        throw new ForbiddenException('Tenant Isolation: You cannot access shipping labels for another seller');
      }
    }

    const pdfBuffer = await this.labelService.generateBulkLabelPdf(body.outboundIds);
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bulk_labels_${timestamp}_${body.outboundIds.length}orders.pdf`);
    res.send(pdfBuffer);
  }
}

