import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ManifestsService } from './manifests.service';
import { CreateManifestDto } from './dto/create-manifest.dto';
import { AddShipmentsDto } from './dto/add-shipments.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Response } from 'express';

@ApiTags('Manifests')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('manifests')
export class ManifestsController {
  constructor(private readonly manifestsService: ManifestsService) {}

  @Post()
  @RequirePermissions('manifests.manage')
  @ApiOperation({ summary: 'Open a new manifest session for a courier brand' })
  create(@Body() dto: CreateManifestDto, @CurrentUser('id') currentUserId: string, @CurrentUser('sellerId') sellerId?: string) {
    if (sellerId) {
      throw new ForbiddenException('Tenant Isolation: Seller users are not authorized to build manifests');
    }
    return this.manifestsService.create(dto, currentUserId);
  }

  @Get()
  @RequirePermissions('manifests.view')
  @ApiOperation({ summary: 'Get list of manifests' })
  findAll(@Query() paginationDto: PaginationDto, @CurrentUser('sellerId') sellerId?: string) {
    if (sellerId) {
      throw new ForbiddenException('Tenant Isolation: Seller users are not authorized to view manifests list');
    }
    return this.manifestsService.findAll(paginationDto);
  }

  @Get(':id')
  @RequirePermissions('manifests.view')
  @ApiOperation({ summary: 'Get details of a manifest and its assigned shipments' })
  findOne(@Param('id') id: string, @CurrentUser('sellerId') sellerId?: string) {
    if (sellerId) {
      throw new ForbiddenException('Tenant Isolation: Seller users are not authorized to view manifest sheets');
    }
    return this.manifestsService.findOne(id);
  }

  @Post(':id/add')
  @RequirePermissions('manifests.manage')
  @ApiOperation({ summary: 'Assign ready outbound orders to an open manifest sheet' })
  addShipments(
    @Param('id') id: string,
    @Body() dto: AddShipmentsDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.manifestsService.addShipments(id, dto, currentUserId);
  }

  @Post(':id/close')
  @RequirePermissions('manifests.manage')
  @ApiOperation({ summary: 'Close and finalize manifest handover to carrier driver' })
  closeManifest(@Param('id') id: string, @CurrentUser('id') currentUserId: string) {
    return this.manifestsService.closeManifest(id, currentUserId);
  }

  @Get(':id/pdf')
  @RequirePermissions('manifests.view')
  @ApiOperation({ summary: 'Generate and download standard courier dispatch manifest PDF sheet' })
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.manifestsService.generateManifestPdf(id);
    const manifest = await this.manifestsService.findOne(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=manifest_${manifest.manifestNo}.pdf`);
    res.send(buffer);
  }
}
