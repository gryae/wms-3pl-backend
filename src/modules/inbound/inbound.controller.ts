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
import { InboundService } from './inbound.service';
import { CreateInboundDto } from './dto/create-inbound.dto';
import { ReceiveInboundDto } from './dto/receive-inbound.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Inbound')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('inbounds')
export class InboundController {
  constructor(private readonly inboundService: InboundService) {}

  @Post()
  @RequirePermissions('inbound.create')
  @ApiOperation({ summary: 'Create a new Inbound shipment (DRAFT status)' })
  create(
    @Body() dto: CreateInboundDto,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('sellerId') tokenSellerId?: string,
  ) {
    if (tokenSellerId && tokenSellerId !== dto.sellerId) {
      throw new ForbiddenException('Tenant Isolation: You cannot create inbound shipments for another seller');
    }
    return this.inboundService.create(dto, currentUserId);
  }

  @Get()
  @RequirePermissions('inbound.view')
  @ApiOperation({ summary: 'Get list of inbound shipments' })
  findAll(@Query() paginationDto: PaginationDto, @CurrentUser('sellerId') sellerId?: string) {
    return this.inboundService.findAll(paginationDto, sellerId);
  }

  @Get(':id')
  @RequirePermissions('inbound.view')
  @ApiOperation({ summary: 'Get details and history timeline of an inbound shipment' })
  findOne(@Param('id') id: string, @CurrentUser('sellerId') sellerId?: string) {
    return this.inboundService.findOne(id, sellerId);
  }

  @Post(':id/submit')
  @RequirePermissions('inbound.create')
  @ApiOperation({ summary: 'Submit inbound shipment draft to warehouse' })
  async submit(@Param('id') id: string, @CurrentUser('id') currentUserId: string, @CurrentUser('sellerId') sellerId?: string) {
    // Verify ownership
    await this.inboundService.findOne(id, sellerId);
    return this.inboundService.submit(id, currentUserId);
  }

  @Post(':id/start')
  @RequirePermissions('inbound.receive')
  @ApiOperation({ summary: 'Start physical verification in warehouse (Supervisor only)' })
  async startReceiving(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    if (sellerId) {
      throw new ForbiddenException('Tenant Isolation: Seller users are not authorized to start physical receipts');
    }
    return this.inboundService.startReceiving(id, currentUserId);
  }

  @Post(':id/receive')
  @RequirePermissions('inbound.receive')
  @ApiOperation({ summary: 'Log checked physical quantities (Received vs Reject)' })
  async receive(
    @Param('id') id: string,
    @Body() dto: ReceiveInboundDto,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    if (sellerId) {
      throw new ForbiddenException('Tenant Isolation: Seller users are not authorized to write physical quantities');
    }
    return this.inboundService.receive(id, dto, currentUserId);
  }

  @Post(':id/complete')
  @RequirePermissions('inbound.receive')
  @ApiOperation({ summary: 'Finalize receiving, post stock entries, and notify seller' })
  async complete(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    if (sellerId) {
      throw new ForbiddenException('Tenant Isolation: Seller users are not authorized to complete inbound receipts');
    }
    return this.inboundService.complete(id, currentUserId);
  }

  @Post(':id/cancel')
  @RequirePermissions('inbound.cancel')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['reason'],
      properties: {
        reason: { type: 'string', example: 'Shipment delayed indefinitely' },
      },
    },
  })
  @ApiOperation({ summary: 'Cancel inbound shipment' })
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
    await this.inboundService.findOne(id, sellerId);
    return this.inboundService.cancel(id, reason, currentUserId);
  }
}

