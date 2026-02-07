/**
 * Social Types
 * Types for following, discovery, and user search
 */

// ============================================================================
// USER INTERFACES
// ============================================================================

export interface FollowUser {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    bio?: string;
    verified?: boolean;
  };
}

export interface FollowCounts {
  followerCount: number;
  followingCount: number;
}

export interface FollowStatus {
  isFollowing: boolean;
  isFollowedBy: boolean;
  isMutual: boolean;
}

export interface MutualConnections {
  mutualFollowers: {
    id: string;
    username: string;
    displayName: string;
    profile?: {
      avatarUrl?: string;
    };
  }[];
  mutualFollowing: {
    id: string;
    username: string;
    displayName: string;
    profile?: {
      avatarUrl?: string;
    };
  }[];
  count: {
    followers: number;
    following: number;
  };
}

export interface SearchUser {
  id: string;
  username: string;
  displayName: string;
  profile?: {
    avatarUrl?: string;
    bio?: string;
    location?: string;
    isVerified?: boolean;
    followerCount?: number;
  };
  stats?: {
    followers: number;
    posts?: number;
  };
  isFollowing?: boolean;
  matchScore?: number;
}

export interface RecommendedUser {
  id: string;
  username: string;
  displayName: string;
  profile?: {
    avatarUrl?: string;
    bio?: string;
    location?: string;
    isVerified?: boolean;
    followerCount?: number;
  };
  stats?: {
    followers: number;
    posts?: number;
  };
  mutualFollowersCount: number;
  recommendationReason: string;
  score: number;
}

export interface TrendingCreator {
  id: string;
  username: string;
  displayName: string;
  profile?: {
    avatarUrl?: string;
    bio?: string;
    location?: string;
    isVerified?: boolean;
    followerCount?: number;
  };
  growthRate: number;
  engagementScore: number;
  recentContent?: {
    id: string;
    title: string;
    thumbnail?: string;
  }[];
  category?: string;
  rank: number;
}

export interface SuggestedUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  verified?: boolean;
  mutualFollowersCount: number;
  mutualFollowers?: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  }[];
  suggestionReason: string;
}

export interface BatchFollowStatus {
  userId: string;
  isFollowing: boolean;
  isFollowedBy: boolean;
}

// ============================================================================
// REQUEST INTERFACES
// ============================================================================

export interface SearchUsersRequest {
  query?: string;
  category?: string;
  verified?: boolean;
  minFollowers?: number;
  maxFollowers?: number;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'followers' | 'recent';
}

export interface GetRecommendedUsersRequest {
  limit?: number;
  context?: string;
  excludeIds?: string[];
}

export interface GetTrendingCreatorsRequest {
  timeframe?: 'day' | 'week' | 'month';
  category?: string;
  limit?: number;
}

// ============================================================================
// RESPONSE INTERFACES
// ============================================================================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FollowersResponse {
  followers: FollowUser[];
  pagination: Pagination;
}

export interface FollowingResponse {
  following: FollowUser[];
  pagination: Pagination;
}

export interface SearchUsersResponse {
  users: SearchUser[];
  pagination: Pagination;
}

export interface RecommendationsResponse {
  recommendations: RecommendedUser[];
  context: string;
}

export interface TrendingCreatorsResponse {
  creators: TrendingCreator[];
  timeframe: 'day' | 'week' | 'month';
  category: string;
}
