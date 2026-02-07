/**
 * Shared TypeScript types for Monetization & Wallet Module
 * Used across frontend and backend
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum TransactionType {
  TIP_SENT = 'tip_sent',
  TIP_RECEIVED = 'tip_received',
  PURCHASE = 'purchase',
  PAYOUT = 'payout',
  PAYWALL_UNLOCK = 'paywall_unlock',
  GIG_PAYMENT = 'gig_payment',
  GIG_ESCROW = 'gig_escrow',
  GIG_RELEASE = 'gig_release',
  PLATFORM_FEE = 'platform_fee',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum PayoutStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
  REJECTED = 'rejected',
}

export enum KycStatus {
  NONE = 'none',
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
  REQUIRES_ACTION = 'requires_action',
}

export enum StripeAccountStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  RESTRICTED = 'restricted',
  DISABLED = 'disabled',
}

// ============================================================================
// WALLET TYPES
// ============================================================================

export interface Wallet {
  id: string;
  userId: string;
  balance: number; // Available balance in cents
  pendingBalance: number; // Funds in escrow/pending
  lifetimeEarned: number; // Total earned across all time
  lifetimeSpent: number; // Total spent across all time
  stripeAccountId: string | null;
  stripeAccountStatus: StripeAccountStatus;
  kycStatus: KycStatus;
  canReceivePayments: boolean;
  canRequestPayouts: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletSummary {
  balance: number;
  pendingBalance: number;
  availableForPayout: number; // balance - minimum_balance_threshold
  lifetimeEarned: number;
  lifetimeSpent: number;
  canRequestPayout: boolean;
  nextPayoutDate: Date | null;
  stripeAccountStatus: StripeAccountStatus;
  kycStatus: KycStatus;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number; // In cents (positive or negative)
  fee: number; // Platform fee in cents
  netAmount: number; // Amount after fee
  status: TransactionStatus;
  description: string;
  relatedUserId: string | null;
  relatedPostId: string | null;
  relatedGigId: string | null;
  relatedPayoutId: string | null;
  stripePaymentIntentId: string | null;
  stripeTransferId: string | null;
  metadata: Record<string, any>;
  createdAt: Date;
  completedAt: Date | null;
  
  // Relations (optional for frontend display)
  relatedUser?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  relatedPost?: {
    id: string;
    type: string;
    thumbnailUrl: string | null;
  };
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface TransactionFilters {
  type?: TransactionType[];
  status?: TransactionStatus[];
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

// ============================================================================
// LEDGER ENTRY TYPES (Double-Entry Bookkeeping)
// ============================================================================

export enum LedgerEntryType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  walletId: string;
  entryType: LedgerEntryType;
  amount: number;
  balance: number; // Wallet balance after this entry
  description: string;
  createdAt: Date;
}

// ============================================================================
// TIP TYPES
// ============================================================================

export interface Tip {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number; // In cents
  fee: number; // Platform fee
  netAmount: number; // Amount received by creator
  postId: string | null;
  message: string | null;
  isAnonymous: boolean;
  status: TransactionStatus;
  createdAt: Date;
  
  // Relations (optional for frontend display)
  sender?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  receiver?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  post?: {
    id: string;
    type: string;
    thumbnailUrl: string | null;
  };
}

export interface TipRequest {
  recipientId: string;
  amount: number;
  postId?: string;
  message?: string;
  isAnonymous?: boolean;
}

export interface TipResponse {
  tipId: string;
  transactionId: string;
  amount: number;
  fee: number;
  newBalance: number;
}

// Suggested tip amounts (in cents)
export const SUGGESTED_TIP_AMOUNTS = [100, 300, 500, 1000, 2000, 5000]; // $1, $3, $5, $10, $20, $50

// ============================================================================
// PAYOUT TYPES
// ============================================================================

export interface Payout {
  id: string;
  userId: string;
  amount: number; // In cents
  fee: number; // Transfer fee
  netAmount: number; // Amount sent to bank
  status: PayoutStatus;
  stripeTransferId: string | null;
  stripePayoutId: string | null;
  bankAccountLast4: string | null;
  requestedAt: Date;
  approvedAt: Date | null;
  paidAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
  approvedBy: string | null; // Admin user ID
  notes: string | null;
  
  // Relations (optional)
  user?: {
    id: string;
    username: string;
    displayName: string;
    email: string;
  };
}

export interface PayoutRequest {
  amount: number;
  notes?: string;
}

export interface PayoutResponse {
  payoutId: string;
  amount: number;
  fee: number;
  netAmount: number;
  estimatedArrival: Date;
}

export interface PayoutSettings {
  minimumPayoutAmount: number; // In cents
  maximumPayoutAmount: number; // In cents
  payoutFeePercentage: number; // e.g., 0.25 for 0.25%
  payoutFeeFixed: number; // Fixed fee in cents
  autoPayoutEnabled: boolean;
  autoPayoutThreshold: number; // Auto payout when balance reaches this
  payoutSchedule: 'manual' | 'daily' | 'weekly' | 'monthly';
}

// Default payout settings
export const DEFAULT_PAYOUT_SETTINGS: PayoutSettings = {
  minimumPayoutAmount: 2000, // $20
  maximumPayoutAmount: 1000000, // $10,000 per payout
  payoutFeePercentage: 0.25, // 0.25%
  payoutFeeFixed: 25, // $0.25
  autoPayoutEnabled: false,
  autoPayoutThreshold: 10000, // $100
  payoutSchedule: 'manual',
};

// ============================================================================
// STRIPE CONNECT TYPES
// ============================================================================

export interface StripeConnectAccount {
  id: string;
  userId: string;
  stripeAccountId: string;
  accountStatus: StripeAccountStatus;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requiresAction: boolean;
  requirementsDue: string[];
  country: string;
  currency: string;
  bankAccountLast4: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StripeOnboardingResponse {
  accountId: string;
  onboardingUrl: string;
  expiresAt: Date;
}

export interface StripeAccountDetails {
  accountId: string;
  accountStatus: StripeAccountStatus;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requiresAction: boolean;
  requirementsDue: string[];
  email: string | null;
  businessName: string | null;
  country: string;
  currency: string;
  defaultCurrency: string;
  bankAccounts: Array<{
    id: string;
    last4: string;
    bankName: string;
    currency: string;
    status: string;
  }>;
  capabilities: {
    cardPayments: string;
    transfers: string;
  };
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface EarningsAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  totalEarnings: number;
  totalFees: number;
  netEarnings: number;
  earningsByType: Array<{
    type: TransactionType;
    amount: number;
    count: number;
    percentage: number;
  }>;
  earningsOverTime: Array<{
    date: Date;
    amount: number;
    count: number;
  }>;
  topEarningPosts: Array<{
    postId: string;
    amount: number;
    tipCount: number;
    post?: {
      id: string;
      type: string;
      thumbnailUrl: string | null;
      content: string;
    };
  }>;
  topTippers: Array<{
    userId: string;
    totalAmount: number;
    tipCount: number;
    user?: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl: string | null;
    };
  }>;
}

export interface SpendingAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  totalSpending: number;
  spendingByType: Array<{
    type: TransactionType;
    amount: number;
    count: number;
    percentage: number;
  }>;
  spendingOverTime: Array<{
    date: Date;
    amount: number;
    count: number;
  }>;
  topRecipients: Array<{
    userId: string;
    totalAmount: number;
    tipCount: number;
    user?: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl: string | null;
    };
  }>;
}

// ============================================================================
// PLATFORM FEES
// ============================================================================

export interface PlatformFeeConfig {
  tipFeePercentage: number; // e.g., 0.15 for 15%
  paywallFeePercentage: number;
  gigFeePercentage: number;
  minimumFee: number; // Minimum fee in cents
}

export const DEFAULT_PLATFORM_FEES: PlatformFeeConfig = {
  tipFeePercentage: 0.15, // 15% on tips
  paywallFeePercentage: 0.20, // 20% on paywall content
  gigFeePercentage: 0.15, // 15% on gig payments
  minimumFee: 10, // $0.10 minimum
};

// Fee calculation helper
export function calculatePlatformFee(
  amount: number,
  feePercentage: number,
  minimumFee: number = DEFAULT_PLATFORM_FEES.minimumFee
): number {
  const calculatedFee = Math.round(amount * feePercentage);
  return Math.max(calculatedFee, minimumFee);
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class InsufficientBalanceError extends Error {
  constructor(required: number, available: number) {
    super(`Insufficient balance. Required: $${required / 100}, Available: $${available / 100}`);
    this.name = 'InsufficientBalanceError';
  }
}

export class PayoutNotAllowedError extends Error {
  constructor(reason: string) {
    super(`Payout not allowed: ${reason}`);
    this.name = 'PayoutNotAllowedError';
  }
}

export class StripeAccountNotSetupError extends Error {
  constructor() {
    super('Stripe account not set up. Please complete onboarding.');
    this.name = 'StripeAccountNotSetupError';
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function parseCurrency(formatted: string): number {
  const cleaned = formatted.replace(/[^0-9.]/g, '');
  return Math.round(parseFloat(cleaned) * 100);
}

export function getTransactionDisplayInfo(transaction: Transaction): {
  icon: string;
  color: string;
  label: string;
  sign: '+' | '-';
} {
  const typeMap: Record<TransactionType, ReturnType<typeof getTransactionDisplayInfo>> = {
    [TransactionType.TIP_RECEIVED]: {
      icon: '💰',
      color: 'green',
      label: 'Tip Received',
      sign: '+',
    },
    [TransactionType.TIP_SENT]: {
      icon: '🎁',
      color: 'orange',
      label: 'Tip Sent',
      sign: '-',
    },
    [TransactionType.PURCHASE]: {
      icon: '💳',
      color: 'blue',
      label: 'Balance Added',
      sign: '+',
    },
    [TransactionType.PAYOUT]: {
      icon: '🏦',
      color: 'purple',
      label: 'Payout',
      sign: '-',
    },
    [TransactionType.PAYWALL_UNLOCK]: {
      icon: '🔓',
      color: 'orange',
      label: 'Content Unlocked',
      sign: '-',
    },
    [TransactionType.GIG_PAYMENT]: {
      icon: '💼',
      color: 'green',
      label: 'Gig Payment',
      sign: '+',
    },
    [TransactionType.GIG_ESCROW]: {
      icon: '🔒',
      color: 'gray',
      label: 'Escrow Hold',
      sign: '-',
    },
    [TransactionType.GIG_RELEASE]: {
      icon: '✅',
      color: 'green',
      label: 'Escrow Released',
      sign: '+',
    },
    [TransactionType.PLATFORM_FEE]: {
      icon: '🏢',
      color: 'gray',
      label: 'Platform Fee',
      sign: '-',
    },
    [TransactionType.REFUND]: {
      icon: '↩️',
      color: 'blue',
      label: 'Refund',
      sign: '+',
    },
    [TransactionType.ADJUSTMENT]: {
      icon: '⚙️',
      color: 'gray',
      label: 'Adjustment',
      sign: '+',
    },
  };

  return typeMap[transaction.type];
}
