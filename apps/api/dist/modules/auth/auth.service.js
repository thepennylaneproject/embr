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
const bcrypt = require("bcryptjs");
const crypto_1 = require("crypto");
const email_service_1 = require("../email/email.service");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(jwtService, configService, emailService, prisma) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.emailService = emailService;
        this.prisma = prisma;
    }
    async signUp(signUpDto) {
        const { email, username, password, fullName } = signUpDto;
        const existingUser = await this.prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });
        if (existingUser) {
            if (existingUser.email === email) {
                throw new common_1.ConflictException('Email already registered');
            }
            throw new common_1.ConflictException('Username already taken');
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await this.prisma.user.create({
            data: {
                email,
                username,
                passwordHash,
                fullName,
                isVerified: false,
                profile: {
                    create: {
                        username,
                        displayName: fullName || username,
                        bio: '',
                    },
                },
                wallet: {
                    create: {
                        balance: 0,
                        pendingBalance: 0,
                        totalEarned: 0,
                        totalWithdrawn: 0,
                    },
                },
            },
            include: {
                profile: true,
                wallet: true,
            },
        });
        await this.sendVerificationEmail(user);
        const { accessToken, refreshToken } = await this.generateTokens(user);
        return {
            accessToken,
            refreshToken,
            user: this.sanitizeUser(user),
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { profile: true, wallet: true },
        });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.deletedAt) {
            throw new common_1.UnauthorizedException('Account has been deactivated');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const { accessToken, refreshToken } = await this.generateTokens(user);
        return {
            accessToken,
            refreshToken,
            user: this.sanitizeUser(user),
        };
    }
    async googleLogin(googleUser) {
        if (!googleUser) {
            throw new common_1.UnauthorizedException('No user from Google');
        }
        const { email, firstName, lastName, picture, googleId } = googleUser;
        let user = await this.prisma.user.findFirst({
            where: { OR: [{ email }, { googleId }] },
            include: { profile: true, wallet: true },
        });
        if (!user) {
            const username = email.split('@')[0] + '_' + Date.now().toString().slice(-4);
            user = await this.prisma.user.create({
                data: {
                    email,
                    username,
                    fullName: `${firstName} ${lastName}`,
                    googleId,
                    isVerified: true,
                    profile: {
                        create: {
                            username,
                            displayName: `${firstName} ${lastName}`,
                            avatarUrl: picture,
                        },
                    },
                    wallet: {
                        create: {
                            balance: 0,
                            pendingBalance: 0,
                            totalEarned: 0,
                            totalWithdrawn: 0,
                        },
                    },
                },
                include: { profile: true, wallet: true },
            });
        }
        else if (!user.googleId) {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId,
                    isVerified: true,
                    profile: user.profile
                        ? {
                            update: {
                                avatarUrl: user.profile?.avatarUrl || picture,
                            },
                        }
                        : {
                            create: {
                                username: user.username,
                                displayName: user.fullName || user.username,
                                avatarUrl: picture,
                            },
                        },
                },
                include: { profile: true, wallet: true },
            });
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const { accessToken, refreshToken } = await this.generateTokens(user);
        return {
            accessToken,
            refreshToken,
            user: this.sanitizeUser(user),
        };
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_EXPIRATION') || '15m',
        });
        const refreshTokenValue = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
        });
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshTokenValue,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return {
            accessToken,
            refreshToken: refreshTokenValue,
        };
    }
    async refreshTokens(userId, refreshToken) {
        const storedToken = await this.prisma.refreshToken.findFirst({
            where: {
                userId,
                token: refreshToken,
                isRevoked: false,
                expiresAt: { gt: new Date() },
            },
        });
        if (!storedToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true, wallet: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        await this.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { isRevoked: true },
        });
        const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user);
        return {
            accessToken,
            refreshToken: newRefreshToken,
            user: this.sanitizeUser(user),
        };
    }
    async logout(userId, refreshToken) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, token: refreshToken },
            data: { isRevoked: true },
        });
    }
    async logoutAll(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, isRevoked: false },
            data: { isRevoked: true },
        });
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return;
        }
        const resetToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const hashedToken = await bcrypt.hash(resetToken, 10);
        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token: hashedToken,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            },
        });
        await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    }
    async resetPassword(token, newPassword) {
        const storedTokens = await this.prisma.passwordResetToken.findMany({
            where: {
                isUsed: false,
                expiresAt: { gt: new Date() },
            },
        });
        let matchedToken = null;
        for (const storedToken of storedTokens) {
            const isMatch = await bcrypt.compare(token, storedToken.token);
            if (isMatch) {
                matchedToken = storedToken;
                break;
            }
        }
        if (!matchedToken) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: matchedToken.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: await bcrypt.hash(newPassword, 12) },
        });
        await this.prisma.passwordResetToken.update({
            where: { id: matchedToken.id },
            data: { isUsed: true },
        });
        await this.logoutAll(user.id);
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: await bcrypt.hash(newPassword, 12) },
        });
        await this.logoutAll(userId);
    }
    async sendVerificationEmail(user) {
        const verificationToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const hashedToken = await bcrypt.hash(verificationToken, 10);
        await this.prisma.emailVerificationToken.create({
            data: {
                userId: user.id,
                token: hashedToken,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });
        await this.emailService.sendVerificationEmail(user.email, verificationToken);
    }
    async verifyEmail(token) {
        const storedTokens = await this.prisma.emailVerificationToken.findMany({
            where: {
                isUsed: false,
                expiresAt: { gt: new Date() },
            },
        });
        let matchedToken = null;
        for (const storedToken of storedTokens) {
            const isMatch = await bcrypt.compare(token, storedToken.token);
            if (isMatch) {
                matchedToken = storedToken;
                break;
            }
        }
        if (!matchedToken) {
            throw new common_1.BadRequestException('Invalid or expired verification token');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: matchedToken.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true },
        });
        await this.prisma.emailVerificationToken.update({
            where: { id: matchedToken.id },
            data: { isUsed: true },
        });
    }
    async resendVerificationEmail(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return;
        }
        if (user.isVerified) {
            throw new common_1.BadRequestException('Email already verified');
        }
        await this.sendVerificationEmail(user);
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true, wallet: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.sanitizeUser(user);
    }
    async getActiveSessions(userId) {
        const sessions = await this.prisma.refreshToken.findMany({
            where: {
                userId,
                isRevoked: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });
        return sessions.map(session => ({
            id: session.id,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt,
        }));
    }
    async validateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
        if (!user || user.deletedAt) {
            throw new common_1.UnauthorizedException('Invalid user');
        }
        return user;
    }
    sanitizeUser(user) {
        const { passwordHash, googleId, ...sanitized } = user;
        return sanitized;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map