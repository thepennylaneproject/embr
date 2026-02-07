/**
 * useWallet Hook
 * React hook for wallet operations
 */

import { useState, useCallback } from 'react';
import type {
  WalletSummary,
  Transaction,
  Payout,
  TipResponse,
  PayoutResponse,
  TransactionListResponse,
} from '@embr/shared/types/monetization.types';

interface UseWalletReturn {
  balance: WalletSummary | null;
  transactions: Transaction[];
  payouts: Payout[];
  loading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshPayouts: () => Promise<void>;
  sendTip: (
    recipientId: string,
    amount: number,
    postId?: string,
    message?: string,
    isAnonymous?: boolean,
  ) => Promise<TipResponse>;
  requestPayout: (amount: number, notes?: string) => Promise<PayoutResponse>;
  createStripeAccount: () => Promise<{ accountId: string; onboardingUrl: string }>;
  refreshStripeLink: () => Promise<{ onboardingUrl: string }>;
}

export function useWallet(): UseWalletReturn {
  const [balance, setBalance] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      setBalance(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/wallet/transactions?page=1&perPage=50', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data: TransactionListResponse = await response.json();
      setTransactions(data.transactions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPayouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/wallet/payouts?page=1&perPage=50', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payouts');
      }

      const data = await response.json();
      setPayouts(data.payouts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendTip = useCallback(
    async (
      recipientId: string,
      amount: number,
      postId?: string,
      message?: string,
      isAnonymous?: boolean,
    ): Promise<TipResponse> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/wallet/tip', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            recipientId,
            amount,
            postId,
            message,
            isAnonymous,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to send tip');
        }

        const data: TipResponse = await response.json();

        // Refresh balance and transactions after successful tip
        await Promise.all([refreshBalance(), refreshTransactions()]);

        return data;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshBalance, refreshTransactions],
  );

  const requestPayout = useCallback(
    async (amount: number, notes?: string): Promise<PayoutResponse> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/wallet/payout/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            amount,
            notes,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to request payout');
        }

        const data: PayoutResponse = await response.json();

        // Refresh after successful payout request
        await Promise.all([refreshBalance(), refreshPayouts()]);

        return data;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshBalance, refreshPayouts],
  );

  const createStripeAccount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/wallet/connect/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create Stripe account');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStripeLink = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/wallet/connect/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to refresh Stripe link');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    balance,
    transactions,
    payouts,
    loading,
    error,
    refreshBalance,
    refreshTransactions,
    refreshPayouts,
    sendTip,
    requestPayout,
    createStripeAccount,
    refreshStripeLink,
  };
}
