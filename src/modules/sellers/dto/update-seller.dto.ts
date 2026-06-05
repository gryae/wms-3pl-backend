import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SellerStatus } from '@prisma/client';

export class UpdateSellerDto {
  @ApiPropertyOptional({ example: 'Grand Fashion Store Updated' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Jl. Mawar No. 15, Bandung' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '08111222334' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'support@grandfashion.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: SellerStatus })
  @IsOptional()
  @IsEnum(SellerStatus)
  status?: SellerStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;
}
