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
import { StockOpnameService } from './stock-opname.service';
import { CreateOpnameDto } from './dto/create-opname.dto';
import { RecordCountDto } from './dto/record-count.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Stock Opname')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('stock-opnames')
export class StockOpnameController {
  constructor(private readonly opnameService: StockOpnameService) {}

  @Post()
  @RequirePermissions('opname.manage')
  @ApiOperation({ summary: 'Create a new stock count session (WMS Admin/Supervisor)' })
  create(
    @Body() dto: CreateOpnameDto,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    if (sellerId) {
      throw new ForbiddenException('Tenant Isolation: Seller users are not authorized to schedule stock count sessions');
    }
    return this.opnameService.create(dto, currentUserId);
  }

  @Get()
  @RequirePermissions('opname.view')
  @ApiOperation({ summary: 'Get list of stock count sessions' })
  findAll(@Query() paginationDto: PaginationDto, @CurrentUser('sellerId') sellerId?: string) {
    return this.opnameService.findAll(paginationDto, sellerId);
  }

  @Get(':id')
  @RequirePermissions('opname.view')
  @ApiOperation({ summary: 'Get details of a stock opname count session' })
  findOne(@Param('id') id: string, @CurrentUser('sellerId') sellerId?: string) {
    return this.opnameService.findOne(id, sellerId);
  }

  @Post(':id/start')
  @RequirePermissions('opname.manage')
  @ApiOperation({ summary: 'Transition count session to COUNTING status' })
  startCounting(@Param('id') id: string, @CurrentUser('id') currentUserId: string) {
    return this.opnameService.startCounting(id, currentUserId);
  }

  @Post(':id/count')
  @RequirePermissions('opname.manage')
  @ApiOperation({ summary: 'Record physically checked quantities' })
  recordCount(
    @Param('id') id: string,
    @Body() dto: RecordCountDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.opnameService.recordCount(id, dto, currentUserId);
  }

  @Post(':id/complete')
  @RequirePermissions('opname.manage')
  @ApiOperation({ summary: 'Close counting session and execute automatic inventory adjustments based on variances' })
  complete(@Param('id') id: string, @CurrentUser('id') currentUserId: string) {
    return this.opnameService.complete(id, currentUserId);
  }

  @Post(':id/cancel')
  @RequirePermissions('opname.manage')
  @ApiOperation({ summary: 'Cancel stock count session' })
  cancel(@Param('id') id: string, @CurrentUser('id') currentUserId: string) {
    return this.opnameService.cancel(id, currentUserId);
  }
}
