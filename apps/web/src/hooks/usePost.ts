/**
 * usePost Hook
 * Manages post creation, updates, and deletion with optimistic updates
 */

import { useState, useCallback } from 'react';
import { contentApi } from '@shared/api/content.api';
import {
  Post,
  CreatePostInput,
  UpdatePostInput,
  MediaUploadResponse,
  UploadProgress,
} from '@shared/types/content.types';

interface UsePostReturn {
  // State
  post: Post | null;
  isLoading: boolean;
  isCreating: boolean;
  isUploading: boolean;
  uploadProgress: UploadProgress | null;
  error: string | null;

  // Actions
  createPost: (data: CreatePostInput) => Promise<Post>;
  uploadMedia: (file: File, type: 'image' | 'video') => Promise<MediaUploadResponse>;
  updatePost: (postId: string, data: UpdatePostInput) => Promise<Post>;
  deletePost: (postId: string) => Promise<void>;
  getPost: (postId: string) => Promise<Post>;
  reset: () => void;
}

export const usePost = (): UsePostReturn => {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createPost = useCallback(async (data: CreatePostInput): Promise<Post> => {
    try {
      setIsCreating(true);
      setError(null);

      const newPost = await contentApi.createPost(data);
      setPost(newPost);

      return newPost;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create post';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  }, []);

  const uploadMedia = useCallback(
    async (file: File, type: 'image' | 'video'): Promise<MediaUploadResponse> => {
      try {
        setIsUploading(true);
        setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });
        setError(null);

        const result = await contentApi.uploadMedia(file, type, (progress) => {
          setUploadProgress(progress);
        });

        setUploadProgress(null);
        return result;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to upload media';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const updatePost = useCallback(
    async (postId: string, data: UpdatePostInput): Promise<Post> => {
      try {
        setIsLoading(true);
        setError(null);

        const updatedPost = await contentApi.updatePost(postId, data);
        setPost(updatedPost);

        return updatedPost;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to update post';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deletePost = useCallback(async (postId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await contentApi.deletePost(postId);
      setPost(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete post';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPost = useCallback(async (postId: string): Promise<Post> => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedPost = await contentApi.getPost(postId);
      setPost(fetchedPost);

      return fetchedPost;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch post';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPost(null);
    setIsLoading(false);
    setIsCreating(false);
    setIsUploading(false);
    setUploadProgress(null);
    setError(null);
  }, []);

  return {
    post,
    isLoading,
    isCreating,
    isUploading,
    uploadProgress,
    error,
    createPost,
    uploadMedia,
    updatePost,
    deletePost,
    getPost,
    reset,
  };
};

export default usePost;
