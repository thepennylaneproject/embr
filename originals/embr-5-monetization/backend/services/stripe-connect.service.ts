import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import {
  CreateStripeConnectAccountDto,
  GetStripeAccountLinkDto,
} from '../dto/wallet.dto';

@Injectable()
export class StripeConnectService {
  private readonly logger = new Logger(StripeConnectService.name);
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Create a Stripe Connect account for a creator
   */
  async createConnectAccount(
    userId: string,
    dto: CreateStripeConnectAccountDto,
  ): Promise<{ accountId: string; onboardingUrl: string }> {
    const { country, email } = dto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { payment: true, profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already has Stripe Connect account
    if (user.payment?.stripeConnectAccountId) {
      const account = await this.stripe.accounts.retrieve(
        user.payment.stripeConnectAccountId,
      );

      // If account exists and is not onboarded, return new onboarding link
      if (!account.details_submitted) {
        const accountLink = await this.createAccountLink(
          user.payment.stripeConnectAccountId,
          `${process.env.FRONTEND_URL}/settings/payouts`,
          `${process.env.FRONTEND_URL}/settings/payouts/refresh`,
        );

        return {
          accountId: user.payment.stripeConnectAccountId,
          onboardingUrl: accountLink.url,
        };
      }

      return {
        accountId: user.payment.stripeConnectAccountId,
        onboardingUrl: '',
      };
    }

    try {
      // Create Stripe Connect account
      const account = await this.stripe.accounts.create({
        type: 'express',
        country,
        email: email || user.email,
        business_type: 'individual',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          userId: user.id,
          username: user.profile?.username || '',
        },
      });

      // Create or update payment record
      await this.prisma.payment.upsert({
        where: { userId },
        create: {
          userId,
          stripeConnectAccountId: account.id,
          payoutsEnabled: false,
        },
        update: {
          stripeConnectAccountId: account.id,
        },
      });

      // Create account link for onboarding
      const accountLink = await this.createAccountLink(
        account.id,
        `${process.env.FRONTEND_URL}/settings/payouts`,
        `${process.env.FRONTEND_URL}/settings/payouts/refresh`,
      );

      this.logger.log(
        `Stripe Connect account created for user ${userId}: ${account.id}`,
      );

      return {
        accountId: account.id,
        onboardingUrl: accountLink.url,
      };
    } catch (error) {
      this.logger.error(`Failed to create Stripe Connect account: ${error.message}`);
      throw new BadRequestException(
        `Failed to create payment account: ${error.message}`,
      );
    }
  }

  /**
   * Create account link for onboarding or re-authentication
   */
  private async createAccountLink(
    accountId: string,
    returnUrl: string,
    refreshUrl: string,
  ): Promise<Stripe.AccountLink> {
    return this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
  }

  /**
   * Get account link for re-onboarding
   */
  async getAccountLink(
    userId: string,
    dto: GetStripeAccountLinkDto,
  ): Promise<{ url: string }> {
    const { returnUrl, refreshUrl } = dto;

    const payment = await this.prisma.payment.findUnique({
      where: { userId },
    });

    if (!payment?.stripeConnectAccountId) {
      throw new NotFoundException('No Stripe Connect account found');
    }

    const accountLink = await this.createAccountLink(
      payment.stripeConnectAccountId,
      returnUrl,
      refreshUrl,
    );

    return { url: accountLink.url };
  }

  /**
   * Complete onboarding (called after user returns from Stripe)
   */
  async completeOnboarding(userId: string): Promise<any> {
    const payment = await this.prisma.payment.findUnique({
      where: { userId },
    });

    if (!payment?.stripeConnectAccountId) {
      throw new NotFoundException('No Stripe Connect account found');
    }

    // Retrieve account from Stripe
    const account = await this.stripe.accounts.retrieve(
      payment.stripeConnectAccountId,
    );

    // Check if onboarding is complete
    const isComplete = account.details_submitted;
    const chargesEnabled = account.charges_enabled;
    const payoutsEnabled = account.payouts_enabled;

    // Update payment record
    await this.prisma.payment.update({
      where: { userId },
      data: {
        onboardingCompleted: isComplete,
        chargesEnabled,
        payoutsEnabled,
      },
    });

    this.logger.log(
      `Onboarding ${isComplete ? 'completed' : 'pending'} for user ${userId}`,
    );

    return {
      isComplete,
      chargesEnabled,
      payoutsEnabled,
      requiresAction: !isComplete,
    };
  }

