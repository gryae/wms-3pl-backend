import { IsNotEmpty, IsString, IsArray, ValidateNested, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordCountItemDto {
  @ApiProperty({ example: 'clh8123abc456def789' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ example: 45 })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  physicalQty: number;

  @ApiPropertyOptional({ example: 'Lost / misplaced under rack' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RecordCountDto {
  @ApiProperty({ type: [RecordCountItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecordCountItemDto)
  items: RecordCountItemDto[];
}
