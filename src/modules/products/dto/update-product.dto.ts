import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: '8991234567891' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ example: 'Premium Cotton T-Shirt Black M (Updated)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 48000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hpp?: number;

  @ApiPropertyOptional({ example: 25.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @ApiPropertyOptional({ example: 15.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @ApiPropertyOptional({ example: 2.2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiPropertyOptional({ example: 0.22 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 'pcs' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
