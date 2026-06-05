import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @RequirePermissions('dashboard.view')
  @ApiOperation({ summary: 'Get Dashboard summary stats matching current user role' })
  async getDashboard(
    @CurrentUser('id') userId: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    if (sellerId) {
      return this.dashboardService.getSellerDashboard(sellerId);
    }
    return this.dashboardService.getWarehouseDashboard();
  }
}
