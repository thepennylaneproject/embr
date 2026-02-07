import { useState, useCallback } from 'react';
import { tipsApi } from '../shared/api/monetization.api';
import type {
  Tip,
  CreateTipRequest,
  TipStats,
  TipAmountPreset,
} from '../shared/types/monetization.types';

interface UseTipsReturn {
  createTip: (request: CreateTipRequest) => Promise<Tip>;
  getTipStats: (startDate?: string, endDate?: string) => Promise<TipStats>;
  isCreating: boolean;
  error: string | null;
}

const TIP_PRESET_AMOUNTS: Record<TipAmountPreset, number> = {
  [TipAmountPreset.SMALL]: 1,
  [TipAmountPreset.MEDIUM]: 5,
  [TipAmountPreset.LARGE]: 10,
  [TipAmountPreset.CUSTOM]: 0,
};

export function useTips(): UseTipsReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTip = useCallback(async (request: CreateTipRequest): Promise<Tip> => {
    setIsCreating(true);
    setError(null);

    try {
      // If preset is provided, use preset amount
      if (request.preset && request.preset !== TipAmountPreset.CUSTOM) {
        request.amount = TIP_PRESET_AMOUNTS[request.preset];
      }

      const tip = await tipsApi.create(request);
      return tip;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create tip';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  }, []);

  const getTipStats = useCallback(
    async (startDate?: string, endDate?: string): Promise<TipStats> => {
      try {
        setError(null);
        const stats = await tipsApi.getStats(startDate, endDate);
        return stats;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to load tip stats';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [],
  );

  return {
    createTip,
    getTipStats,
    isCreating,
    error,
  };
}

export { TIP_PRESET_AMOUNTS };