  /**
   * Get account status
   */
  async getAccountStatus(userId: string): Promise<{
    hasAccount: boolean;
    isOnboarded: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    requiresAction: boolean;
    accountId?: string;
  }> {
    const payment = await this.prisma.payment.findUnique({
      where: { userId },
    });

    if (!payment?.stripeConnectAccountId) {
      return {
        hasAccount: false,
        isOnboarded: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        requiresAction: true,
      };
    }

    try {
      const account = await this.stripe.accounts.retrieve(
        payment.stripeConnectAccountId,
      );

      const isOnboarded = account.details_submitted || false;
      const chargesEnabled = account.charges_enabled || false;
      const payoutsEnabled = account.payouts_enabled || false;

      // Check if action is required
      const requiresAction =
        !isOnboarded ||
        !chargesEnabled ||
        !payoutsEnabled ||
        (account.requirements?.currently_due?.length || 0) > 0;

      return {
        hasAccount: true,
        isOnboarded,
        chargesEnabled,
        payoutsEnabled,
        requiresAction,
        accountId: payment.stripeConnectAccountId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve Stripe account status: ${error.message}`,
      );
      return {
        hasAccount: true,
        isOnboarded: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        requiresAction: true,
        accountId: payment.stripeConnectAccountId,
      };
    }
  }

  /**
   * Get account details
   */
  async getAccountDetails(userId: string): Promise<any> {
    const payment = await this.prisma.payment.findUnique({
      where: { userId },
    });

    if (!payment?.stripeConnectAccountId) {
      throw new NotFoundException('No Stripe Connect account found');
    }

    const account = await this.stripe.accounts.retrieve(
      payment.stripeConnectAccountId,
    );

    return {
      id: account.id,
      email: account.email,
      country: account.country,
      defaultCurrency: account.default_currency,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pendingVerification: account.requirements?.pending_verification || [],
      },
      externalAccounts: account.external_accounts?.data.map((acc: any) => ({
        id: acc.id,
        object: acc.object,
        last4: acc.last4,
        bankName: acc.bank_name,
        country: acc.country,
        currency: acc.currency,
      })),
    };
  }

  /**
   * Delete Stripe Connect account (admin action)
   */
  async deleteAccount(userId: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { userId },
    });

    if (!payment?.stripeConnectAccountId) {
      throw new NotFoundException('No Stripe Connect account found');
    }

    try {
      await this.stripe.accounts.del(payment.stripeConnectAccountId);

      await this.prisma.payment.update({
        where: { userId },
        data: {
          stripeConnectAccountId: null,
          onboardingCompleted: false,
          chargesEnabled: false,
          payoutsEnabled: false,
        },
      });

      this.logger.log(`Stripe Connect account deleted for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete Stripe Connect account: ${error.message}`,
      );
      throw new BadRequestException(
        `Failed to delete payment account: ${error.message}`,
      );
    }
  }

  /**
   * Handle account update webhook
   */
  async handleAccountUpdate(accountId: string): Promise<void> {
    const payment = await this.prisma.payment.findFirst({
      where: { stripeConnectAccountId: accountId },
    });

    if (!payment) {
      this.logger.warn(`No payment record found for account ${accountId}`);
      return;
    }

    const account = await this.stripe.accounts.retrieve(accountId);

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        onboardingCompleted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      },
    });

    // Notify user if onboarding completed
    if (account.details_submitted && !payment.onboardingCompleted) {
      await this.prisma.notification.create({
        data: {
          userId: payment.userId,
          type: 'STRIPE_ONBOARDING_COMPLETE',
          title: 'Payment account ready',
          message: 'Your payment account is now active. You can receive payouts!',
          referenceId: accountId,
          referenceType: 'PAYMENT',
        },
      });
    }

    this.logger.log(`Account updated: ${accountId}`);
  }
}
