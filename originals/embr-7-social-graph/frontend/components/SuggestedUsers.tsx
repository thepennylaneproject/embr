import React, { useEffect } from 'react';
import { useRecommendedUsers } from '../hooks/useUserSearch';
import { FollowButtonCompact } from './FollowButton';
import type { RecommendedUser } from '@embr/shared/types/social.types';

interface SuggestedUsersProps {
  context?: 'general' | 'similar_interests' | 'mutual_connections' | 'trending';
  limit?: number;
  onUserClick?: (user: RecommendedUser) => void;
}

export const SuggestedUsers: React.FC<SuggestedUsersProps> = ({
  context = 'general',
  limit = 5,
  onUserClick,
}) => {
  const { recommendations, loading, loadRecommendations } = useRecommendedUsers();

  useEffect(() => {
    loadRecommendations({ context, limit });
  }, [context, limit, loadRecommendations]);

  if (loading && recommendations.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested for you</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested for you</h3>
      
      <div className="space-y-4">
        {recommendations.map((user) => (
          <div
            key={user.id}
            className="flex items-start gap-3 group cursor-pointer"
            onClick={() => onUserClick?.(user)}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E8998D] to-[#C9ADA7]">
                {user.profile?.avatarUrl ? (
                  <img
                    src={user.profile.avatarUrl}
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              {user.verified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                  <svg className="w-4 h-4 text-[#E8998D]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate group-hover:text-[#E8998D] transition-colors">
                {user.profile?.fullName || user.username}
              </p>
              <p className="text-sm text-gray-500 truncate">@{user.username}</p>
              
              {user.profile?.bio && (
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                  {user.profile.bio}
                </p>
              )}

              {/* Reason for suggestion */}
              {user.reason && (
                <p className="text-xs text-[#E8998D] mt-1">
                  {user.reason}
                  {user.mutualCount && user.mutualCount > 0 && ` (${user.mutualCount})`}
                </p>
              )}

              {/* Stats */}
              {user.stats && (
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span>{user.stats.followers.toLocaleString()} followers</span>
                  {user.stats.posts !== undefined && (
                    <>
                      <span>•</span>
                      <span>{user.stats.posts.toLocaleString()} posts</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Follow Button */}
            <div className="flex-shrink-0">
              <FollowButtonCompact userId={user.id} />
            </div>
          </div>
        ))}
      </div>

      {/* See All Link */}
      {recommendations.length >= limit && (
        <button className="w-full mt-4 py-2 text-[#E8998D] hover:text-[#d88a7e] font-medium text-sm transition-colors">
          See all suggestions
        </button>
      )}
    </div>
  );
};

// Compact version for sidebars
interface SuggestedUsersCompactProps {
  limit?: number;
  onUserClick?: (user: RecommendedUser) => void;
}

export const SuggestedUsersCompact: React.FC<SuggestedUsersCompactProps> = ({
  limit = 3,
  onUserClick,
}) => {
  const { recommendations, loading, loadRecommendations } = useRecommendedUsers();

  useEffect(() => {
    loadRecommendations({ context: 'general', limit });
  }, [limit, loadRecommendations]);

  if (loading || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {recommendations.slice(0, limit).map((user) => (
        <div
          key={user.id}
          onClick={() => onUserClick?.(user)}
          className="flex items-center gap-2 cursor-pointer group"
        >
          {/* Mini Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8998D] to-[#C9ADA7] flex-shrink-0">
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

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#E8998D] transition-colors">
              {user.profile?.fullName || user.username}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.reason}</p>
          </div>

          <FollowButtonCompact userId={user.id} />
        </div>
      ))}
    </div>
  );
};
