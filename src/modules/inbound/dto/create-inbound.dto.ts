import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InboundType } from '@prisma/client';

export class InboundItemDto {
  @ApiProperty({ example: 'clh8123abc456def789' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ example: 50 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  expectedQty: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateInboundDto {
  @ApiProperty({ example: 'clh8123abc456def789', description: 'Seller Owner ID' })
  @IsNotEmpty()
  @IsString()
  sellerId: string;

  @ApiProperty({ enum: InboundType, default: InboundType.NEW })
  @IsOptional()
  @IsEnum(InboundType)
  type?: InboundType = InboundType.NEW;

  @ApiPropertyOptional({ example: 'PO-99128' })
  @IsOptional()
  @IsString()
  referenceNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [InboundItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InboundItemDto)
  items: InboundItemDto[];
}
