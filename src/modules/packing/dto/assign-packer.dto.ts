import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPackerDto {
  @ApiProperty({ example: 'clh8123abc456def789', description: 'Packer User ID' })
  @IsNotEmpty()
  @IsString()
  packerId: string;
}
