import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateManifestDto {
  @ApiProperty({ example: 'clh8123abc456def789', description: 'Courier ID' })
  @IsNotEmpty()
  @IsString()
  courierId: string;

  @ApiPropertyOptional({ example: 'Manifest for SiCepat orders ready for pickup' })
  @IsOptional()
  @IsString()
  notes?: string;
}
