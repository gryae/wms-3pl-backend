import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Response } from 'express';

@ApiTags('Reports')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('inventory')
  @RequirePermissions('reports.view')
  @ApiOperation({ summary: 'Get Inventory Balance Summary list' })
  getInventory(@Query() paginationDto: PaginationDto, @CurrentUser('sellerId') sellerId?: string) {
    return this.reportsService.getInventoryReport(paginationDto, sellerId);
  }

  @Get('export/inventory')
  @RequirePermissions('reports.export')
  @ApiOperation({ summary: 'Export Inventory Balance Summary to Excel' })
  async exportInventory(@Res() res: Response, @CurrentUser('sellerId') sellerId?: string) {
    const buffer = await this.reportsService.exportInventoryExcel(sellerId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=report_inventory.xlsx');
    res.send(buffer);
  }

  @Get('inbound')
  @RequirePermissions('reports.view')
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiOperation({ summary: 'Get Inbounds Receipts Summary' })
  getInbounds(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    return this.reportsService.getInboundReport(startDate, endDate, sellerId);
  }

  @Get('export/inbound')
  @RequirePermissions('reports.export')
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiOperation({ summary: 'Export Inbounds Receipts to Excel' })
  async exportInbound(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    const buffer = await this.reportsService.exportInboundExcel(startDate, endDate, sellerId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=report_inbound.xlsx');
    res.send(buffer);
  }

  @Get('outbound')
  @RequirePermissions('reports.view')
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiOperation({ summary: 'Get Outbounds Orders Summary' })
  getOutbounds(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    return this.reportsService.getOutboundReport(startDate, endDate, sellerId);
  }

  @Get('export/outbound')
  @RequirePermissions('reports.export')
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiOperation({ summary: 'Export Outbounds Orders to Excel' })
  async exportOutbound(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    const buffer = await this.reportsService.exportOutboundExcel(startDate, endDate, sellerId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=report_outbound.xlsx');
    res.send(buffer);
  }

  @Get('returns')
  @RequirePermissions('reports.view')
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiOperation({ summary: 'Get Returns Audit Summary' })
  getReturns(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    return this.reportsService.getReturnReport(startDate, endDate, sellerId);
  }

  @Get('export/returns')
  @RequirePermissions('reports.export')
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiOperation({ summary: 'Export Returns to Excel' })
  async exportReturn(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    const buffer = await this.reportsService.exportReturnExcel(startDate, endDate, sellerId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=report_returns.xlsx');
    res.send(buffer);
  }

  @Get('manifests')
  @RequirePermissions('reports.view')
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiOperation({ summary: 'Get Courier Manifests Handover list' })
  getManifests(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    if (sellerId) {
      throw new ForbiddenException('Tenant Isolation: Seller users do not have access to Manifest reports');
    }
    return this.reportsService.getManifestReport(startDate, endDate);
  }

  @Get('export/manifests')
  @RequirePermissions('reports.export')
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiOperation({ summary: 'Export Courier Handover Manifests to Excel' })
  async exportManifest(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    if (sellerId) {
      throw new ForbiddenException('Tenant Isolation: Seller users do not have access to Manifest reports');
    }
    const buffer = await this.reportsService.exportManifestExcel(startDate, endDate);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=report_manifests.xlsx');
    res.send(buffer);
  }

  @Get('movements')
  @RequirePermissions('reports.view')
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiOperation({ summary: 'Get Stock Movements Ledger log' })
  getMovements(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    return this.reportsService.getStockMovementReport(startDate, endDate, sellerId);
  }

  @Get('export/movements')
  @RequirePermissions('reports.export')
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiOperation({ summary: 'Export Stock Movements Ledger to Excel' })
  async exportMovement(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    const buffer = await this.reportsService.exportMovementExcel(startDate, endDate, sellerId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=report_movements.xlsx');
    res.send(buffer);
  }

  @Get('opnames')
  @RequirePermissions('reports.view')
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiOperation({ summary: 'Get Stock Opnames history' })
  getOpnames(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    return this.reportsService.getStockOpnameReport(startDate, endDate, sellerId);
  }

  @Get('export/opnames')
  @RequirePermissions('reports.export')
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiOperation({ summary: 'Export Stock Opname sessions to Excel' })
  async exportOpnames(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    const buffer = await this.reportsService.exportOpnameExcel(startDate, endDate, sellerId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=report_opname.xlsx');
    res.send(buffer);
  }
}
