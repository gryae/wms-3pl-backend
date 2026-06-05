import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOpnameDto {
  @ApiProperty({ example: 'clh8123abc456def789', description: 'Seller ID to count' })
  @IsNotEmpty()
  @IsString()
  sellerId: string;

  @ApiPropertyOptional({ example: 'Year-end physical count session' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [String], example: ['clh8123abc456def789'], description: 'Product IDs to include in the count session' })
  @IsNotEmpty()
  @IsArray()
  productIds: string[];
}
