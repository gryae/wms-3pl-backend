import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray, ValidateNested, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OutboundType } from '@prisma/client';

export class OutboundItemDto {
  @ApiProperty({ example: 'clh8123abc456def789' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOutboundDto {
  @ApiProperty({ example: 'clh8123abc456def789' })
  @IsNotEmpty()
  @IsString()
  sellerId: string;

  @ApiProperty({ enum: OutboundType, default: OutboundType.MANUAL })
  @IsOptional()
  @IsEnum(OutboundType)
  type?: OutboundType = OutboundType.MANUAL;

  @ApiProperty({ example: 'Rini Andriyani' })
  @IsNotEmpty()
  @IsString()
  recipientName: string;

  @ApiProperty({ example: '085299887766' })
  @IsNotEmpty()
  @IsString()
  recipientPhone: string;

  @ApiProperty({ example: 'Jl. Merdeka No. 45, RT 02/05, Kel. Gambir' })
  @IsNotEmpty()
  @IsString()
  recipientAddress: string;

  @ApiPropertyOptional({ example: 'Jakarta Pusat' })
  @IsOptional()
  @IsString()
  recipientCity?: string;

  @ApiPropertyOptional({ example: 'DKI Jakarta' })
  @IsOptional()
  @IsString()
  recipientProvince?: string;

  @ApiPropertyOptional({ example: '10110' })
  @IsOptional()
  @IsString()
  recipientPostcode?: string;

  @ApiPropertyOptional({ example: 'clh8123abc456def789', description: 'Courier ID' })
  @IsOptional()
  @IsString()
  courierId?: string;

  @ApiPropertyOptional({ example: '0.00' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingCost?: number;

  @ApiPropertyOptional({ example: '0.00' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  codAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'AWB/tracking number provided by seller (optional, warehouse fills on ship if empty)' })
  @IsOptional()
  @IsString()
  sellerAwbNo?: string;

  @ApiProperty({ type: [OutboundItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OutboundItemDto)
  items: OutboundItemDto[];
}
