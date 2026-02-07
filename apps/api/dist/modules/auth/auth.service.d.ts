import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { SignUpDto, LoginDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    user: any;
}
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    private readonly emailService;
    private readonly prisma;
    constructor(jwtService: JwtService, configService: ConfigService, emailService: EmailService, prisma: PrismaService);
    signUp(signUpDto: SignUpDto): Promise<TokenResponse>;
    login(loginDto: LoginDto): Promise<TokenResponse>;
    googleLogin(googleUser: any): Promise<TokenResponse>;
    private generateTokens;
    refreshTokens(userId: string, refreshToken: string): Promise<TokenResponse>;
    logout(userId: string, refreshToken: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    private sendVerificationEmail;
    verifyEmail(token: string): Promise<void>;
    resendVerificationEmail(email: string): Promise<void>;
    getMe(userId: string): Promise<any>;
    getActiveSessions(userId: string): Promise<{
        id: string;
        createdAt: Date;
        expiresAt: Date;
    }[]>;
    validateUser(userId: string): Promise<any>;
    private sanitizeUser;
}
