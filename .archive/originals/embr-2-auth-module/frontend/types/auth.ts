// apps/web/src/types/auth.ts
export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  profile: UserProfile;
  wallet?: UserWallet;
}

export interface UserProfile {
  id: string;
  displayName: string;
  bio?: string;
  profilePicture?: string;
  coverImage?: string;
  website?: string;
  location?: string;
  socialLinks?: string[];
  isCreator: boolean;
  isPrivate: boolean;
  allowTips: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationPreference: 'all' | 'mentions' | 'none';
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export interface UserWallet {
  id: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
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
