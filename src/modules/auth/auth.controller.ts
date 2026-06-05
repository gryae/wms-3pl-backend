import { Controller, Post, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user and get tokens' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(loginDto, ip, userAgent);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user and revoke access token session' })
  logout(@CurrentUser('id') userId: string, @Req() req: Request) {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : '';
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.authService.logout(userId, token, ip, userAgent);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  refresh(@Body() refreshTokenDto: RefreshTokenDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.authService.refresh(refreshTokenDto, ip, userAgent);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email link' })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using security token' })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password from settings' })
  changePassword(@CurrentUser('id') userId: string, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(userId, changePasswordDto);
  }
}
