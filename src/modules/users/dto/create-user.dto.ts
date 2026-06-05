import { IsEmail, IsNotEmpty, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'staff@demo.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StaffPassword@123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Demo Seller Staff' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '081234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.SELLER })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiPropertyOptional({ example: 'clh8123abc456def789' })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiPropertyOptional({ enum: UserStatus, default: UserStatus.ACTIVE })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
