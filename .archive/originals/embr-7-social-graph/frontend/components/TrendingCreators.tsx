import React, { useEffect } from 'react';
import { useTrendingCreators } from '../hooks/useUserSearch';
import { FollowButtonCompact } from './FollowButton';
import type { TrendingCreator } from '@embr/shared/types/social.types';

interface TrendingCreatorsProps {
  timeframe?: 'day' | 'week' | 'month';
  limit?: number;
  showTimeframeToggle?: boolean;
  onCreatorClick?: (creator: TrendingCreator) => void;
}

export const TrendingCreators: React.FC<TrendingCreatorsProps> = ({
  timeframe: initialTimeframe = 'week',
  limit = 10,
  showTimeframeToggle = true,
  onCreatorClick,
}) => {
  const {
    creators,
    loading,
    timeframe,
    changeTimeframe,
    loadTrendingCreators,
  } = useTrendingCreators(initialTimeframe);

  useEffect(() => {
    loadTrendingCreators({ timeframe: initialTimeframe, limit });
  }, [initialTimeframe, limit, loadTrendingCreators]);

  if (loading && creators.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Trending Creators</h2>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="text-2xl font-bold text-gray-300 w-8">{i + 1}</div>
              <div className="w-16 h-16 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      {/* Header with Timeframe Toggle */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Trending Creators</h2>
        
        {showTimeframeToggle && (
          <div className="flex bg-gray-100 rounded-full p-1">
            {['day', 'week', 'month'].map((tf) => (
              <button
                key={tf}
                onClick={() => changeTimeframe(tf as 'day' | 'week' | 'month')}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${timeframe === tf
                    ? 'bg-[#E8998D] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Trending List */}
      <div className="space-y-4">
        {creators.map((creator, index) => (
          <div
            key={creator.id}
            onClick={() => onCreatorClick?.(creator)}
            className="flex items-center gap-4 group cursor-pointer hover:bg-[#F4F1F1] p-3 rounded-xl transition-colors"
          >
            {/* Rank */}
            <div className={`
              text-2xl font-bold w-8 text-center
              ${index === 0 ? 'text-[#E8998D]' :
                index === 1 ? 'text-[#C9ADA7]' :
                index === 2 ? 'text-[#9A8C98]' :
                'text-gray-400'}
            `}>
              {index + 1}
            </div>

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8998D] to-[#C9ADA7]">
                {creator.profile?.avatarUrl ? (
                  <img
                    src={creator.profile.avatarUrl}
                    alt={creator.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                    {creator.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Trending Badge */}
              <div className="absolute -top-1 -right-1 bg-[#E8998D] text-white rounded-full p-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>

              {creator.verified && (
                <div className="absolute -bottom-1 -left-1 bg-white rounded-full p-0.5">
                  <svg className="w-5 h-5 text-[#E8998D]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Creator Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 truncate group-hover:text-[#E8998D] transition-colors">
                {creator.profile?.fullName || creator.username}
              </p>
              <p className="text-sm text-gray-500 truncate">@{creator.username}</p>
              
              {creator.profile?.bio && (
                <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                  {creator.profile.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-3 mt-2 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span>{creator.stats.followers.toLocaleString()}</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1 text-[#E8998D]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  <span>{creator.stats.recentEngagement.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Follow Button */}
            <div className="flex-shrink-0">
              <FollowButtonCompact userId={creator.id} />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && creators.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📈</div>
          <p className="text-gray-500">No trending creators found</p>
        </div>
      )}
    </div>
  );
};

// Compact version for sidebars
interface TrendingCreatorsCompactProps {
  limit?: number;
  onCreatorClick?: (creator: TrendingCreator) => void;
}

export const TrendingCreatorsCompact: React.FC<TrendingCreatorsCompactProps> = ({
  limit = 5,
  onCreatorClick,
}) => {
  const { creators, loading, loadTrendingCreators } = useTrendingCreators('week');

  useEffect(() => {
    loadTrendingCreators({ timeframe: 'week', limit });
  }, [limit, loadTrendingCreators]);

  if (loading || creators.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {creators.slice(0, limit).map((creator, index) => (
        <div
          key={creator.id}
          onClick={() => onCreatorClick?.(creator)}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <span className="text-sm font-bold text-gray-400 w-5">#{index + 1}</span>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8998D] to-[#C9ADA7] flex-shrink-0">
            {creator.profile?.avatarUrl ? (
              <img
                src={creator.profile.avatarUrl}
                alt={creator.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold">
                {creator.username[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#E8998D] transition-colors">
              {creator.profile?.fullName || creator.username}
            </p>
            <p className="text-xs text-[#E8998D]">
              {creator.stats.recentEngagement.toLocaleString()} 🔥
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
