import { IsNotEmpty, IsString, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReceiveInboundItemDto {
  @ApiProperty({ example: 'clh8123abc456def789' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ example: 48 })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  receivedQty: number;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  rejectQty: number;
}

export class ReceiveInboundDto {
  @ApiProperty({ type: [ReceiveInboundItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveInboundItemDto)
  items: ReceiveInboundItemDto[];
}
