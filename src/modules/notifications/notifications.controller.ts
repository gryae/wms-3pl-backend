import { Controller, Get, Post, Param, Query, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermissions('notifications.view')
  @ApiOperation({ summary: 'Get current user notifications history' })
  findAll(@Query() paginationDto: PaginationDto, @CurrentUser('id') userId: string) {
    return this.notificationsService.findAll(paginationDto, userId);
  }

  @Get('unread-count')
  @RequirePermissions('notifications.view')
  @ApiOperation({ summary: 'Get current user unread notification counts' })
  getUnreadCount(@CurrentUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Post(':id/read')
  @RequirePermissions('notifications.view')
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  markAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Post('read-all')
  @RequirePermissions('notifications.view')
  @ApiOperation({ summary: 'Mark all user notifications as read' })
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  @RequirePermissions('notifications.view')
  @ApiOperation({ summary: 'Delete a notification entry' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.remove(id, userId);
  }
}
