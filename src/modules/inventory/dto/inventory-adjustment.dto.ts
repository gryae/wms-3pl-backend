import { IsNotEmpty, IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryStatus } from '@prisma/client';

export class InventoryAdjustmentDto {
  @ApiProperty({ example: 'clh8123abc456def789' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ enum: InventoryStatus, example: InventoryStatus.AVAILABLE })
  @IsNotEmpty()
  @IsEnum(InventoryStatus)
  status: InventoryStatus;

  @ApiProperty({ example: 10, description: 'Adjust quantity. Positive to increment, negative to decrement.' })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 'Damaged item found during stock count' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
