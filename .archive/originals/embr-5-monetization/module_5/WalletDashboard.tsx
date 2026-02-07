/**
 * Wallet Dashboard Component
 * Shows balance, transactions, and payout options
 * Design: Muted coral/earth tones (#E8998D, #C9ADA7, #9A8C98)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency, getTransactionDisplayInfo } from '@embr/shared/types/monetization.types';
import { useWallet } from '../hooks/useWallet';
import { TransactionList } from '../components/TransactionList';
import { PayoutRequestModal } from '../components/PayoutRequestModal';
import { StripeConnectBanner } from '../components/StripeConnectBanner';

export function WalletDashboard() {
  const {
    balance,
    transactions,
    payouts,
    loading,
    error,
    refreshBalance,
    refreshTransactions,
    requestPayout,
  } = useWallet();

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    refreshBalance();
    refreshTransactions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-embr-coral border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Wallet</h1>
          <p className="text-slate-600">Manage your earnings and payouts</p>
        </div>

        {/* Stripe Connect Banner */}
        {!balance?.canRequestPayout && (
          <StripeConnectBanner
            kycStatus={balance?.kycStatus}
            accountStatus={balance?.stripeAccountStatus}
          />
        )}

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Available Balance */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-600">Available Balance</span>
              <div className="w-10 h-10 rounded-full bg-embr-coral/10 flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {formatCurrency(balance?.balance || 0)}
            </div>
            <button
              onClick={() => setShowPayoutModal(true)}
              disabled={!balance?.canRequestPayout || (balance?.balance || 0) < 2000}
              className="w-full mt-4 px-4 py-2.5 bg-embr-coral hover:bg-embr-coral/90 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Request Payout
            </button>
          </div>

          {/* Pending Balance */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-600">Pending</span>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-xl">⏳</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {formatCurrency(balance?.pendingBalance || 0)}
            </div>
            <p className="text-sm text-slate-500 mt-4">
              Funds in escrow or processing
            </p>
          </div>

          {/* Lifetime Earned */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-600">Lifetime Earned</span>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {formatCurrency(balance?.lifetimeEarned || 0)}
            </div>
            <p className="text-sm text-slate-500 mt-4">
              Total earnings all-time
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <nav className="flex">
              {['Transactions', 'Payouts', 'Analytics'].map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    tab === 'Transactions'
                      ? 'border-embr-coral text-embr-coral'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Transaction List */}
            <TransactionList transactions={transactions} loading={loading} />
          </div>
        </div>

        {/* Payout Request Modal */}
        {showPayoutModal && (
          <PayoutRequestModal
            availableBalance={balance?.balance || 0}
            onClose={() => setShowPayoutModal(false)}
            onSubmit={async (amount, notes) => {
              await requestPayout(amount, notes);
              setShowPayoutModal(false);
              refreshBalance();
            }}
          />
        )}
      </div>
    </div>
  );
}
