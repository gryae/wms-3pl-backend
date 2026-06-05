import { IsNotEmpty, IsString, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPickItemDto {
  @ApiProperty({ example: 'clh8123abc456def789' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  pickedQty: number;
}

export class ConfirmPickDto {
  @ApiProperty({ type: [ConfirmPickItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmPickItemDto)
  items: ConfirmPickItemDto[];
}
