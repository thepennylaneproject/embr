import { useState, useCallback, useEffect } from 'react';
import { stripeConnectApi } from '../shared/api/monetization.api';
import type {
  StripeConnectAccountStatus,
  StripeConnectAccountDetails,
} from '../shared/types/monetization.types';

interface UseStripeConnectReturn {
  status: StripeConnectAccountStatus | null;
  details: StripeConnectAccountDetails | null;
  isLoading: boolean;
  error: string | null;
  createAccount: (email: string, country?: string) => Promise<string>;
  getAccountLink: (returnUrl: string, refreshUrl: string) => Promise<string>;
  completeOnboarding: () => Promise<void>;
  refetchStatus: () => Promise<void>;
}

export function useStripeConnect(): UseStripeConnectReturn {
  const [status, setStatus] = useState<StripeConnectAccountStatus | null>(null);
  const [details, setDetails] = useState<StripeConnectAccountDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetchStatus = useCallback(async () => {
    try {
      setError(null);
      const data = await stripeConnectApi.getStatus();
      setStatus(data);

      // If account exists and is onboarded, fetch details
      if (data.hasAccount && data.isOnboarded) {
        try {
          const detailsData = await stripeConnectApi.getDetails();
          setDetails(detailsData);
        } catch (err) {
          console.error('Error fetching account details:', err);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load account status');
      console.error('Error fetching Stripe Connect status:', err);
    }
  }, []);

  const createAccount = useCallback(
    async (email: string, country: string = 'US'): Promise<string> => {
      setError(null);
      setIsLoading(true);

      try {
        const response = await stripeConnectApi.createAccount({ email, country });
        await refetchStatus();
        return response.onboardingUrl;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to create Stripe account';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [refetchStatus],
  );

  const getAccountLink = useCallback(
    async (returnUrl: string, refreshUrl: string): Promise<string> => {
      setError(null);

      try {
        const response = await stripeConnectApi.getAccountLink(returnUrl, refreshUrl);
        return response.url;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to get account link';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [],
  );

  const completeOnboarding = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      await stripeConnectApi.completeOnboarding();
      await refetchStatus();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to complete onboarding';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [refetchStatus]);

  // Initial load
  useEffect(() => {
    const loadStatus = async () => {
      setIsLoading(true);
      await refetchStatus();
      setIsLoading(false);
    };

    loadStatus();
  }, [refetchStatus]);

  return {
    status,
    details,
    isLoading,
    error,
    createAccount,
    getAccountLink,
    completeOnboarding,
    refetchStatus,
  };
}
