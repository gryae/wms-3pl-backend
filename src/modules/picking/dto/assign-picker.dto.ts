import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPickerDto {
  @ApiProperty({ example: 'clh8123abc456def789', description: 'Picker User ID' })
  @IsNotEmpty()
  @IsString()
  pickerId: string;
}
