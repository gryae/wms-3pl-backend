import { IsNotEmpty, IsString, IsArray, ValidateNested, IsInt, Min, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmPackItemDto {
  @ApiProperty({ example: 'clh8123abc456def789' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  packedQty: number;
}

export class ConfirmPackDto {
  @ApiProperty({ example: 1, description: 'Number of boxes used' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  boxCount: number;

  @ApiProperty({ example: 0.45, description: 'Total physical weight in kg' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  weight: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [ConfirmPackItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmPackItemDto)
  items: ConfirmPackItemDto[];
}
