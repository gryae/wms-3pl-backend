"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../common/services/audit-log.service");
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService, auditLogService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.auditLogService = auditLogService;
    }
    async login(loginDto, ipAddress, userAgent) {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Your account is not active');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role, user.sellerId);
        await this.prisma.session.create({
            data: {
                userId: user.id,
                token: tokens.accessToken,
                ipAddress,
                userAgent,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        });
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: tokens.refreshToken,
                ipAddress,
                userAgent,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        await this.auditLogService.log({
            userId: user.id,
            action: client_1.AuditAction.LOGIN,
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
    async logout(userId, accessToken, ipAddress, userAgent) {
        await this.prisma.session.updateMany({
            where: { token: accessToken, userId },
            data: { isRevoked: true },
        });
        await this.auditLogService.log({
            userId,
            action: client_1.AuditAction.LOGOUT,
            entity: 'users',
            entityId: userId,
            description: 'User successfully logged out',
            ipAddress,
            userAgent,
        });
        return { message: 'Logged out successfully' };
    }
    async refresh(refreshTokenDto, ipAddress, userAgent) {
        const { refreshToken } = refreshTokenDto;
        const dbToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!dbToken || dbToken.isRevoked || dbToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const user = dbToken.user;
        if (user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('User is inactive');
        }
        const tokens = await this.generateTokens(user.id, user.email, user.role, user.sellerId);
        await this.prisma.refreshToken.update({
            where: { id: dbToken.id },
            data: { isRevoked: true },
        });
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: tokens.refreshToken,
                ipAddress,
                userAgent,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        await this.prisma.session.create({
            data: {
                userId: user.id,
                token: tokens.accessToken,
                ipAddress,
                userAgent,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        });
        return tokens;
    }
    async forgotPassword(forgotPasswordDto) {
        const { email } = forgotPasswordDto;
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return { message: 'If the email exists, a password reset link has been sent.' };
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);
        await this.prisma.passwordReset.create({
            data: {
                userId: user.id,
                token: resetToken,
                expiresAt,
            },
        });
        console.log(`[PASSWORD RESET LINK]: http://localhost:3000/reset-password?token=${resetToken}`);
        return {
            message: 'If the email exists, a password reset link has been sent.',
            resetTokenForDev: process.env.NODE_ENV === 'development' ? resetToken : undefined,
        };
    }
    async resetPassword(resetPasswordDto) {
        const { token, newPassword } = resetPasswordDto;
        const resetRequest = await this.prisma.passwordReset.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!resetRequest || resetRequest.usedAt || resetRequest.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid, expired, or already used reset token');
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
            action: client_1.AuditAction.UPDATE,
            entity: 'users',
            entityId: resetRequest.userId,
            description: 'Password reset using security token',
        });
        return { message: 'Password has been reset successfully' };
    }
    async changePassword(userId, changePasswordDto) {
        const { oldPassword, newPassword } = changePasswordDto;
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('Incorrect current password');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        await this.auditLogService.log({
            userId,
            action: client_1.AuditAction.UPDATE,
            entity: 'users',
            entityId: userId,
            description: 'User changed password from dashboard settings',
        });
        return { message: 'Password changed successfully' };
    }
    async generateTokens(userId, email, role, sellerId) {
        const payload = { email, role, sellerId, sub: userId };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_SECRET', 'super_secret_jwt_key_change_in_production_min_32_chars'),
            expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET', 'super_secret_refresh_key_change_in_production_min_32_chars'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        });
        return {
            accessToken,
            refreshToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        audit_log_service_1.AuditLogService])
], AuthService);
//# sourceMappingURL=auth.service.js.map