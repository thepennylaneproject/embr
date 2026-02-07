// apps/web/src/types/auth.ts
export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  isVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  profile: UserProfile;
  wallet?: UserWallet;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  website?: string;
  location?: string;
  socialLinks?: string[];
  isCreator: boolean;
  isPrivate: boolean;
  allowTips: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationPreference: 'all' | 'mentions' | 'none';
  followerCount: number;
  followingCount: number;
  postCount: number;
}

export interface UserWallet {
  id: string;
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}

export interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
  socialLinks?: string[];
}

export interface UpdateSettingsData {
  isCreator?: boolean;
  isPrivate?: boolean;
  allowTips?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  notificationPreference?: 'all' | 'mentions' | 'none';
}
