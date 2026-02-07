import React, { useState } from 'react';
import { X, AlertTriangle, Flag, Shield } from 'lucide-react';
import { ReportReason, ReportEntityType } from '@shared/types/safety.types';
import { useSafety } from '@/hooks/useSafety';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: ReportEntityType;
  entityId: string;
  entityPreview?: {
    content?: string;
    username?: string;
    avatarUrl?: string;
  };
}

const REPORT_REASONS = [
  { value: ReportReason.SPAM, label: 'Spam', description: 'Unsolicited promotional content' },
  { value: ReportReason.HARASSMENT, label: 'Harassment', description: 'Bullying or targeted attacks' },
  { value: ReportReason.ILLEGAL, label: 'Illegal Content', description: 'Content that violates laws' },
  { value: ReportReason.NSFW_UNLABELED, label: 'Unlabeled NSFW', description: 'Adult content without warning' },
  { value: ReportReason.COPYRIGHT, label: 'Copyright', description: 'Intellectual property violation' },
  { value: ReportReason.IMPERSONATION, label: 'Impersonation', description: 'Pretending to be someone else' },
  { value: ReportReason.SELF_HARM, label: 'Self-Harm', description: 'Content promoting self-harm' },
  { value: ReportReason.OTHER, label: 'Other', description: 'Another issue not listed' },
];

export function ReportModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityPreview,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { createReport, isSubmitting } = useSafety();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) return;

    try {
      await createReport({
        entityType,
        entityId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });

      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setSelectedReason(null);
        setDescription('');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Report Submitted</h2>
          <p className="text-gray-600">
            Thank you for helping keep Embr safe. We'll review your report shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Flag className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Report {entityType}</h2>
              <p className="text-sm text-gray-500">Help us understand the issue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content Preview */}
        {entityPreview && (
          <div className="border-b border-gray-200 bg-gray-50 p-6">
            <p className="mb-2 text-sm font-medium text-gray-700">You're reporting:</p>
            {entityType === ReportEntityType.USER && entityPreview.username ? (
              <div className="flex items-center gap-3">
                {entityPreview.avatarUrl && (
                  <img
                    src={entityPreview.avatarUrl}
                    alt={entityPreview.username}
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <span className="font-medium text-gray-900">@{entityPreview.username}</span>
              </div>
            ) : entityPreview.content ? (
              <div className="rounded-lg bg-white p-3 text-sm text-gray-700">
                {entityPreview.content.length > 200
                  ? `${entityPreview.content.substring(0, 200)}...`
                  : entityPreview.content}
              </div>
            ) : null}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Reason Selection */}
          <div className="p-6">
            <label className="mb-4 block text-sm font-medium text-gray-900">
              What's the issue?
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  type="button"
                  onClick={() => setSelectedReason(reason.value)}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                    selectedReason === reason.value
                      ? 'border-[#E8998D] bg-[#E8998D]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{reason.label}</div>
                      <div className="text-sm text-gray-500">{reason.description}</div>
                    </div>
                    {selectedReason === reason.value && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8998D]">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Additional Details */}
            {selectedReason && (
              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Additional details (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any additional context that might help us review this report..."
                  className="w-full rounded-xl border-2 border-gray-200 p-4 text-gray-900 placeholder-gray-400 focus:border-[#E8998D] focus:outline-none"
                  rows={4}
                  maxLength={1000}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {description.length}/1000 characters
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-200 p-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <AlertTriangle className="h-4 w-4" />
              <span>False reports may result in account restrictions</span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedReason || isSubmitting}
                className="rounded-full bg-[#E8998D] px-6 py-2.5 font-medium text-white hover:bg-[#d6887c] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
