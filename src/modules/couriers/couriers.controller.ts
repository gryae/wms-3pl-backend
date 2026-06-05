import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouriersService } from './couriers.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { UpdateCourierDto } from './dto/update-courier.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Couriers')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('couriers')
export class CouriersController {
  constructor(private readonly couriersService: CouriersService) {}

  @Post()
  @RequirePermissions('couriers.manage')
  @ApiOperation({ summary: 'Register a new courier service (WMS Admin/Supervisor)' })
  create(@Body() createCourierDto: CreateCourierDto, @CurrentUser('id') currentUserId: string) {
    return this.couriersService.create(createCourierDto, currentUserId);
  }

  @Get()
  @RequirePermissions('couriers.view')
  @ApiOperation({ summary: 'Get list of couriers' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.couriersService.findAll(paginationDto);
  }

  @Get(':id')
  @RequirePermissions('couriers.view')
  @ApiOperation({ summary: 'Get courier details' })
  findOne(@Param('id') id: string) {
    return this.couriersService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions('couriers.manage')
  @ApiOperation({ summary: 'Update courier details' })
  update(
    @Param('id') id: string,
    @Body() updateCourierDto: UpdateCourierDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.couriersService.update(id, updateCourierDto, currentUserId);
  }

  @Delete(':id')
  @RequirePermissions('couriers.manage')
  @ApiOperation({ summary: 'Deactivate / Soft-delete a courier service' })
  remove(@Param('id') id: string, @CurrentUser('id') currentUserId: string) {
    return this.couriersService.remove(id, currentUserId);
  }
}
