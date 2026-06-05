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
import { PackingService } from './packing.service';
import { AssignPackerDto } from './dto/assign-packer.dto';
import { ConfirmPackDto } from './dto/confirm-pack.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Packing')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('packing')
export class PackingController {
  constructor(private readonly packingService: PackingService) {}

  @Get()
  @RequirePermissions('packing.view')
  @ApiOperation({ summary: 'Get list of packing tasks' })
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.packingService.findAll(paginationDto);
  }

  @Get(':id')
  @RequirePermissions('packing.view')
  @ApiOperation({ summary: 'Get details of a packing task' })
  findOne(@Param('id') id: string, @CurrentUser('sellerId') sellerId?: string) {
    return this.packingService.findOne(id, sellerId);
  }

  @Post(':id/assign')
  @RequirePermissions('packing.manage')
  @ApiOperation({ summary: 'Assign a warehouse admin to a packing task' })
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignPackerDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.packingService.assign(id, dto, currentUserId);
  }

  @Post(':id/start')
  @RequirePermissions('packing.manage')
  @ApiOperation({ summary: 'Packer logs start of packaging process' })
  start(@Param('id') id: string, @CurrentUser('id') currentUserId: string) {
    return this.packingService.start(id, currentUserId);
  }

  @Post(':id/confirm')
  @RequirePermissions('packing.manage')
  @ApiOperation({ summary: 'Packer logs box details, weight and completes packaging' })
  confirm(
    @Param('id') id: string,
    @Body() dto: ConfirmPackDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.packingService.confirm(id, dto, currentUserId);
  }
}

