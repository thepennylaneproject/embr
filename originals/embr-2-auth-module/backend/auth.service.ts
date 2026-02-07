// apps/api/src/modules/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { EmailService } from '../email/email.service';
import { SignUpDto, LoginDto } from './dto';

interface TokenPayload {
  sub: string;
  email: string;
  username: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: Partial<User>;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(EmailVerificationToken)
    private readonly emailVerificationTokenRepository: Repository<EmailVerificationToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  // =====================
  // SIGNUP & LOGIN
  // =====================

  async signUp(signUpDto: SignUpDto): Promise<TokenResponse> {
    const { email, username, password, fullName } = signUpDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already registered');
      }
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with profile and wallet
    const user = this.userRepository.create({
      email,
      username,
      passwordHash,
      fullName,
      isEmailVerified: false,
      profile: {
        displayName: fullName || username,
        bio: '',
      },
      wallet: {
        balance: 0,
        lifetimeEarned: 0,
        lifetimeSpent: 0,
      },
    });

    await this.userRepository.save(user);

    // Send verification email
    await this.sendVerificationEmail(user);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async login(loginDto: LoginDto): Promise<TokenResponse> {
    const { email, password } = loginDto;

    // Find user with profile
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['profile'],
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  // =====================
  // GOOGLE OAUTH
  // =====================

  async googleLogin(googleUser: any): Promise<TokenResponse> {
    if (!googleUser) {
      throw new UnauthorizedException('No user from Google');
    }

    const { email, firstName, lastName, picture, googleId } = googleUser;

    // Check if user exists
    let user = await this.userRepository.findOne({
      where: [{ email }, { googleId }],
      relations: ['profile'],
    });

    if (!user) {
      // Create new user from Google data
      const username = email.split('@')[0] + '_' + Date.now().toString().slice(-4);

      user = this.userRepository.create({
        email,
        username,
        fullName: `${firstName} ${lastName}`,
        googleId,
        isEmailVerified: true, // Google emails are pre-verified
        profile: {
          displayName: `${firstName} ${lastName}`,
          profilePicture: picture,
        },
        wallet: {
          balance: 0,
          lifetimeEarned: 0,
          lifetimeSpent: 0,
        },
      });

      await this.userRepository.save(user);
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = googleId;
      user.isEmailVerified = true;
      if (!user.profile?.profilePicture) {
        user.profile.profilePicture = picture;
      }
      await this.userRepository.save(user);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  // =====================
  // TOKEN MANAGEMENT
  // =====================

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '15m',
    });

    const refreshTokenValue = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    });

    // Store refresh token in database
    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<TokenResponse> {
    // Verify refresh token exists and is not expired
    const storedToken = await this.refreshTokenRepository.findOne({
      where: {
        userId,
        token: refreshToken,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get user
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Revoke old refresh token
    storedToken.isRevoked = true;
    await this.refreshTokenRepository.save(storedToken);

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    // Revoke the specific refresh token
    await this.refreshTokenRepository.update(
      { userId, token: refreshToken },
      { isRevoked: true },
    );
  }

  async logoutAll(userId: string): Promise<void> {
    // Revoke all refresh tokens for the user
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  // =====================
  // PASSWORD MANAGEMENT
  // =====================

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Store token
    const passwordResetToken = this.passwordResetTokenRepository.create({
      userId: user.id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    await this.passwordResetTokenRepository.save(passwordResetToken);

    // Send email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find all non-expired, non-used tokens
    const storedTokens = await this.passwordResetTokenRepository.find({
      where: {
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    // Find matching token
    let matchedToken: PasswordResetToken | null = null;

    for (const storedToken of storedTokens) {
      const isMatch = await bcrypt.compare(token, storedToken.token);
      if (isMatch) {
        matchedToken = storedToken;
        break;
      }
    }

    if (!matchedToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password
    const user = await this.userRepository.findOne({
      where: { id: matchedToken.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.save(user);

    // Mark token as used
    matchedToken.isUsed = true;
    await this.passwordResetTokenRepository.save(matchedToken);

    // Revoke all refresh tokens
    await this.logoutAll(user.id);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.save(user);

    // Revoke all refresh tokens except current session
    // (In production, you'd want to keep current session)
    await this.logoutAll(userId);
  }

  // =====================
  // EMAIL VERIFICATION
  // =====================

  private async sendVerificationEmail(user: User): Promise<void> {
    const verificationToken = randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(verificationToken, 10);

    // Store token
    const emailVerificationToken = this.emailVerificationTokenRepository.create({
      userId: user.id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await this.emailVerificationTokenRepository.save(emailVerificationToken);

    // Send email
    await this.emailService.sendVerificationEmail(user.email, verificationToken);
  }

  async verifyEmail(token: string): Promise<void> {
    // Find all non-expired, non-used tokens
    const storedTokens = await this.emailVerificationTokenRepository.find({
      where: {
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    // Find matching token
    let matchedToken: EmailVerificationToken | null = null;

    for (const storedToken of storedTokens) {
      const isMatch = await bcrypt.compare(token, storedToken.token);
      if (isMatch) {
        matchedToken = storedToken;
        break;
      }
    }

    if (!matchedToken) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Mark email as verified
    const user = await this.userRepository.findOne({
      where: { id: matchedToken.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isEmailVerified = true;
    await this.userRepository.save(user);

    // Mark token as used
    matchedToken.isUsed = true;
    await this.emailVerificationTokenRepository.save(matchedToken);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.sendVerificationEmail(user);
  }

  // =====================
  // USER MANAGEMENT
  // =====================

  async getMe(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'wallet'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async getActiveSessions(userId: string) {
    const sessions = await this.refreshTokenRepository.find({
      where: {
        userId,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    return sessions.map(session => ({
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }));
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid user');
    }

    return user;
  }

  // =====================
  // UTILITIES
  // =====================

  private sanitizeUser(user: User): Partial<User> {
    const { passwordHash, googleId, ...sanitized } = user;
    return sanitized;
  }
}
