/**
 * useMediaUpload Hook
 * Manages file uploads with multipart support and retry logic
 */

import { useState, useCallback, useRef } from 'react';
import axios, { AxiosProgressEvent, CancelTokenSource } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { UploadProgressItem } from '../components/UploadProgress';

interface UseMediaUploadOptions {
  onComplete?: (results: any[]) => void;
  onError?: (error: string) => void;
  apiUrl?: string;
}

interface UploadState {
  file: File;
  uploadId: string;
  uploadType?: 'simple' | 'multipart' | 'mux';
  fileKey?: string;
  parts?: { PartNumber: number; ETag: string }[];
  partUrls?: { partNumber: number; url: string }[];
  currentPart?: number;
  cancelToken?: CancelTokenSource;
  retryCount: number;
  startTime?: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const useMediaUpload = (options: UseMediaUploadOptions = {}) => {
  const { onComplete, onError, apiUrl = '/api/media' } = options;

  const [uploads, setUploads] = useState<UploadProgressItem[]>([]);
  const uploadStates = useRef<Map<string, UploadState>>(new Map());

  /**
   * Update upload progress
   */
  const updateUpload = useCallback(
    (uploadId: string, update: Partial<UploadProgressItem>) => {
      setUploads((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, ...update } : u)),
      );
    },
    [],
  );

  /**
   * Calculate upload speed and ETA
   */
  const calculateStats = (
    startTime: number,
    uploadedBytes: number,
    totalBytes: number,
  ): { speed: number; estimatedTimeRemaining: number } => {
    const elapsedTime = (Date.now() - startTime) / 1000; // seconds
    const speed = uploadedBytes / elapsedTime; // bytes per second
    const remainingBytes = totalBytes - uploadedBytes;
    const estimatedTimeRemaining = remainingBytes / speed;

    return { speed, estimatedTimeRemaining };
  };

  /**
   * Initiate upload
   */
  const initiateUpload = async (
    file: File,
    contentType: 'image' | 'video' | 'document',
  ): Promise<any> => {
    const response = await axios.post(`${apiUrl}/upload/initiate`, {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      contentType,
    });

    return response.data;
  };

  /**
   * Upload file directly (simple upload)
   */
  const uploadFileSimple = async (
    file: File,
    presignedUrl: string,
    uploadId: string,
  ): Promise<void> => {
    const state = uploadStates.current.get(uploadId);
    if (!state) return;

    const cancelToken = axios.CancelToken.source();
    state.cancelToken = cancelToken;
    state.startTime = Date.now();

    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      cancelToken: cancelToken.token,
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );

          const stats = calculateStats(
            state.startTime!,
            progressEvent.loaded,
            progressEvent.total,
          );

          updateUpload(uploadId, {
            progress: percentage,
            uploadedBytes: progressEvent.loaded,
            speed: stats.speed,
            estimatedTimeRemaining: stats.estimatedTimeRemaining,
          });
        }
      },
    });
  };

  /**
   * Upload file in parts (multipart upload)
   */
  const uploadFileMultipart = async (
    file: File,
    uploadData: any,
    uploadId: string,
  ): Promise<void> => {
    const state = uploadStates.current.get(uploadId);
    if (!state) return;

    const { fileKey, partUrls, totalParts } = uploadData;
    const parts: { PartNumber: number; ETag: string }[] = [];

    state.fileKey = fileKey;
    state.partUrls = partUrls;
    state.parts = [];
    state.startTime = Date.now();

    // Upload each part
    for (let i = 0; i < totalParts; i++) {
      const partNumber = i + 1;
      const partUrl = partUrls[i].url;

      // Calculate part boundaries
      const start = i * uploadData.partSize;
      const end = Math.min(start + uploadData.partSize, file.size);
      const partBlob = file.slice(start, end);

      // Create cancel token for this part
      const cancelToken = axios.CancelToken.source();
      state.cancelToken = cancelToken;
      state.currentPart = partNumber;

      // Upload part
      const response = await axios.put(partUrl, partBlob, {
        headers: {
          'Content-Type': file.type,
        },
        cancelToken: cancelToken.token,
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total) {
            // Calculate overall progress
            const completedBytes = (i * uploadData.partSize) + progressEvent.loaded;
            const percentage = Math.round((completedBytes * 100) / file.size);

            const stats = calculateStats(state.startTime!, completedBytes, file.size);

            updateUpload(uploadId, {
              progress: percentage,
              uploadedBytes: completedBytes,
              speed: stats.speed,
              estimatedTimeRemaining: stats.estimatedTimeRemaining,
            });
          }
        },
      });

      // Store part ETag
      const etag = response.headers.etag?.replace(/"/g, '');
      if (etag) {
        parts.push({ PartNumber: partNumber, ETag: etag });
        state.parts.push({ PartNumber: partNumber, ETag: etag });
      }
    }

    // Complete multipart upload
    await axios.post(`${apiUrl}/upload/complete-multipart`, {
      uploadId: uploadData.uploadId,
      fileKey,
      fileName: file.name,
      contentType: state.file.type.startsWith('image/')
        ? 'image'
        : state.file.type.startsWith('video/')
          ? 'video'
          : 'document',
      parts,
    });
  };

  /**
   * Upload file to Mux
   */
  const uploadFileToMux = async (
    file: File,
    muxUploadUrl: string,
    uploadId: string,
  ): Promise<void> => {
    const state = uploadStates.current.get(uploadId);
    if (!state) return;

    const cancelToken = axios.CancelToken.source();
    state.cancelToken = cancelToken;
    state.startTime = Date.now();

    await axios.put(muxUploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      cancelToken: cancelToken.token,
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );

          const stats = calculateStats(
            state.startTime!,
            progressEvent.loaded,
            progressEvent.total,
          );

          updateUpload(uploadId, {
            progress: percentage,
            uploadedBytes: progressEvent.loaded,
            speed: stats.speed,
            estimatedTimeRemaining: stats.estimatedTimeRemaining,
          });
        }
      },
    });
  };

  /**
   * Complete upload
   */
  const completeUpload = async (
    fileKey: string,
    fileName: string,
    contentType: 'image' | 'video' | 'document',
  ): Promise<any> => {
    const response = await axios.post(`${apiUrl}/upload/complete`, {
      fileKey,
      fileName,
      contentType,
    });

    return response.data;
  };

  /**
   * Upload single file with retry logic
   */
  const uploadSingleFile = async (
    file: File,
    contentType: 'image' | 'video' | 'document',
    uploadId?: string,
  ): Promise<any> => {
    const id = uploadId || uuidv4();

    // Create or update upload state
    if (!uploadStates.current.has(id)) {
      uploadStates.current.set(id, {
        file,
        uploadId: id,
        retryCount: 0,
      });

      setUploads((prev) => [
        ...prev,
        {
          id,
          fileName: file.name,
          fileSize: file.size,
          progress: 0,
          status: 'pending',
        },
      ]);
    }

    const state = uploadStates.current.get(id)!;

    try {
      updateUpload(id, { status: 'uploading', progress: 0 });

      // Initiate upload
      const uploadData = await initiateUpload(file, contentType);
      state.uploadType = uploadData.uploadType;

      // Upload based on type
      if (uploadData.uploadType === 'mux') {
        await uploadFileToMux(file, uploadData.uploadUrl, id);
        updateUpload(id, { status: 'processing', progress: 100 });
        
        // Poll for completion
        // In production, this would be handled by webhooks
        return { success: true, uploadId: uploadData.uploadId };
      } else if (uploadData.uploadType === 'multipart') {
        await uploadFileMultipart(file, uploadData, id);
        updateUpload(id, { status: 'processing', progress: 100 });
      } else {
        // Simple upload
        await uploadFileSimple(file, uploadData.uploadUrl, id);
        const result = await completeUpload(
          uploadData.fileKey,
          file.name,
          contentType,
        );
        updateUpload(id, { status: 'completed', progress: 100 });
        return result;
      }

      updateUpload(id, { status: 'completed', progress: 100 });
      return { success: true };
    } catch (error: any) {
      if (axios.isCancel(error)) {
        updateUpload(id, { status: 'cancelled' });
        throw new Error('Upload cancelled');
      }

      // Retry logic
      if (state.retryCount < MAX_RETRIES) {
        state.retryCount++;
        updateUpload(id, {
          status: 'error',
          error: `Upload failed. Retrying... (${state.retryCount}/${MAX_RETRIES})`,
        });

        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * state.retryCount));
        return uploadSingleFile(file, contentType, id);
      }

      const errorMessage =
        error.response?.data?.message || error.message || 'Upload failed';
      updateUpload(id, { status: 'error', error: errorMessage });
      throw new Error(errorMessage);
    }
  };

  /**
   * Upload multiple files
   */
  const uploadFiles = async (
    files: File[],
    contentType: 'image' | 'video' | 'document',
  ): Promise<void> => {
    try {
      const results = await Promise.all(
        files.map((file) => uploadSingleFile(file, contentType)),
      );

      onComplete?.(results);
    } catch (error: any) {
      onError?.(error.message);
    }
  };

  /**
   * Cancel upload
   */
  const cancelUpload = useCallback((uploadId: string) => {
    const state = uploadStates.current.get(uploadId);
    if (state?.cancelToken) {
      state.cancelToken.cancel('Upload cancelled by user');
    }
    updateUpload(uploadId, { status: 'cancelled' });
  }, []);

  /**
   * Retry upload
   */
  const retryUpload = useCallback(
    async (uploadId: string) => {
      const state = uploadStates.current.get(uploadId);
      if (!state) return;

      state.retryCount = 0;
      const contentType = state.file.type.startsWith('image/')
        ? 'image'
        : state.file.type.startsWith('video/')
          ? 'video'
          : 'document';

      await uploadSingleFile(state.file, contentType, uploadId);
    },
    [],
  );

  /**
   * Clear completed uploads
   */
  const clearCompleted = useCallback(() => {
    setUploads((prev) =>
      prev.filter((u) => u.status !== 'completed'),
    );
  }, []);

  return {
    uploads,
    uploadFiles,
    uploadSingleFile,
    cancelUpload,
    retryUpload,
    clearCompleted,
  };
};

export default useMediaUpload;
