import React, { useEffect, useState } from 'react';
import { Flag, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useSafety } from '../../hooks/useSafety';
import { ReportStatus } from '@embr/types/safety';

export function ModerationDashboard() {
  const [activeFilter, setActiveFilter] = useState<ReportStatus | 'all'>('all');
  
  const {
    reports,
    queueStats,
    fetchReports,
    fetchQueueStats,
    updateReport,
    isLoading,
  } = useSafety();

  useEffect(() => {
    fetchReports({ status: activeFilter === 'all' ? undefined : activeFilter });
    fetchQueueStats();
  }, [activeFilter]);

  const handleReportAction = async (reportId: string, action: 'approve' | 'dismiss') => {
    await updateReport(reportId, {
      status: action === 'approve' ? ReportStatus.ACTION_TAKEN : ReportStatus.DISMISSED,
      action: action === 'approve' ? 'Content removed' : 'No violation found',
    });
    
    // Refresh reports
    fetchReports({ status: activeFilter === 'all' ? undefined : activeFilter });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Pending</span>
            <Clock className="h-5 w-5 text-[#E8998D]" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {queueStats?.total.pending || 0}
          </div>
        </div>
        
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Under Review</span>
            <AlertTriangle className="h-5 w-5 text-[#C9ADA7]" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {queueStats?.total.underReview || 0}
          </div>
        </div>
        
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Action Taken</span>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {queueStats?.total.actionTaken || 0}
          </div>
        </div>
        
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Dismissed</span>
            <XCircle className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {queueStats?.total.dismissed || 0}
          </div>
        </div>
      </div>

      {/* Reports Queue */}
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Reports Queue</h2>
          
          {/* Filters */}
          <div className="mt-4 flex gap-2">
            {(['all', 'pending', 'under_review', 'action_taken', 'dismissed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter as any)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-[#E8998D] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#E8998D]" />
            </div>
          ) : reports.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Flag className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p>No reports found</p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="p-6">
                <div className="flex gap-4">
                  <img
                    src={report.reporter.profile?.avatarUrl || '/default-avatar.png'}
                    alt={report.reporter.username}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">
                          @{report.reporter.username}
                        </span>
                        <span className="text-gray-500"> reported </span>
                        <span className="font-medium text-gray-900">
                          {report.reportedUser ? `@${report.reportedUser.username}` : 'content'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                        {report.reason}
                      </span>
                    </div>
                    
                    {report.description && (
                      <p className="mb-4 text-gray-700">{report.description}</p>
                    )}
                    
                    {report.reportedPost && (
                      <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm text-gray-700">{report.reportedPost.content}</p>
                      </div>
                    )}
                    
                    {report.status === ReportStatus.PENDING && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleReportAction(report.id, 'approve')}
                          className="rounded-full bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                        >
                          Take Action
                        </button>
                        <button
                          onClick={() => handleReportAction(report.id, 'dismiss')}
                          className="rounded-full bg-gray-200 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                    
                    {report.status !== ReportStatus.PENDING && (
                      <div className={`mt-2 text-sm ${
                        report.status === ReportStatus.ACTION_TAKEN
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}>
                        Status: {report.status.replace('_', ' ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
