import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuditLogService } from '../../common/services/audit-log.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private auditLogService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, auditLogService: AuditLogService);
    login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            sellerId: string;
        };
    }>;
    logout(userId: string, accessToken: string, ipAddress?: string, userAgent?: string): Promise<{
        message: string;
    }>;
    refresh(refreshTokenDto: RefreshTokenDto, ipAddress?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
        resetTokenForDev?: undefined;
    } | {
        message: string;
        resetTokenForDev: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    private generateTokens;
}
