import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { OutboundService } from './outbound.service';
import { CreateOutboundDto } from './dto/create-outbound.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Outbound')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('outbounds')
export class OutboundController {
  constructor(private readonly outboundService: OutboundService) {}

  @Post()
  @RequirePermissions('outbound.create')
  @ApiOperation({ summary: 'Create a new Outbound order (DRAFT status)' })
  create(
    @Body() dto: CreateOutboundDto,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('sellerId') tokenSellerId?: string,
  ) {
    if (tokenSellerId && tokenSellerId !== dto.sellerId) {
      throw new ForbiddenException('Tenant Isolation: You cannot create outbound orders for another seller');
    }
    return this.outboundService.create(dto, currentUserId);
  }

  @Get()
  @RequirePermissions('outbound.view')
  @ApiOperation({ summary: 'Get list of outbound orders' })
  findAll(@Query() paginationDto: PaginationDto, @CurrentUser('sellerId') sellerId?: string) {
    return this.outboundService.findAll(paginationDto, sellerId);
  }

  @Get(':id')
  @RequirePermissions('outbound.view')
  @ApiOperation({ summary: 'Get details and timeline of an outbound order' })
  findOne(@Param('id') id: string, @CurrentUser('sellerId') sellerId?: string) {
    return this.outboundService.findOne(id, sellerId);
  }

  @Post(':id/submit')
  @RequirePermissions('outbound.create')
  @ApiOperation({ summary: 'Submit order for processing and allocate/reserve stock' })
  async submit(@Param('id') id: string, @CurrentUser('id') currentUserId: string, @CurrentUser('sellerId') sellerId?: string) {
    // Verify ownership
    await this.outboundService.findOne(id, sellerId);
    return this.outboundService.submit(id, currentUserId);
  }

  @Post(':id/ship')
  @RequirePermissions('packing.manage')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['trackingNumber'],
      properties: {
        trackingNumber: { type: 'string', example: 'JT123456789' },
      },
    },
  })
  @ApiOperation({ summary: 'Hand order over to courier, input tracking number, and consume reserved stock' })
  async ship(
    @Param('id') id: string,
    @Body('trackingNumber') trackingNumber: string,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    if (sellerId) {
      throw new ForbiddenException('Tenant Isolation: Seller users are not authorized to execute shipping logs');
    }
    return this.outboundService.ship(id, trackingNumber, currentUserId);
  }

  @Post(':id/complete')
  @RequirePermissions('outbound.update')
  @ApiOperation({ summary: 'Complete order lifecycle (Mark as delivered)' })
  async complete(@Param('id') id: string, @CurrentUser('id') currentUserId: string, @CurrentUser('sellerId') sellerId?: string) {
    // Verify ownership
    await this.outboundService.findOne(id, sellerId);
    return this.outboundService.complete(id, currentUserId);
  }

  @Post(':id/cancel')
  @RequirePermissions('outbound.cancel')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['reason'],
      properties: {
        reason: { type: 'string', example: 'Customer cancelled the order' },
      },
    },
  })
  @ApiOperation({ summary: 'Cancel outbound order and automatically release reserved stock back to available pool' })
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    if (!reason) {
      throw new BadRequestException('Cancellation reason is required');
    }
    // Verify ownership
    await this.outboundService.findOne(id, sellerId);
    return this.outboundService.cancel(id, reason, currentUserId);
  }
}
