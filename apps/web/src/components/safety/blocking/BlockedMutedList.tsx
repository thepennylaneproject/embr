import React, { useEffect, useState } from 'react';
import { UserX, VolumeX, Trash2, AlertCircle } from 'lucide-react';
import { useSafety } from '@/hooks/useSafety';

export function BlockedMutedList() {
  const [activeTab, setActiveTab] = useState<'blocked' | 'muted' | 'keywords'>('blocked');
  
  const {
    blockedUsers,
    mutedUsers,
    mutedKeywords,
    fetchBlockedUsers,
    fetchMutedUsers,
    fetchMutedKeywords,
    unblockUser,
    unmuteUser,
    removeMutedKeyword,
    isLoading,
  } = useSafety();

  useEffect(() => {
    if (activeTab === 'blocked') {
      fetchBlockedUsers();
    } else if (activeTab === 'muted') {
      fetchMutedUsers();
    } else {
      fetchMutedKeywords();
    }
  }, [activeTab]);

  const handleUnblock = async (userId: string) => {
    if (confirm('Are you sure you want to unblock this user?')) {
      await unblockUser(userId);
    }
  };

  const handleUnmute = async (userId: string) => {
    if (confirm('Are you sure you want to unmute this user?')) {
      await unmuteUser(userId);
    }
  };

  const handleRemoveKeyword = async (keywordId: string) => {
    if (confirm('Remove this muted keyword?')) {
      await removeMutedKeyword(keywordId);
    }
  };

  return (
    <div className="rounded-2xl bg-white shadow-sm">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('blocked')}
          className={`flex-1 px-6 py-4 font-medium transition-colors ${
            activeTab === 'blocked'
              ? 'border-b-2 border-[#E8998D] text-[#E8998D]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserX className="mx-auto mb-1 h-5 w-5" />
          Blocked Users
        </button>
        <button
          onClick={() => setActiveTab('muted')}
          className={`flex-1 px-6 py-4 font-medium transition-colors ${
            activeTab === 'muted'
              ? 'border-b-2 border-[#E8998D] text-[#E8998D]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <VolumeX className="mx-auto mb-1 h-5 w-5" />
          Muted Users
        </button>
        <button
          onClick={() => setActiveTab('keywords')}
          className={`flex-1 px-6 py-4 font-medium transition-colors ${
            activeTab === 'keywords'
              ? 'border-b-2 border-[#E8998D] text-[#E8998D]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <AlertCircle className="mx-auto mb-1 h-5 w-5" />
          Muted Keywords
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#E8998D]" />
            <p className="mt-4 text-gray-500">Loading...</p>
          </div>
        ) : (
          <>
            {/* Blocked Users */}
            {activeTab === 'blocked' && (
              <div className="space-y-3">
                {blockedUsers.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <UserX className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <p>You haven't blocked anyone yet</p>
                  </div>
                ) : (
                  blockedUsers.map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={block.user.profile?.avatarUrl || '/default-avatar.png'}
                          alt={block.user.username}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {block.user.profile?.displayName || block.user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{block.user.username}
                          </div>
                          {block.reason && (
                            <div className="mt-1 text-xs text-gray-500">
                              Reason: {block.reason}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnblock(block.user.id)}
                        className="rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Unblock
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Muted Users */}
            {activeTab === 'muted' && (
              <div className="space-y-3">
                {mutedUsers.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <VolumeX className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <p>You haven't muted anyone yet</p>
                  </div>
                ) : (
                  mutedUsers.map((mute) => (
                    <div
                      key={mute.id}
                      className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={mute.user.profile?.avatarUrl || '/default-avatar.png'}
                          alt={mute.user.username}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {mute.user.profile?.displayName || mute.user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{mute.user.username}
                          </div>
                          {mute.expiresAt && (
                            <div className="mt-1 text-xs text-gray-500">
                              Expires: {new Date(mute.expiresAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnmute(mute.user.id)}
                        className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        Unmute
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Muted Keywords */}
            {activeTab === 'keywords' && (
              <div className="space-y-3">
                {mutedKeywords.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <AlertCircle className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <p>No muted keywords</p>
                  </div>
                ) : (
                  mutedKeywords.map((keyword) => (
                    <div
                      key={keyword.id}
                      className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
                    >
                      <div>
                        <div className="font-mono font-medium text-gray-900">
                          {keyword.keyword}
                        </div>
                        {keyword.caseSensitive && (
                          <div className="mt-1 text-xs text-gray-500">
                            Case sensitive
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveKeyword(keyword.id)}
                        className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
