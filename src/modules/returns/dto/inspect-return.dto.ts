import { IsNotEmpty, IsString, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InspectReturnItemDto {
  @ApiProperty({ example: 'clh8123abc456def789' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ example: 1, description: 'Good items restock to available' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  goodQty: number;

  @ApiProperty({ example: 1, description: 'Damaged items restock to damaged' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  damagedQty: number;

  @ApiProperty({ example: 0, description: 'Reject items restock to reject' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  rejectQty: number;
}

export class InspectReturnDto {
  @ApiProperty({ type: [InspectReturnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InspectReturnItemDto)
  items: InspectReturnItemDto[];
}
