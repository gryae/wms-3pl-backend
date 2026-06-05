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
import { PickingService } from './picking.service';
import { AssignPickerDto } from './dto/assign-picker.dto';
import { ConfirmPickDto } from './dto/confirm-pick.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Picking')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('picking')
export class PickingController {
  constructor(private readonly pickingService: PickingService) {}

  @Get()
  @RequirePermissions('picking.view')
  @ApiOperation({ summary: 'Get list of picking tasks' })
  findAll(
    @Query() paginationDto: PaginationDto,
  ) {
    return this.pickingService.findAll(paginationDto);
  }

  @Get(':id')
  @RequirePermissions('picking.view')
  @ApiOperation({ summary: 'Get details of a picking task with layout locations' })
  findOne(@Param('id') id: string, @CurrentUser('sellerId') sellerId?: string) {
    return this.pickingService.findOne(id, sellerId);
  }

  @Post(':id/assign')
  @RequirePermissions('picking.manage')
  @ApiOperation({ summary: 'Assign a warehouse admin to a picking task' })
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignPickerDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.pickingService.assign(id, dto, currentUserId);
  }

  @Post(':id/start')
  @RequirePermissions('picking.manage')
  @ApiOperation({ summary: 'Picker logs picking start time' })
  start(@Param('id') id: string, @CurrentUser('id') currentUserId: string) {
    return this.pickingService.start(id, currentUserId);
  }

  @Post(':id/confirm')
  @RequirePermissions('picking.manage')
  @ApiOperation({ summary: 'Picker logs picked quantities and completes picking' })
  confirm(
    @Param('id') id: string,
    @Body() dto: ConfirmPickDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.pickingService.confirm(id, dto, currentUserId);
  }
}
