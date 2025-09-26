export interface Env {
  FILES_BUCKET: R2Bucket;
  URL_MAPPINGS: KVNamespace;
  ANALYTICS: KVNamespace;
  
  // Environment variables
  ALLOWED_ORIGINS: string;
  MAX_FILE_SIZE: string;
  DEFAULT_URL_EXPIRY: string;
  
  // Secrets
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
}

export interface UrlRecord {
  id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
  expiresAt?: string;
  createdBy?: string;
}

export interface FileRecord {
  id: string;
  filename: string;
  originalName: string;
  contentType: string;
  size: number;
  downloads: number;
  createdAt: string;
  expiresAt?: string;
  hasPassword: boolean;
  createdBy?: string;
}

export interface TextRecord {
  id: string;
  content: string;
  contentType: string;
  views: number;
  createdAt: string;
  expiresAt?: string;
  hasPassword: boolean;
  createdBy?: string;
}

export interface AdminStats {
  totalUrls: number;
  totalClicks: number;
  totalFiles: number;
  totalDownloads: number;
  storageUsed: number;
}