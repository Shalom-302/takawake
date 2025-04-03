/**
 * Service for interacting with the File Storage API
 * Supports MinIO storage provider
 */

import axiosClient from '@/lib/api/axios-client';
import { AxiosResponse, AxiosRequestConfig } from 'axios';

export enum StorageProviderType {
  LOCAL = 'local',
  S3 = 's3',
  MINIO = 'minio',
  GCS = 'gcs'
}

export interface StorageProvider {
  id: number;
  name: string;
  type: StorageProviderType;
  config: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoredFile {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  provider_id: number;
  folder_id?: number;
  is_public: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  url?: string;
}

export interface FileFolder {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  path: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFolderRequest {
  name: string;
  description?: string;
  parent_id?: number;
}

export interface FileUploadResponse {
  file: StoredFile;
  message: string;
}

export interface FilesListParams {
  folder_id?: number;
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const fileStorageService = {
  /**
   * Get all storage providers
   */
  async getProviders(): Promise<StorageProvider[]> {
    try {
      const response: AxiosResponse<StorageProvider[]> = await axiosClient.get('/public/file-storage/providers');
      console.log('Providers:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw error;
    }
  },

  /**
   * Get a storage provider by ID
   */
  async getProviderById(id: number): Promise<StorageProvider> {
    try {
      const response: AxiosResponse<StorageProvider> = await axiosClient.get(`/public/file-storage/providers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching provider ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get the default storage provider
   */
  async getDefaultProvider(): Promise<StorageProvider> {
    try {
      const response: AxiosResponse<StorageProvider> = await axiosClient.get('/public/file-storage/providers/default');
      return response.data;
    } catch (error) {
      console.error('Error fetching default provider:', error);
      throw error;
    }
  },

  /**
   * Delete a storage provider
   */
  async deleteProvider(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/public/file-storage/providers/${id}`);
    } catch (error) {
      console.error(`Error deleting provider ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all folders
   */
  async getFolders(parentId?: number): Promise<FileFolder[]> {
    try {
      const params = parentId ? { parent_folder_id: parentId } : {};
      const response: AxiosResponse<FileFolder[]> = await axiosClient.get('/public/file-storage/folders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  },

  /**
   * Create a new folder
   */
  async createFolder(folderData: CreateFolderRequest): Promise<FileFolder> {
    try {
      const response: AxiosResponse<FileFolder> = await axiosClient.post('/public/file-storage/folders', folderData);
      return response.data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  },

  /**
   * Delete a folder
   */
  async deleteFolder(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/public/file-storage/folders/${id}`);
    } catch (error) {
      console.error(`Error deleting folder ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get files with pagination
   */
  async getFiles(params: FilesListParams = {}): Promise<PaginatedResponse<StoredFile>> {
    try {
      const response: AxiosResponse<PaginatedResponse<StoredFile>> = await axiosClient.get(
        '/public/file-storage/files',
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  },

  /**
   * Get a file by ID
   */
  async getFileById(id: number): Promise<StoredFile> {
    try {
      const response: AxiosResponse<StoredFile> = await axiosClient.get(`/public/file-storage/files/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching file ${id}:`, error);
      throw error;
    }
  },

  /**
   * Upload a file
   */
  async uploadFile(
    file: File,
    providerId: number,
    folderId?: number,
    isPublic: boolean = false,
    customFilename?: string,
    metadata?: Record<string, unknown>
  ): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add mandatory provider_id
      formData.append('provider_id', providerId.toString());
      
      if (folderId !== undefined) {
        formData.append('folder_id', folderId.toString());
      }
      
      // Add description from metadata if available
      if (metadata?.description) {
        const description = typeof metadata.description === 'string' 
          ? metadata.description 
          : String(metadata.description);
        formData.append('description', description);
      }
      
      // Add tags from metadata if available
      if (metadata?.tags) {
        const tagsString = Array.isArray(metadata.tags) 
          ? metadata.tags.join(',')
          : String(metadata.tags);
        formData.append('tags', tagsString);
      }
      
      // Convert is_public to the format expected by the backend
      formData.append('is_public', isPublic.toString());
      
      // Add custom filename as filename override
      if (customFilename) {
        formData.append('override_filename', customFilename);
      }
      
      // These fields are expected by the backend with default values
      formData.append('generate_thumbnails', 'true');
      formData.append('optimize_images', 'false');
      
      // Convert any remaining metadata to a JSON string
      if (metadata && Object.keys(metadata).length > 0) {
        const filteredMetadata = { ...metadata };
        
        // Remove fields that are sent separately
        delete filteredMetadata.description;
        delete filteredMetadata.tags;
        
        if (Object.keys(filteredMetadata).length > 0) {
          formData.append('extra_data', JSON.stringify(filteredMetadata));
        }
      }
      
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      };
      
      const response: AxiosResponse<FileUploadResponse> = await axiosClient.post('/public/file-storage/files/upload', formData, config);
      
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  /**
   * Delete a file
   */
  async deleteFile(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/public/file-storage/files/${id}`);
    } catch (error) {
      console.error(`Error deleting file ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get the download URL of a file
   */
  async getFileDownloadUrl(id: number): Promise<string> {
    try {
      // Instead of requesting a signed URL which might contain internal hosts,
      // we return directly the API URL to download the file
      const baseUrl = axiosClient.defaults.baseURL || '';
      return `${baseUrl}/public/file-storage/files/${id}/download`;
    } catch (error) {
      console.error(`Error getting download URL for file ${id}:`, error);
      throw error;
    }
  },

  /**
   * Download a file directly
   */
  async downloadFile(id: number): Promise<Blob> {
    try {
      const response: AxiosResponse<Blob> = await axiosClient.get(
        `/public/file-storage/files/${id}/download`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error(`Error downloading file ${id}:`, error);
      throw error;
    }
  },

  /**
   * Generate a presigned URL for a file (useful for private files)
   */
  async generatePreSignedUrl(id: number, expiryMinutes: number = 60): Promise<string> {
    try {
      const response: AxiosResponse<{ url: string }> = await axiosClient.get(
        `/public/file-storage/files/${id}/presigned-url`,
        { params: { expiry_minutes: expiryMinutes } }
      );
      return response.data.url;
    } catch (error) {
      console.error(`Error generating presigned URL for file ${id}:`, error);
      throw error;
    }
  }
};

export default fileStorageService;
