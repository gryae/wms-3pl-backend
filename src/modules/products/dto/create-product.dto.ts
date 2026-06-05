import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ example: 'clh8123abc456def789' })
  @IsNotEmpty()
  @IsString()
  sellerId: string;

  @ApiProperty({ example: 'SHIRT-BLACK-M' })
  @IsNotEmpty()
  @IsString()
  sku: string;

  @ApiPropertyOptional({ example: '8991234567890' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: 'Premium Cotton T-Shirt Black M' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Comfortable t-shirt for daily wear' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 45000, description: 'Cost price (HPP)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  hpp: number;

  @ApiPropertyOptional({ example: 25.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @ApiPropertyOptional({ example: 15.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @ApiPropertyOptional({ example: 2.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiPropertyOptional({ example: 0.2, description: 'Weight in kg' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 'pcs' })
  @IsOptional()
  @IsString()
  unit?: string = 'pcs';

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
