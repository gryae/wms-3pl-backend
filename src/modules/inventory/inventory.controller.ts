import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { InventoryAdjustmentDto } from './dto/inventory-adjustment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Inventory')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('balances')
  @RequirePermissions('inventory.view')
  @ApiOperation({ summary: 'Get current inventory balances' })
  getBalances(@Query() paginationDto: PaginationDto, @CurrentUser('sellerId') sellerId?: string) {
    return this.inventoryService.getBalances(paginationDto, sellerId);
  }

  @Get('movements')
  @RequirePermissions('inventory.view')
  @ApiOperation({ summary: 'Get audit log of inventory ledger movements' })
  getMovements(@Query() paginationDto: PaginationDto, @CurrentUser('sellerId') sellerId?: string) {
    return this.inventoryService.getMovements(paginationDto, sellerId);
  }

  @Post('adjust')
  @RequirePermissions('inventory.adjust')
  @ApiOperation({ summary: 'Manually adjust stock level for a product (WMS Admin/Supervisor)' })
  async adjustStock(
    @Body() dto: InventoryAdjustmentDto,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('sellerId') tokenSellerId?: string,
  ) {
    // If user is a seller, block manual adjustment
    if (tokenSellerId) {
      throw new ForbiddenException('Tenant Isolation: Seller users are not authorized to make manual adjustments');
    }

    // Retrieve product to verify seller
    const product = await this.inventoryService.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.inventoryService.adjustStock({
      sellerId: product.sellerId,
      productId: dto.productId,
      adjustedBy: currentUserId,
      status: dto.status,
      quantity: dto.quantity,
      reason: dto.reason,
      notes: dto.notes,
    });
  }
}

