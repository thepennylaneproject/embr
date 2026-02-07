export declare class EmailService {
    sendEmail(_to: string, _subject: string, _html: string): Promise<void>;
    sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
    sendVerificationEmail(email: string, verificationToken: string): Promise<void>;
}
