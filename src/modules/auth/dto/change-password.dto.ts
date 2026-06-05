import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword@123' })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ example: 'NewSecret@123' })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
