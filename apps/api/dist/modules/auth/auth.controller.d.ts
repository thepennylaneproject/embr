import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto, VerifyEmailDto, ResendVerificationDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signUp(signUpDto: SignUpDto): Promise<import("./auth.service").TokenResponse>;
    login(loginDto: LoginDto): Promise<import("./auth.service").TokenResponse>;
    googleAuth(): Promise<void>;
    googleAuthCallback(req: Request, res: Response): Promise<void>;
    refresh(userId: string, refreshTokenDto: RefreshTokenDto): Promise<import("./auth.service").TokenResponse>;
    logout(userId: string, body: {
        refreshToken: string;
    }): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    resendVerification(resendDto: ResendVerificationDto): Promise<{
        message: string;
    }>;
    getMe(userId: string): Promise<any>;
    getSession(userId: string): Promise<{
        id: string;
        createdAt: Date;
        expiresAt: Date;
    }[]>;
}
