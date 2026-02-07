/**
 * Media Types
 * Types for media upload and management
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
}

export enum MediaStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}

export enum UploadType {
  SIMPLE = 'SIMPLE',
  MULTIPART = 'MULTIPART',
}

// ============================================================================
// MEDIA INTERFACES
// ============================================================================

export interface Media {
  id: string;
  userId: string;
  type: MediaType;
  status: MediaStatus;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number; // for video/audio, in seconds
  metadata?: Record<string, any>;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaStats {
  totalFiles: number;
  totalSize: number;
  byType: Record<MediaType, { count: number; size: number }>;
  storageUsed: number;
  storageLimit: number;
}

// ============================================================================
// UPLOAD REQUEST INTERFACES
// ============================================================================

export interface InitiateUploadRequest {
  fileName: string;
  fileSize: number;
  mimeType: string;
  type?: MediaType;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export interface InitiateUploadResponse {
  uploadId: string;
  uploadType: UploadType;
  presignedUrl?: string; // for simple upload
  presignedUrls?: { partNumber: number; url: string }[]; // for multipart
  expiresAt: Date;
}

export interface CompleteUploadRequest {
  uploadId: string;
}

export interface CompleteUploadResponse {
  media: Media;
  success: boolean;
}

export interface CompleteMultipartUploadRequest {
  uploadId: string;
  parts: { partNumber: number; etag: string }[];
}

export interface AbortUploadRequest {
  uploadId: string;
}

// ============================================================================
// QUERY INTERFACES
// ============================================================================

export interface GetUserMediaRequest {
  type?: MediaType;
  status?: MediaStatus;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'fileSize' | 'fileName';
  sortOrder?: 'asc' | 'desc';
}

export interface GetUserMediaResponse {
  media: Media[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetSignedUrlResponse {
  url: string;
  expiresAt: Date;
}
