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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SellersService } from './sellers.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Sellers')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post()
  @RequirePermissions('sellers.create')
  @ApiOperation({ summary: 'Create a new seller (WMS Admin only)' })
  create(@Body() createSellerDto: CreateSellerDto, @CurrentUser('id') currentUserId: string) {
    return this.sellersService.create(createSellerDto, currentUserId);
  }

  @Get()
  @RequirePermissions('sellers.view')
  @ApiOperation({ summary: 'Get list of sellers' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.sellersService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific seller details' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('sellerId') currentUserSellerId?: string,
    @CurrentUser('role') role?: UserRole,
  ) {
    // Strict isolation: Seller users can only view their own seller profile
    if (currentUserSellerId && currentUserSellerId !== id) {
      throw new ForbiddenException('Tenant Isolation: You cannot access other seller profiles');
    }
    return this.sellersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a seller' })
  update(
    @Param('id') id: string,
    @Body() updateSellerDto: UpdateSellerDto,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('sellerId') currentUserSellerId?: string,
  ) {
    // Tenant Isolation
    if (currentUserSellerId && currentUserSellerId !== id) {
      throw new ForbiddenException('Tenant Isolation: You cannot modify other seller profiles');
    }
    return this.sellersService.update(id, updateSellerDto, currentUserId);
  }

  @Delete(':id')
  @RequirePermissions('sellers.delete')
  @ApiOperation({ summary: 'Delete a seller' })
  remove(@Param('id') id: string, @CurrentUser('id') currentUserId: string) {
    return this.sellersService.remove(id, currentUserId);
  }
}
