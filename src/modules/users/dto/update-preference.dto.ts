import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Language } from '@prisma/client';

export class UpdatePreferenceDto {
  @ApiPropertyOptional({ enum: Language, default: Language.EN })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional({ default: 'light' })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional({ default: 'Asia/Jakarta' })
  @IsOptional()
  @IsString()
  timezone?: string;
}
