/**
 * Tip Button and Modal Component
 * Allows users to send tips on posts and profiles
 * Design: Muted coral/earth tones
 */

'use client';

import React, { useState } from 'react';
import { SUGGESTED_TIP_AMOUNTS, formatCurrency } from '@embr/shared/types/monetization.types';

interface TipButtonProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  postId?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon';
  onTipSent?: () => void;
}

export function TipButton({
  recipientId,
  recipientName,
  recipientAvatar,
  postId,
  size = 'md',
  variant = 'button',
  onTipSent,
}: TipButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <>
      {variant === 'button' ? (
        <button
          onClick={() => setShowModal(true)}
          className={`${sizeClasses[size]} bg-embr-coral hover:bg-embr-coral/90 text-white rounded-lg font-medium transition-colors flex items-center gap-2`}
        >
          <span>💰</span>
          <span>Tip</span>
        </button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-embr-coral/10 flex items-center justify-center transition-colors group"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">💰</span>
        </button>
      )}

      {showModal && (
        <TipModal
          recipientId={recipientId}
          recipientName={recipientName}
          recipientAvatar={recipientAvatar}
          postId={postId}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            onTipSent?.();
          }}
        />
      )}
    </>
  );
}

interface TipModalProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  postId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

function TipModal({
  recipientId,
  recipientName,
  recipientAvatar,
  postId,
  onClose,
  onSuccess,
}: TipModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const amount = customAmount ? Math.round(parseFloat(customAmount) * 100) : selectedAmount;
  const fee = amount ? Math.max(Math.round(amount * 0.15), 10) : 0;
  const recipientReceives = amount ? amount - fee : 0;

  const handleSubmit = async () => {
    if (!amount || amount < 100) {
      setError('Minimum tip amount is $1.00');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/wallet/tip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId,
          amount,
          postId,
          message: message.trim() || undefined,
          isAnonymous,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send tip');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Send a Tip</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <span className="text-xl text-slate-500">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Recipient */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            {recipientAvatar ? (
              <img
                src={recipientAvatar}
                alt={recipientName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-embr-coral/20 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
            )}
            <div>
              <p className="font-medium text-slate-900">{recipientName}</p>
              <p className="text-sm text-slate-500">@{recipientId.slice(0, 8)}</p>
            </div>
          </div>

          {/* Quick Amounts */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Select Amount
            </label>
            <div className="grid grid-cols-3 gap-3">
              {SUGGESTED_TIP_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    selectedAmount === amt && !customAmount
                      ? 'border-embr-coral bg-embr-coral/5 text-embr-coral'
                      : 'border-slate-200 text-slate-700 hover:border-embr-coral/50'
                  }`}
                >
                  {formatCurrency(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Or Enter Custom Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                $
              </span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-embr-coral focus:ring-2 focus:ring-embr-coral/20 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Add a Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Say something nice..."
              rows={3}
              maxLength={200}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-embr-coral focus:ring-2 focus:ring-embr-coral/20 outline-none transition-colors resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-slate-500">
                {message.length}/200 characters
              </span>
            </div>
          </div>

          {/* Anonymous Option */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-embr-coral focus:ring-embr-coral"
            />
            <span className="text-sm text-slate-700">Send anonymously</span>
          </label>

          {/* Breakdown */}
          {amount && amount >= 100 && (
            <div className="p-4 bg-slate-50 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tip amount</span>
                <span className="font-medium text-slate-900">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Platform fee (15%)</span>
                <span className="font-medium text-slate-900">-{formatCurrency(fee)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between">
                <span className="font-medium text-slate-900">Creator receives</span>
                <span className="font-bold text-embr-coral">
                  {formatCurrency(recipientReceives)}
                </span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!amount || amount < 100 || loading}
            className="w-full px-6 py-3.5 bg-embr-coral hover:bg-embr-coral/90 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>💰</span>
                <span>Send {amount ? formatCurrency(amount) : 'Tip'}</span>
              </>
            )}
          </button>

          <p className="text-xs text-center text-slate-500">
            By sending a tip, you agree to our terms and understand that all tips are final.
          </p>
        </div>
      </div>
    </div>
  );
}
