/**
 * Service for interacting with the File Storage API
 * Supports MinIO storage provider
 */

import axiosClient from '@/lib/api/axios-client';
import { AxiosResponse, AxiosRequestConfig } from 'axios';

// Types pour le service de stockage de fichiers
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
  config: Record<string, any>;
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
  metadata?: Record<string, any>;
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

export interface CreateProviderRequest {
  name: string;
  type: StorageProviderType;
  config: Record<string, any>;
  is_default?: boolean;
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
   * Récupérer tous les fournisseurs de stockage
   */
  async getProviders(): Promise<StorageProvider[]> {
    try {
      const response: AxiosResponse<StorageProvider[]> = await axiosClient.get('/file_storage/providers');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs de stockage:', error);
      throw error;
    }
  },

  /**
   * Récupérer un fournisseur de stockage par ID
   */
  async getProviderById(id: number): Promise<StorageProvider> {
    try {
      const response: AxiosResponse<StorageProvider> = await axiosClient.get(`/file_storage/providers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du fournisseur de stockage ${id}:`, error);
      throw error;
    }
  },

  /**
   * Créer un nouveau fournisseur de stockage MinIO
   */
  async createMinioProvider(name: string, config: {
    endpoint_url: string;
    access_key: string;
    secret_key: string;
    bucket_name: string;
    region?: string;
    secure?: boolean;
  }, isDefault: boolean = false): Promise<StorageProvider> {
    try {
      const providerData: CreateProviderRequest = {
        name,
        type: StorageProviderType.MINIO,
        config,
        is_default: isDefault
      };
      
      const response: AxiosResponse<StorageProvider> = await axiosClient.post(
        '/file_storage/providers',
        providerData
      );
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du fournisseur MinIO:', error);
      throw error;
    }
  },

  /**
   * Supprimer un fournisseur de stockage
   */
  async deleteProvider(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/file_storage/providers/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du fournisseur ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer tous les dossiers
   */
  async getFolders(): Promise<FileFolder[]> {
    try {
      const response: AxiosResponse<FileFolder[]> = await axiosClient.get('/file_storage/folders');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des dossiers:', error);
      throw error;
    }
  },

  /**
   * Créer un nouveau dossier
   */
  async createFolder(data: CreateFolderRequest): Promise<FileFolder> {
    try {
      const response: AxiosResponse<FileFolder> = await axiosClient.post('/file_storage/folders', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
      throw error;
    }
  },

  /**
   * Supprimer un dossier
   */
  async deleteFolder(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/file_storage/folders/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du dossier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les fichiers avec pagination
   */
  async getFiles(params: FilesListParams = {}): Promise<PaginatedResponse<StoredFile>> {
    try {
      const response: AxiosResponse<PaginatedResponse<StoredFile>> = await axiosClient.get(
        '/file_storage/files',
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers:', error);
      throw error;
    }
  },

  /**
   * Récupérer un fichier par ID
   */
  async getFileById(id: number): Promise<StoredFile> {
    try {
      const response: AxiosResponse<StoredFile> = await axiosClient.get(`/file_storage/files/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du fichier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Uploader un fichier
   */
  async uploadFile(
    file: File,
    folderId?: number,
    isPublic: boolean = false,
    customFilename?: string,
    metadata?: Record<string, any>
  ): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (folderId !== undefined) {
        formData.append('folder_id', folderId.toString());
      }
      
      formData.append('is_public', isPublic.toString());
      
      if (customFilename) {
        formData.append('custom_filename', customFilename);
      }
      
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
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
      
      const response: AxiosResponse<FileUploadResponse> = await axiosClient.post(
        '/file_storage/files/upload',
        formData,
        config
      );
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'upload du fichier:', error);
      throw error;
    }
  },

  /**
   * Supprimer un fichier
   */
  async deleteFile(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/file_storage/files/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du fichier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtenir l'URL de téléchargement d'un fichier
   */
  async getFileDownloadUrl(id: number): Promise<string> {
    try {
      const response: AxiosResponse<{ url: string }> = await axiosClient.get(
        `/file_storage/files/${id}/download-url`
      );
      return response.data.url;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'URL de téléchargement pour le fichier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Télécharger un fichier directement
   */
  async downloadFile(id: number): Promise<Blob> {
    try {
      const response: AxiosResponse<Blob> = await axiosClient.get(
        `/file_storage/files/${id}/download`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du téléchargement du fichier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Générer une URL présiginée pour un fichier (utile pour les fichiers privés)
   */
  async generatePreSignedUrl(id: number, expiryMinutes: number = 60): Promise<string> {
    try {
      const response: AxiosResponse<{ url: string }> = await axiosClient.get(
        `/file_storage/files/${id}/presigned-url`,
        { params: { expiry_minutes: expiryMinutes } }
      );
      return response.data.url;
    } catch (error) {
      console.error(`Erreur lors de la génération de l'URL présiginée pour le fichier ${id}:`, error);
      throw error;
    }
  }
};

export default fileStorageService;
