import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendEmail(_to: string, _subject: string, _html: string): Promise<void> {
    // Placeholder implementation. Wire to SendGrid/SES later.
    return;
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    await this.sendEmail(
      email,
      'Reset your password',
      `Reset token: ${resetToken}`,
    );
  }

  async sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
    await this.sendEmail(
      email,
      'Verify your email',
      `Verification token: ${verificationToken}`,
    );
  }
}
