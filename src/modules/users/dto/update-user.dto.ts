import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'staff_new@demo.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'NewSecret@123' })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: 'Demo Seller Staff Updated' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '081234567891' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: 'clh8123abc456def789' })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
