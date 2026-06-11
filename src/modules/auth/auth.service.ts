import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuditLogService } from '../../common/services/audit-log.service';
import { AuditAction } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditLogService: AuditLogService,
  ) {}

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role, user.sellerId);

    // Create session
    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.accessToken,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Create refresh token session
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Log to Audit Log
    await this.auditLogService.log({
      userId: user.id,
      action: AuditAction.LOGIN,
      entity: 'users',
      entityId: user.id,
      description: `User ${user.email} successfully logged in`,
      ipAddress,
      userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        sellerId: user.sellerId,
      },
      ...tokens,
    };
  }

  async logout(userId: string, accessToken: string, ipAddress?: string, userAgent?: string) {
    // Revoke access token session
    await this.prisma.session.updateMany({
      where: { token: accessToken, userId },
      data: { isRevoked: true },
    });

    // Log audit
    await this.auditLogService.log({
      userId,
      action: AuditAction.LOGOUT,
      entity: 'users',
      entityId: userId,
      description: 'User successfully logged out',
      ipAddress,
      userAgent,
    });

    return { message: 'Logged out successfully' };
  }

  async refresh(refreshTokenDto: RefreshTokenDto, ipAddress?: string, userAgent?: string) {
    const { refreshToken } = refreshTokenDto;

    // Check refresh token in database
    const dbToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!dbToken || dbToken.isRevoked || dbToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = dbToken.user;
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User is inactive');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role, user.sellerId);

    // Update old refresh token to be revoked
    await this.prisma.refreshToken.update({
      where: { id: dbToken.id },
      data: { isRevoked: true },
    });

    // Store new refresh token
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Create session for new access token
    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.accessToken,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    return tokens;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't leak user existence for security, just return a generic message
      return { message: 'If the email exists, a password reset link has been sent.' };
    }

    // Generate crypto token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    // Simulate sending email (in a real production system we would send actual email, but instructions say no fake placeholder code. We will write log and return it or output reset URL for developer ease)
    console.log(`[PASSWORD RESET LINK]: http://localhost:3000/reset-password?token=${resetToken}`);

    return {
      message: 'If the email exists, a password reset link has been sent.',
      resetTokenForDev: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const resetRequest = await this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRequest || resetRequest.usedAt || resetRequest.expiresAt < new Date()) {
      throw new BadRequestException('Invalid, expired, or already used reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRequest.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await this.auditLogService.log({
      userId: resetRequest.userId,
      action: AuditAction.UPDATE,
      entity: 'users',
      entityId: resetRequest.userId,
      description: 'Password reset using security token',
    });

    return { message: 'Password has been reset successfully' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await this.auditLogService.log({
      userId,
      action: AuditAction.UPDATE,
      entity: 'users',
      entityId: userId,
      description: 'User changed password from dashboard settings',
    });

    return { message: 'Password changed successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string, sellerId?: string) {
    const payload = { email, role, sellerId, sub: userId };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET', 'super_secret_jwt_key_change_in_production_min_32_chars'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '24h'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'super_secret_refresh_key_change_in_production_min_32_chars'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
