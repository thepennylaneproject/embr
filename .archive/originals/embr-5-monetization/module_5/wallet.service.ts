/**
 * Wallet Service - Core monetization logic
 * Handles tips, payouts, Stripe Connect, and double-entry bookkeeping
 */

import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import {
  TransactionType,
  TransactionStatus,
  PayoutStatus,
  KycStatus,
  StripeAccountStatus,
  LedgerEntryType,
} from '@prisma/client';

@Injectable()
export class WalletService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
  }

  // ==========================================================================
  // WALLET OPERATIONS
  // ==========================================================================

  async getOrCreateWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          pendingBalance: 0,
          lifetimeEarned: 0,
          lifetimeSpent: 0,
        },
      });
    }

    return wallet;
  }

  async getWalletBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    
    return {
      balance: wallet.balance,
      pendingBalance: wallet.pendingBalance,
      availableForPayout: Math.max(0, wallet.balance - 2000), // $20 minimum balance
      lifetimeEarned: wallet.lifetimeEarned,
      lifetimeSpent: wallet.lifetimeSpent,
      canRequestPayout: wallet.canRequestPayouts && wallet.balance >= 2000,
      stripeAccountStatus: wallet.stripeAccountStatus,
      kycStatus: wallet.kycStatus,
    };
  }

  async getTransactions(
    userId: string,
    page: number = 1,
    perPage: number = 20,
    filters?: {
      type?: TransactionType[];
      status?: TransactionStatus[];
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const wallet = await this.getOrCreateWallet(userId);
    
    const where: any = {
      walletId: wallet.id,
    };

    if (filters?.type?.length) {
      where.type = { in: filters.type };
    }

    if (filters?.status?.length) {
      where.status = { in: filters.status };
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          relatedUser: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          relatedPost: {
            select: {
              id: true,
              type: true,
              thumbnailUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      transactions: transactions.map(t => ({
        ...t,
        relatedUser: t.relatedUser ? {
          id: t.relatedUser.id,
          username: t.relatedUser.username,
          displayName: t.relatedUser.profile?.displayName || t.relatedUser.username,
          avatarUrl: t.relatedUser.profile?.avatarUrl || null,
        } : undefined,
      })),
      total,
      page,
      perPage,
      hasMore: total > page * perPage,
    };
  }

  // ==========================================================================
  // DOUBLE-ENTRY BOOKKEEPING
  // ==========================================================================

  private async createLedgerEntries(
    transactionId: string,
    entries: Array<{
      walletId: string;
      entryType: LedgerEntryType;
      amount: number;
      description: string;
    }>,
  ) {
    // Validate double-entry: sum of debits must equal sum of credits
    const debits = entries.filter(e => e.entryType === LedgerEntryType.debit).reduce((sum, e) => sum + e.amount, 0);
    const credits = entries.filter(e => e.entryType === LedgerEntryType.credit).reduce((sum, e) => sum + e.amount, 0);

    if (debits !== credits) {
      throw new Error(`Ledger entries don't balance: debits=${debits}, credits=${credits}`);
    }

    // Create entries and update wallet balances
    for (const entry of entries) {
      // Get current wallet balance
      const wallet = await this.prisma.wallet.findUnique({
        where: { id: entry.walletId },
      });

      // Calculate new balance (debit increases, credit decreases)
      const balanceChange = entry.entryType === LedgerEntryType.debit ? entry.amount : -entry.amount;
      const newBalance = wallet.balance + balanceChange;

      // Create ledger entry
      await this.prisma.ledgerEntry.create({
        data: {
          transactionId,
          walletId: entry.walletId,
          entryType: entry.entryType,
          amount: entry.amount,
          balance: newBalance,
          description: entry.description,
        },
      });

      // Update wallet balance
      await this.prisma.wallet.update({
        where: { id: entry.walletId },
        data: { balance: newBalance },
      });
    }
  }

  // ==========================================================================
  // TIP OPERATIONS
  // ==========================================================================

  async sendTip(
    senderId: string,
    recipientId: string,
    amount: number,
    postId?: string,
    message?: string,
    isAnonymous: boolean = false,
  ) {
    if (senderId === recipientId) {
      throw new BadRequestException('You cannot tip yourself');
    }

    if (amount < 100) {
      throw new BadRequestException('Minimum tip amount is $1.00');
    }

    // Get or create wallets
    const [senderWallet, recipientWallet] = await Promise.all([
      this.getOrCreateWallet(senderId),
      this.getOrCreateWallet(recipientId),
    ]);

    // Check sender balance
    if (senderWallet.balance < amount) {
      throw new BadRequestException(
        `Insufficient balance. Required: $${amount / 100}, Available: $${senderWallet.balance / 100}`,
      );
    }

    // Calculate platform fee (15%)
    const fee = Math.max(Math.round(amount * 0.15), 10); // Minimum $0.10 fee
    const netAmount = amount - fee;

    // Execute transaction in database transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create main transaction for sender
      const senderTransaction = await tx.transaction.create({
        data: {
          walletId: senderWallet.id,
          type: TransactionType.tip_sent,
          amount: -amount,
          fee: 0,
          netAmount: -amount,
          status: TransactionStatus.completed,
          description: `Tip sent to @${recipientId}${postId ? ' on post' : ''}`,
          relatedUserId: recipientId,
          relatedPostId: postId,
          completedAt: new Date(),
        },
      });

      // Create transaction for recipient
      const recipientTransaction = await tx.transaction.create({
        data: {
          walletId: recipientWallet.id,
          type: TransactionType.tip_received,
          amount: netAmount,
          fee,
          netAmount,
          status: TransactionStatus.completed,
          description: `Tip received from @${senderId}${postId ? ' on post' : ''}`,
          relatedUserId: senderId,
          relatedPostId: postId,
          completedAt: new Date(),
        },
      });

      // Create platform fee transaction
      const feeTransaction = await tx.transaction.create({
        data: {
          walletId: recipientWallet.id,
          type: TransactionType.platform_fee,
          amount: -fee,
          fee: 0,
          netAmount: -fee,
          status: TransactionStatus.completed,
          description: 'Platform fee (15%)',
          completedAt: new Date(),
        },
      });

      // Create Tip record
      const tip = await tx.tip.create({
        data: {
          senderId,
          receiverId: recipientId,
          amount,
          fee,
          netAmount,
          message,
          isAnonymous,
          postId,
          transactionId: recipientTransaction.id,
          status: TransactionStatus.completed,
        },
      });

      // Update wallet balances using double-entry bookkeeping
      await this.createLedgerEntries(senderTransaction.id, [
        {
          walletId: senderWallet.id,
          entryType: LedgerEntryType.credit, // Credit (decrease) sender's wallet
          amount,
          description: 'Tip sent',
        },
        {
          walletId: recipientWallet.id,
          entryType: LedgerEntryType.debit, // Debit (increase) recipient's wallet
          amount: netAmount,
          description: 'Tip received (net of fee)',
        },
      ]);

      // Update lifetime stats
      await tx.wallet.update({
        where: { id: senderWallet.id },
        data: { lifetimeSpent: { increment: amount } },
      });

      await tx.wallet.update({
        where: { id: recipientWallet.id },
        data: { lifetimeEarned: { increment: netAmount } },
      });

      return {
        tip,
        senderTransaction,
        recipientTransaction,
        newBalance: (await tx.wallet.findUnique({ where: { id: senderWallet.id } })).balance,
      };
    });

    // Get recipient details for response
    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientId },
      include: {
        profile: {
          select: {
            displayName: true,
          },
        },
      },
    });

    return {
      tipId: result.tip.id,
      transactionId: result.senderTransaction.id,
      amount,
      fee,
      newBalance: result.newBalance,
      recipient: {
        id: recipientId,
        username: recipient.username,
        displayName: recipient.profile?.displayName || recipient.username,
      },
    };
  }

  // ==========================================================================
  // STRIPE CONNECT OPERATIONS
  // ==========================================================================

  async createStripeConnectAccount(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.stripeAccountId) {
      throw new BadRequestException('Stripe account already exists');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    // Create Stripe Connect account
    const account = await this.stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        userId,
        username: user.username,
      },
    });

    // Update wallet with Stripe account ID
    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        stripeAccountId: account.id,
        stripeAccountStatus: StripeAccountStatus.pending,
      },
    });

    // Create account link for onboarding
    const accountLink = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/wallet/connect/refresh`,
      return_url: `${process.env.FRONTEND_URL}/wallet/connect/success`,
      type: 'account_onboarding',
    });

    return {
      accountId: account.id,
      onboardingUrl: accountLink.url,
      expiresAt: new Date(accountLink.expires_at * 1000),
    };
  }

  async refreshStripeConnectLink(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);

    if (!wallet.stripeAccountId) {
      throw new BadRequestException('No Stripe account found. Please create one first.');
    }

    const accountLink = await this.stripe.accountLinks.create({
      account: wallet.stripeAccountId,
      refresh_url: `${process.env.FRONTEND_URL}/wallet/connect/refresh`,
      return_url: `${process.env.FRONTEND_URL}/wallet/connect/success`,
      type: 'account_onboarding',
    });

    return {
      accountId: wallet.stripeAccountId,
      onboardingUrl: accountLink.url,
      expiresAt: new Date(accountLink.expires_at * 1000),
    };
  }

  async updateStripeAccountStatus(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);

    if (!wallet.stripeAccountId) {
      return wallet;
    }

    // Fetch account from Stripe
    const account = await this.stripe.accounts.retrieve(wallet.stripeAccountId);

    // Determine status
    let status = StripeAccountStatus.pending;
    if (account.charges_enabled && account.payouts_enabled) {
      status = StripeAccountStatus.active;
    } else if (account.requirements?.disabled_reason) {
      status = StripeAccountStatus.disabled;
    } else if (account.requirements?.currently_due?.length > 0) {
      status = StripeAccountStatus.restricted;
    }

    // Determine KYC status
    let kycStatus = KycStatus.none;
    if (account.details_submitted) {
      if (account.charges_enabled && account.payouts_enabled) {
        kycStatus = KycStatus.verified;
      } else if (account.requirements?.currently_due?.length > 0) {
        kycStatus = KycStatus.requires_action;
      } else {
        kycStatus = KycStatus.pending;
      }
    }

    // Update wallet
    const updatedWallet = await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        stripeAccountStatus: status,
        kycStatus,
        canReceivePayments: account.charges_enabled,
        canRequestPayouts: account.payouts_enabled && status === StripeAccountStatus.active,
      },
    });

    return updatedWallet;
  }

  async getStripeAccountDetails(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);

    if (!wallet.stripeAccountId) {
      throw new NotFoundException('No Stripe account found');
    }

    const account = await this.stripe.accounts.retrieve(wallet.stripeAccountId);

    return {
      accountId: account.id,
      accountStatus: wallet.stripeAccountStatus,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requiresAction: (account.requirements?.currently_due?.length || 0) > 0,
      requirementsDue: account.requirements?.currently_due || [],
      email: account.email,
      businessName: account.business_profile?.name,
      country: account.country,
      currency: account.default_currency,
      bankAccounts: account.external_accounts?.data?.map(ea => ({
        id: ea.id,
        last4: ea.last4 || '',
        bankName: ea.bank_name || '',
        currency: ea.currency || account.default_currency,
        status: ea.status || 'unknown',
      })) || [],
    };
  }

  // ==========================================================================
  // PAYOUT OPERATIONS
  // ==========================================================================

  async requestPayout(userId: string, amount: number, notes?: string) {
    const wallet = await this.getOrCreateWallet(userId);

    // Validation
    if (amount < 2000) {
      throw new BadRequestException('Minimum payout amount is $20.00');
    }

    if (wallet.balance < amount) {
      throw new BadRequestException(
        `Insufficient balance. Requested: $${amount / 100}, Available: $${wallet.balance / 100}`,
      );
    }

    if (!wallet.canRequestPayouts) {
      throw new ForbiddenException(
        'Payouts not enabled. Please complete Stripe onboarding and verification.',
      );
    }

    if (wallet.stripeAccountStatus !== StripeAccountStatus.active) {
      throw new ForbiddenException('Stripe account not active');
    }

    // Calculate fee (0.25% + $0.25)
    const feePercentage = Math.round(amount * 0.0025);
    const feeFixed = 25;
    const fee = Math.max(feePercentage + feeFixed, 25);
    const netAmount = amount - fee;

    // Get bank account info
    const stripeAccount = await this.stripe.accounts.retrieve(wallet.stripeAccountId);
    const bankAccount = stripeAccount.external_accounts?.data?.[0];

    // Create payout in database transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.payout,
          amount: -amount,
          fee,
          netAmount: -netAmount,
          status: TransactionStatus.pending,
          description: `Payout request - $${(netAmount / 100).toFixed(2)}`,
          completedAt: null,
        },
      });

      // Create payout record
      const payout = await tx.payout.create({
        data: {
          userId,
          walletId: wallet.id,
          amount,
          fee,
          netAmount,
          status: PayoutStatus.pending,
          bankAccountLast4: bankAccount?.last4 || null,
          notes,
          transactionId: transaction.id,
        },
      });

      return { payout, transaction };
    });

    return {
      payoutId: result.payout.id,
      amount,
      fee,
      netAmount,
      status: PayoutStatus.pending,
      estimatedArrival: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 business days
    };
  }

  async approvePayout(payoutId: string, adminId: string, notes?: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id: payoutId },
      include: {
        wallet: true,
        transaction: true,
      },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    if (payout.status !== PayoutStatus.pending) {
      throw new BadRequestException(`Payout is ${payout.status}, cannot approve`);
    }

    // Process Stripe transfer
    try {
      const transfer = await this.stripe.transfers.create({
        amount: payout.netAmount,
        currency: 'usd',
        destination: payout.wallet.stripeAccountId,
        description: `Payout ${payout.id}`,
        metadata: {
          payoutId: payout.id,
          userId: payout.userId,
        },
      });

      // Update payout and transaction
      const updatedPayout = await this.prisma.$transaction(async (tx) => {
        // Update payout
        const updated = await tx.payout.update({
          where: { id: payoutId },
          data: {
            status: PayoutStatus.processing,
            stripeTransferId: transfer.id,
            approvedAt: new Date(),
            approvedBy: adminId,
            notes: notes || payout.notes,
          },
        });

        // Update transaction
        await tx.transaction.update({
          where: { id: payout.transactionId },
          data: {
            status: TransactionStatus.processing,
            stripeTransferId: transfer.id,
          },
        });

        // Deduct from wallet balance
        await tx.wallet.update({
          where: { id: payout.walletId },
          data: {
            balance: { decrement: payout.amount },
            lifetimeSpent: { increment: payout.amount },
          },
        });

        return updated;
      });

      return updatedPayout;
    } catch (error) {
      // Update payout as failed
      await this.prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.failed,
          rejectionReason: error.message,
        },
      });

      throw error;
    }
  }

  async rejectPayout(payoutId: string, adminId: string, reason: string, notes?: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id: payoutId },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    if (payout.status !== PayoutStatus.pending) {
      throw new BadRequestException(`Payout is ${payout.status}, cannot reject`);
    }

    // Update payout and transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.payout.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.rejected,
          rejectedAt: new Date(),
          approvedBy: adminId,
          rejectionReason: reason,
          notes: notes || payout.notes,
        },
      });

      await tx.transaction.update({
        where: { id: payout.transactionId },
        data: {
          status: TransactionStatus.cancelled,
        },
      });
    });
  }

  async getPayouts(userId: string, page: number = 1, perPage: number = 20) {
    const wallet = await this.getOrCreateWallet(userId);

    const [payouts, total] = await Promise.all([
      this.prisma.payout.findMany({
        where: { walletId: wallet.id },
        orderBy: { requestedAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.payout.count({ where: { walletId: wallet.id } }),
    ]);

    return {
      payouts,
      total,
      page,
      perPage,
      hasMore: total > page * perPage,
    };
  }
}
