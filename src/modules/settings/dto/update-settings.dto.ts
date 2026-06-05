import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SettingItemDto {
  @ApiProperty({ example: 'warehouse.name' })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({ example: 'Grand WMS Warehouse' })
  @IsNotEmpty()
  @IsString()
  value: string;
}

export class UpdateSettingsDto {
  @ApiProperty({ type: [SettingItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettingItemDto)
  settings: SettingItemDto[];
}
