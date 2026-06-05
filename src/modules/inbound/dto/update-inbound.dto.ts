import { IsOptional, IsString, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InboundType } from '@prisma/client';
import { InboundItemDto } from './create-inbound.dto';

export class UpdateInboundDto {
  @ApiPropertyOptional({ enum: InboundType })
  @IsOptional()
  @IsEnum(InboundType)
  type?: InboundType;

  @ApiPropertyOptional({ example: 'PO-99128-REV' })
  @IsOptional()
  @IsString()
  referenceNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [InboundItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InboundItemDto)
  items?: InboundItemDto[];
}
