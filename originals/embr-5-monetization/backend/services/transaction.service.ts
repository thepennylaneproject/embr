import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '../dto/wallet.dto';

interface CreateTransactionParams {
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, any>;
}

interface DoubleEntryTransaction {
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Record a transaction using double-entry bookkeeping
   * Every transaction has a debit and credit entry to maintain balance
   */
  async recordDoubleEntryTransaction(
    params: DoubleEntryTransaction,
  ): Promise<any> {
    const {
      debitAccountId,
      creditAccountId,
      amount,
      description,
      referenceId,
      referenceType,
      metadata,
    } = params;

    return this.prisma.$transaction(async (tx) => {
      // Create debit entry (decreases the account)
      const debitEntry = await tx.transaction.create({
        data: {
          userId: debitAccountId,
          type: 'DEBIT' as any,
          amount: -Math.abs(amount), // Always negative for debits
          description,
          referenceId,
          referenceType,
          metadata,
        },
      });

      // Create credit entry (increases the account)
      const creditEntry = await tx.transaction.create({
        data: {
          userId: creditAccountId,
          type: 'CREDIT' as any,
          amount: Math.abs(amount), // Always positive for credits
          description,
          referenceId,
          referenceType,
          metadata,
        },
      });

      // Update wallet balances
      await tx.wallet.update({
        where: { userId: debitAccountId },
        data: {
          balance: {
            decrement: Math.abs(amount),
          },
        },
      });

      await tx.wallet.update({
        where: { userId: creditAccountId },
        data: {
          balance: {
            increment: Math.abs(amount),
          },
        },
      });

      this.logger.log(
        `Double-entry transaction recorded: ${amount} from ${debitAccountId} to ${creditAccountId}`,
      );

      return { debitEntry, creditEntry };
    });
  }

  /**
   * Record a tip transaction
   * Debit: Sender's wallet
   * Credit: Recipient's wallet
   */
  async recordTipTransaction(
    senderId: string,
    recipientId: string,
    amount: number,
    tipId: string,
  ): Promise<void> {
    const platformFee = amount * 0.05; // 5% platform fee
    const netAmount = amount - platformFee;

    await this.prisma.$transaction(async (tx) => {
      // Record main tip transaction
      await this.recordDoubleEntryTransaction({
        debitAccountId: senderId,
        creditAccountId: recipientId,
        amount: netAmount,
        description: `Tip payment`,
        referenceId: tipId,
        referenceType: 'TIP',
        metadata: {
          grossAmount: amount,
          platformFee,
          netAmount,
        },
      });

      // Record platform fee
      if (platformFee > 0) {
        const platformAccountId = 'platform-revenue'; // System account
        await this.recordDoubleEntryTransaction({
          debitAccountId: recipientId,
          creditAccountId: platformAccountId,
          amount: platformFee,
          description: `Platform fee for tip`,
          referenceId: tipId,
          referenceType: 'FEE',
          metadata: { tipId },
        });
      }
    });
  }

  /**
   * Record a payout transaction
   * Debit: User's wallet
   * Credit: External bank account (represented as system account)
   */
  async recordPayoutTransaction(
    userId: string,
    amount: number,
    payoutId: string,
  ): Promise<void> {
    const externalAccountId = 'external-bank'; // System account

    await this.recordDoubleEntryTransaction({
      debitAccountId: userId,
      creditAccountId: externalAccountId,
      amount,
      description: `Payout to bank account`,
      referenceId: payoutId,
      referenceType: 'PAYOUT',
      metadata: { payoutId },
    });
  }

  /**
   * Get transaction history for a user
   */
  async getUserTransactions(
    userId: string,
    filters: {
      type?: TransactionType;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    },
  ): Promise<{ transactions: any[]; total: number }> {
    const { type, startDate, endDate, page = 1, limit = 20 } = filters;

    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { transactions, total };
  }

  /**
   * Verify wallet balance integrity
   * Sum of all transactions should equal current wallet balance
   */
  async verifyWalletIntegrity(userId: string): Promise<{
    isValid: boolean;
    calculatedBalance: number;
    actualBalance: number;
    difference: number;
  }> {
    const [transactionSum, wallet] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      this.prisma.wallet.findUnique({
        where: { userId },
        select: { balance: true },
      }),
    ]);

    const calculatedBalance = transactionSum._sum.amount || 0;
    const actualBalance = wallet?.balance || 0;
    const difference = Math.abs(calculatedBalance - actualBalance);

    // Allow for small rounding differences (less than 1 cent)
    const isValid = difference < 0.01;

    if (!isValid) {
      this.logger.error(
        `Wallet integrity check failed for user ${userId}: calculated=${calculatedBalance}, actual=${actualBalance}`,
      );
    }

    return {
      isValid,
      calculatedBalance,
      actualBalance,
      difference,
    };
  }

  /**
   * Get financial summary for date range
   */
  async getFinancialSummary(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalReceived: number;
    totalSent: number;
    totalFees: number;
    totalPayouts: number;
    netIncome: number;
  }> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const summary = {
      totalReceived: 0,
      totalSent: 0,
      totalFees: 0,
      totalPayouts: 0,
      netIncome: 0,
    };

    transactions.forEach((tx) => {
      if (tx.referenceType === 'TIP' && tx.amount > 0) {
        summary.totalReceived += tx.amount;
      } else if (tx.referenceType === 'TIP' && tx.amount < 0) {
        summary.totalSent += Math.abs(tx.amount);
      } else if (tx.referenceType === 'FEE') {
        summary.totalFees += Math.abs(tx.amount);
      } else if (tx.referenceType === 'PAYOUT') {
        summary.totalPayouts += Math.abs(tx.amount);
      }
    });

    summary.netIncome = summary.totalReceived - summary.totalFees;

    return summary;
  }
}
