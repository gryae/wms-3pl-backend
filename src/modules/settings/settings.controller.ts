import { Controller, Get, Put, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Settings')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @RequirePermissions('settings.view')
  @ApiOperation({ summary: 'Get list of WMS system configuration variables (WMS Admin/Supervisor only)' })
  findAll(@CurrentUser('sellerId') sellerId?: string) {
    if (sellerId) {
      throw new ForbiddenException('Tenant Isolation: Seller users do not have access to WMS parameters');
    }
    return this.settingsService.findAll();
  }

  @Put()
  @RequirePermissions('settings.manage')
  @ApiOperation({ summary: 'Update multiple configuration settings variables (WMS Admin only)' })
  update(
    @Body() dto: UpdateSettingsDto,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    if (sellerId) {
      throw new ForbiddenException('Tenant Isolation: Seller users do not have access to WMS parameters');
    }
    return this.settingsService.updateMany(dto, currentUserId);
  }
}
