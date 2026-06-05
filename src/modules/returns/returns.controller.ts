import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { InspectReturnDto } from './dto/inspect-return.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Returns')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @RequirePermissions('returns.create')
  @ApiOperation({ summary: 'File a new Customer Return document (SUBMITTED status)' })
  create(
    @Body() dto: CreateReturnDto,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('sellerId') tokenSellerId?: string,
  ) {
    if (tokenSellerId && tokenSellerId !== dto.sellerId) {
      throw new ForbiddenException('Tenant Isolation: You cannot file returns for other sellers');
    }
    return this.returnsService.create(dto, currentUserId);
  }

  @Get()
  @RequirePermissions('returns.view')
  @ApiOperation({ summary: 'Get list of returns' })
  findAll(@Query() paginationDto: PaginationDto, @CurrentUser('sellerId') sellerId?: string) {
    return this.returnsService.findAll(paginationDto, sellerId);
  }

  @Get(':id')
  @RequirePermissions('returns.view')
  @ApiOperation({ summary: 'Get details and timeline of a customer return shipment' })
  findOne(@Param('id') id: string, @CurrentUser('sellerId') sellerId?: string) {
    return this.returnsService.findOne(id, sellerId);
  }

  @Post(':id/start')
  @RequirePermissions('returns.inspect')
  @ApiOperation({ summary: 'Start QC quality checks (Supervisor only)' })
  async startInspecting(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    if (sellerId) {
      throw new ForbiddenException('Tenant Isolation: Seller users are not authorized to write QC logs');
    }
    return this.returnsService.startInspecting(id, currentUserId);
  }

  @Post(':id/inspect')
  @RequirePermissions('returns.inspect')
  @ApiOperation({ summary: 'Log checked physical conditions (Good, Damaged, Reject) and post restock movements' })
  async inspect(
    @Param('id') id: string,
    @Body() dto: InspectReturnDto,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    if (sellerId) {
      throw new ForbiddenException('Tenant Isolation: Seller users are not authorized to complete physical returns');
    }
    return this.returnsService.inspectAndComplete(id, dto, currentUserId);
  }
}
