/**
 * Monetization API Client
 * Handles tips, wallet, payouts, and Stripe Connect operations
 */

import { apiClient } from '@/lib/api/client';
import type {
  Tip,
  CreateTipRequest,
  TipStats,
  WalletBalance,
  WalletStats,
  TransactionsResponse,
  TransactionType,
  Payout,
  CreatePayoutRequest,
  PayoutStats,
  StripeConnectAccountStatus,
  StripeConnectAccountDetails,
  CreateStripeAccountRequest,
  CreateStripeAccountResponse,
  AccountLinkResponse,
} from '../types/monetization.types';

// ============================================================================
// TIPS API
// ============================================================================

export const tipsApi = {
  /**
   * Create a new tip
   */
  create: async (request: CreateTipRequest): Promise<Tip> => {
    const { data } = await apiClient.post('/tips', request);
    return data;
  },

  /**
   * Get tips received
   */
  getReceived: async (page = 1, limit = 20): Promise<{ tips: Tip[]; pagination: any }> => {
    const { data } = await apiClient.get('/tips/received', {
      params: { page, limit },
    });
    return data;
  },

  /**
   * Get tips sent
   */
  getSent: async (page = 1, limit = 20): Promise<{ tips: Tip[]; pagination: any }> => {
    const { data } = await apiClient.get('/tips/sent', {
      params: { page, limit },
    });
    return data;
  },

  /**
   * Get tip statistics
   */
  getStats: async (startDate?: string, endDate?: string): Promise<TipStats> => {
    const { data } = await apiClient.get('/tips/stats', {
      params: { startDate, endDate },
    });
    return data;
  },
};

// ============================================================================
// WALLET API
// ============================================================================

export const walletApi = {
  /**
   * Get wallet balance
   */
  getBalance: async (): Promise<WalletBalance> => {
    const { data } = await apiClient.get('/wallet/balance');
    return data;
  },

  /**
   * Get wallet statistics
   */
  getStats: async (): Promise<WalletStats> => {
    const { data } = await apiClient.get('/wallet/stats');
    return data;
  },

  /**
   * Get transaction history
   */
  getTransactions: async (filters?: {
    type?: TransactionType;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<TransactionsResponse> => {
    const { data } = await apiClient.get('/wallet/transactions', {
      params: filters,
    });
    return data;
  },
};

// ============================================================================
// PAYOUTS API
// ============================================================================

export const payoutsApi = {
  /**
   * Create a payout request
   */
  createRequest: async (request: CreatePayoutRequest): Promise<Payout> => {
    const { data } = await apiClient.post('/payouts/request', request);
    return data;
  },

  /**
   * Get payout history
   */
  getHistory: async (page = 1, limit = 20): Promise<{ payouts: Payout[]; pagination: any }> => {
    const { data } = await apiClient.get('/payouts/history', {
      params: { page, limit },
    });
    return data;
  },

  /**
   * Get payouts with filters (alias for getHistory)
   */
  getPayouts: async (params: { page?: number; limit?: number; status?: string }): Promise<{ payouts: Payout[]; pagination: any }> => {
    const { data } = await apiClient.get('/payouts/history', {
      params,
    });
    return data;
  },

  /**
   * Get payout by ID
   */
  getById: async (payoutId: string): Promise<Payout> => {
    const { data } = await apiClient.get(`/payouts/${payoutId}`);
    return data;
  },

  /**
   * Get payout statistics
   */
  getStats: async (): Promise<PayoutStats> => {
    const { data } = await apiClient.get('/payouts/stats');
    return data;
  },

  /**
   * Cancel a pending payout request
   */
  cancel: async (payoutId: string): Promise<Payout> => {
    const { data } = await apiClient.post(`/payouts/${payoutId}/cancel`);
    return data;
  },
};

// ============================================================================
// STRIPE CONNECT API
// ============================================================================

export const stripeConnectApi = {
  /**
   * Get Stripe Connect account status
   */
  getStatus: async (): Promise<StripeConnectAccountStatus> => {
    const { data } = await apiClient.get('/stripe-connect/status');
    return data;
  },

  /**
   * Get Stripe Connect account details
   */
  getDetails: async (): Promise<StripeConnectAccountDetails> => {
    const { data } = await apiClient.get('/stripe-connect/details');
    return data;
  },

  /**
   * Create a new Stripe Connect account
   */
  createAccount: async (request: CreateStripeAccountRequest): Promise<CreateStripeAccountResponse> => {
    const { data } = await apiClient.post('/stripe-connect/create-account', request);
    return data;
  },

  /**
   * Get account link for onboarding
   */
  getAccountLink: async (returnUrl: string, refreshUrl: string): Promise<AccountLinkResponse> => {
    const { data } = await apiClient.post('/stripe-connect/account-link', {
      returnUrl,
      refreshUrl,
    });
    return data;
  },

  /**
   * Complete onboarding process
   */
  completeOnboarding: async (): Promise<{ success: boolean }> => {
    const { data } = await apiClient.post('/stripe-connect/complete-onboarding');
    return data;
  },

  /**
   * Get dashboard login link
   */
  getDashboardLink: async (): Promise<{ url: string }> => {
    const { data } = await apiClient.get('/stripe-connect/dashboard-link');
    return data;
  },
};
