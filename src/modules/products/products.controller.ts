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
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@ApiTags('Products')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @RequirePermissions('products.create')
  @ApiOperation({ summary: 'Create a new product SKU' })
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    // Tenant Isolation
    if (sellerId && sellerId !== createProductDto.sellerId) {
      throw new ForbiddenException('Tenant Isolation: You cannot create products for other sellers');
    }
    return this.productsService.create(createProductDto, currentUserId);
  }

  @Get()
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Get list of products' })
  findAll(@Query() paginationDto: PaginationDto, @CurrentUser('sellerId') sellerId?: string) {
    return this.productsService.findAll(paginationDto, sellerId);
  }

  @Get('export')
  @RequirePermissions('products.export')
  @ApiOperation({ summary: 'Export products catalog to Excel' })
  async exportExcel(@Res() res: Response, @CurrentUser('sellerId') sellerId?: string) {
    const buffer = await this.productsService.exportExcel(sellerId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
    res.send(buffer);
  }

  @Post('import')
  @RequirePermissions('products.import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        sellerId: { type: 'string', description: 'Seller ID to import products into (required for WMS admins)' },
      },
    },
  })
  @ApiOperation({ summary: 'Import products from Excel sheet' })
  importExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body('sellerId') bodySellerId: string,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('sellerId') tokenSellerId?: string,
  ) {
    const activeSellerId = tokenSellerId || bodySellerId;
    if (!activeSellerId) {
      throw new ForbiddenException('Seller ID is required for import');
    }
    if (tokenSellerId && tokenSellerId !== activeSellerId) {
      throw new ForbiddenException('Tenant Isolation: You cannot import products to other sellers');
    }
    return this.productsService.importExcel(file.buffer, activeSellerId, currentUserId);
  }

  @Get(':id')
  @RequirePermissions('products.view')
  @ApiOperation({ summary: 'Get details of a specific product' })
  findOne(@Param('id') id: string, @CurrentUser('sellerId') sellerId?: string) {
    return this.productsService.findOne(id, sellerId);
  }

  @Put(':id')
  @RequirePermissions('products.update')
  @ApiOperation({ summary: 'Update product properties' })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('sellerId') sellerId?: string,
  ) {
    return this.productsService.update(id, updateProductDto, currentUserId, sellerId);
  }

  @Delete(':id')
  @RequirePermissions('products.delete')
  @ApiOperation({ summary: 'Soft-delete a product SKU' })
  remove(@Param('id') id: string, @CurrentUser('id') currentUserId: string, @CurrentUser('sellerId') sellerId?: string) {
    return this.productsService.remove(id, currentUserId, sellerId);
  }
}
