import { Controller, Get, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Audit Logs')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @RequirePermissions('audit.view')
  @ApiOperation({ summary: 'Get list of system audit logs (WMS Admin/Supervisor only)' })
  findAll(@Query() paginationDto: PaginationDto, @CurrentUser('sellerId') sellerId?: string) {
    if (sellerId) {
      throw new ForbiddenException('Tenant Isolation: Seller users do not have access to view audit trails');
    }
    return this.auditLogsService.findAll(paginationDto);
  }

  @Get(':id')
  @RequirePermissions('audit.view')
  @ApiOperation({ summary: 'Get full detail of a specific audit log including before/after delta payloads' })
  findOne(@Param('id') id: string, @CurrentUser('sellerId') sellerId?: string) {
    if (sellerId) {
      throw new ForbiddenException('Tenant Isolation: Seller users do not have access to view audit logs');
    }
    return this.auditLogsService.findOne(id);
  }
}
