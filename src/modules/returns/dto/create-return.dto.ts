import { IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReturnItemDto {
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

export class CreateReturnDto {
  @ApiProperty({ example: 'clh8123abc456def789' })
  @IsNotEmpty()
  @IsString()
  sellerId: string;

  @ApiPropertyOptional({ example: 'clh8123abc456def789', description: 'Outbound Order ID if returning customer shipment' })
  @IsOptional()
  @IsString()
  outboundId?: string;

  @ApiProperty({ example: 'Wrong product size shipped' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [ReturnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];
}
