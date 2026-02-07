// apps/web/src/lib/api/users.ts
import apiClient from './client';
import { User, UpdateProfileData, UpdateSettingsData } from '@/types/auth';

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await apiClient.patch('/users/profile', data);
    return response.data;
  },

  updateAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.patch('/users/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateSettings: async (data: UpdateSettingsData): Promise<{ message: string }> => {
    const response = await apiClient.patch('/users/settings', data);
    return response.data;
  },

  getUserByUsername: async (username: string): Promise<User> => {
    const response = await apiClient.get(`/users/${username}`);
    return response.data;
  },

  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await apiClient.delete('/users/account');
    return response.data;
  },
};

export default usersApi;
