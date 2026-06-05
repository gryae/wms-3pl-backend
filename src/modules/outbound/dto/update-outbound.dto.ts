import { IsOptional, IsString, IsEnum, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OutboundType } from '@prisma/client';
import { OutboundItemDto } from './create-outbound.dto';

export class UpdateOutboundDto {
  @ApiPropertyOptional({ enum: OutboundType })
  @IsOptional()
  @IsEnum(OutboundType)
  type?: OutboundType;

  @ApiPropertyOptional({ example: 'Rini Andriyani' })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional({ example: '085299887766' })
  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @ApiPropertyOptional({ example: 'Jl. Merdeka No. 45, RT 02/05, Kel. Gambir' })
  @IsOptional()
  @IsString()
  recipientAddress?: string;

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

  @ApiPropertyOptional({ example: 'clh8123abc456def789' })
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

  @ApiPropertyOptional({ type: [OutboundItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OutboundItemDto)
  items?: OutboundItemDto[];
}
