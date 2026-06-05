import { IsNotEmpty, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddShipmentsDto {
  @ApiProperty({ type: [String], example: ['clh8123abc456def789'] })
  @IsNotEmpty()
  @IsArray()
  outboundIds: string[];
}
