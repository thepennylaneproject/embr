import React, { useEffect } from 'react';
import { useMutualConnections } from '@/hooks/useFollow';

interface MutualConnectionsProps {
  userId: string;
  limit?: number;
  onUserClick?: (userId: string) => void;
}

export const MutualConnections: React.FC<MutualConnectionsProps> = ({
  userId,
  limit = 5,
  onUserClick,
}) => {
  const { mutualConnections, loading, loadMutualConnections } = useMutualConnections(userId);

  useEffect(() => {
    loadMutualConnections(limit);
  }, [userId, limit, loadMutualConnections]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!mutualConnections) {
    return null;
  }

  const totalMutuals = mutualConnections.count.following + mutualConnections.count.followers;

  if (totalMutuals === 0) {
    return null;
  }

  // Show mutual followers first, then mutual following
  const displayUsers = [
    ...mutualConnections.mutualFollowers.slice(0, 3),
    ...mutualConnections.mutualFollowing.slice(0, Math.max(0, 3 - mutualConnections.mutualFollowers.length)),
  ].slice(0, 3);

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <p className="text-sm text-gray-600 mb-3">
        {totalMutuals === 1 ? (
          <>Followed by <span className="font-semibold text-gray-900">1 connection</span></>
        ) : (
          <>Followed by <span className="font-semibold text-gray-900">{totalMutuals} mutual connections</span></>
        )}
      </p>

      <div className="flex items-center gap-1">
        {/* Avatar Stack */}
        <div className="flex -space-x-2">
          {displayUsers.map((user, index) => (
            <button
              key={user.id}
              onClick={() => onUserClick?.(user.id)}
              className="relative group"
              style={{ zIndex: 10 - index }}
            >
              <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-[#E8998D] to-[#C9ADA7]">
                {user.profile?.avatarUrl ? (
                  <img
                    src={user.profile.avatarUrl}
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {user.username}
              </div>
            </button>
          ))}
        </div>

        {/* Additional count */}
        {totalMutuals > 3 && (
          <span className="ml-2 text-sm text-gray-500">
            +{totalMutuals - 3} more
          </span>
        )}
      </div>

      {/* Names */}
      {displayUsers.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          {displayUsers.slice(0, 2).map((user, index) => (
            <span key={user.id}>
              <button
                onClick={() => onUserClick?.(user.id)}
                className="font-medium text-gray-900 hover:text-[#E8998D] transition-colors"
              >
                {user.username}
              </button>
              {index === 0 && displayUsers.length > 1 && ', '}
            </span>
          ))}
          {displayUsers.length > 2 && (
            <span> and {displayUsers.length - 2} other{displayUsers.length > 3 ? 's' : ''}</span>
          )}
        </div>
      )}
    </div>
  );
};

// Inline version for profile pages
interface MutualConnectionsInlineProps {
  userId: string;
  onViewAll?: () => void;
}

export const MutualConnectionsInline: React.FC<MutualConnectionsInlineProps> = ({
  userId,
  onViewAll,
}) => {
  const { mutualConnections, loading, loadMutualConnections } = useMutualConnections(userId);

  useEffect(() => {
    loadMutualConnections(3);
  }, [userId, loadMutualConnections]);

  if (loading || !mutualConnections) {
    return null;
  }

  const totalMutuals = mutualConnections.count.following + mutualConnections.count.followers;

  if (totalMutuals === 0) {
    return null;
  }

  const displayUsers = [
    ...mutualConnections.mutualFollowers.slice(0, 2),
    ...mutualConnections.mutualFollowing.slice(0, Math.max(0, 2 - mutualConnections.mutualFollowers.length)),
  ].slice(0, 2);

  return (
    <button
      onClick={onViewAll}
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
    >
      <div className="flex -space-x-2">
        {displayUsers.map((user, index) => (
          <div
            key={user.id}
            className="w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br from-[#E8998D] to-[#C9ADA7]"
            style={{ zIndex: 10 - index }}
          >
            {user.profile?.avatarUrl ? (
              <img
                src={user.profile.avatarUrl}
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold">
                {user.username[0].toUpperCase()}
              </div>
            )}
          </div>
        ))}
      </div>
      <span>
        Followed by{' '}
        {displayUsers.map((u, i) => (
          <span key={u.id}>
            <span className="font-semibold">{u.username}</span>
            {i < displayUsers.length - 1 && ', '}
          </span>
        ))}
        {totalMutuals > 2 && ` and ${totalMutuals - 2} others you follow`}
      </span>
    </button>
  );
};
