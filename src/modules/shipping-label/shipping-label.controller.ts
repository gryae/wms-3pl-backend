import { Controller, Get, Param, Res, UseGuards, ForbiddenException } from '@nestjs/common';
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
    // Retrieve outbound to verify owner
    const outbound = await this.labelService.generateLabelPdf(outboundId);

    // If user is seller, verify ownership before sending PDF
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
}
