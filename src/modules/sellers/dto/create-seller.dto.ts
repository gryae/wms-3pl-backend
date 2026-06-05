import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SellerStatus } from '@prisma/client';

export class CreateSellerDto {
  @ApiProperty({ example: 'SEL001' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 'Grand Fashion Store' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Jl. Melati No. 12, Jakarta' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '08111222333' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'contact@grandfashion.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: SellerStatus, default: SellerStatus.ACTIVE })
  @IsOptional()
  @IsEnum(SellerStatus)
  status?: SellerStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;
}
