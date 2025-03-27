"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Heading, HeadingDescription, HeadingTitle } from '@/components/heading';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  FolderIcon, 
  File as FileIcon, 
  Upload, 
  Settings, 
  Database,
  MoreVertical,
  Search,
  SortAsc,
  Filter
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import fileStorageService, { 
  StorageProvider, 
  StoredFile, 
  FileFolder
} from '@/lib/services/file-storage-service';

import FileList from '@/components/files/file-list';
import UploadFileModal from '@/components/files/upload-file-modal';
import CreateFolderModal from '@/components/files/create-folder-modal';
import MinioConfigModal from '@/components/files/minio-config-modal';

export default function FilesPage() {
  const [activeTab, setActiveTab] = useState('files');
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [folders, setFolders] = useState<FileFolder[]>([]);
  const [providers, setProviders] = useState<StorageProvider[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FileFolder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [minioModalOpen, setMinioModalOpen] = useState(false);

  // Fetch files with the current folder, page, and search settings
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get files
      const fileResponse = await fileStorageService.getFiles({
        page: currentPage,
        folder_id: currentFolder?.id,
        search: searchQuery
      });
      setFiles(fileResponse.items);
      
      // Get folders if we're in root or a specific folder
      const folderResponse = await fileStorageService.getFolders();
      const foldersInCurrentParent = folderResponse.filter(
        folder => folder.parent_id === currentFolder?.id
      );
      setFolders(foldersInCurrentParent);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }, [currentFolder, currentPage, searchQuery]);

  // Initial data fetch
  useEffect(() => {
    fetchProviders();
    fetchFiles();
  }, [fetchFiles]);

  // Re-fetch files when page, folder or search changes
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, currentFolder, currentPage, searchQuery]);

  const fetchProviders = async () => {
    try {
      const providersData: StorageProvider[] = await fileStorageService.getProviders();
      setProviders(providersData);
      return providersData;
    } catch (error) {
      toast.error("Failed to load storage providers");
      console.error('Error fetching providers:', error);
      return [];
    }
  };

  const handleCreateFolder = async (name: string, description?: string) => {
    try {
      await fileStorageService.createFolder({
        name,
        description,
        parent_id: currentFolder?.id
      });
      toast.success(`Folder "${name}" created successfully`);
      await fetchFiles();
      setFolderModalOpen(false);
    } catch (error) {
      toast.error("Failed to create folder");
      console.error('Error creating folder:', error);
    }
  };

  const handleConfigureMinio = async (config: {
    name: string;
    endpoint_url: string;
    access_key: string;
    secret_key: string;
    bucket_name: string;
    region?: string;
    secure?: boolean;
    is_default?: boolean;
  }) => {
    try {
      await fileStorageService.createMinioProvider(
        config.name,
        {
          endpoint_url: config.endpoint_url,
          access_key: config.access_key,
          secret_key: config.secret_key,
          bucket_name: config.bucket_name,
          region: config.region,
          secure: config.secure !== false
        },
        !!config.is_default
      );
      
      toast.success(`MinIO provider "${config.name}" configured successfully`);
      await fetchProviders();
      setMinioModalOpen(false);
    } catch (error) {
      toast.error("Failed to configure MinIO provider");
      console.error('Error configuring MinIO:', error);
    }
  };

  const handleFileUpload = async (
    file: File,
    isPublic: boolean = false,
    customFilename?: string
  ) => {
    try {
      await fileStorageService.uploadFile(
        file,
        currentFolder?.id,
        isPublic,
        customFilename
      );
      
      toast.success(`File "${file.name}" uploaded successfully`);
      await fetchFiles();
      setUploadModalOpen(false);
    } catch (error) {
      toast.error("Failed to upload file");
      console.error('Error uploading file:', error);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    try {
      await fileStorageService.deleteFile(fileId);
      toast.success("File deleted successfully");
      await fetchFiles();
    } catch (error) {
      toast.error("Failed to delete file");
      console.error('Error deleting file:', error);
    }
  };

  const handleNavigateToFolder = (folder: FileFolder | null) => {
    setCurrentFolder(folder);
    setCurrentPage(1);
  };

  const handleDownloadFile = async (fileId: number): Promise<string> => {
    try {
      const downloadUrl = await fileStorageService.getFileDownloadUrl(fileId);
      return downloadUrl;
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
      return '';
    }
  };

  const renderBreadcrumbs = () => {
    if (!currentFolder) {
      return (
        <Button variant="ghost" className="font-bold" disabled>
          Root
        </Button>
      );
    }

    return (
      <div className="flex items-center space-x-1">
        <Button variant="ghost" onClick={() => handleNavigateToFolder(null)}>
          Root
        </Button>
        <span>/</span>
        <Button variant="ghost" className="font-bold" disabled>
          {currentFolder.name}
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <Heading>
        <HeadingTitle>File Storage</HeadingTitle>
        <HeadingDescription>
          Manage your files using MinIO cloud storage
        </HeadingDescription>
      </Heading>

      <Tabs value={activeTab} className="mt-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="files">
            <FileIcon className="mr-2 h-4 w-4" />
            Files & Folders
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Storage Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Files & Folders Tab */}
        <TabsContent value="files">
          <Card className="p-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
              <div className="flex items-center gap-2">
                {renderBreadcrumbs()}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setFolderModalOpen(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <FolderIcon className="h-4 w-4" />
                  New Folder
                </Button>
                <Button 
                  onClick={() => setUploadModalOpen(true)}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>
            </div>
            
            {/* Search & filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" title="Sort">
                      <SortAsc className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      Name (A-Z)
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Name (Z-A)
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Date (Newest)
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Date (Oldest)
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Size (Largest)
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Size (Smallest)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" title="Filter">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      Images
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Documents
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Videos
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Audio
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Archives
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Other
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* File list */}
            <FileList 
              files={files}
              folders={folders.filter(f => f.parent_id === currentFolder?.id)}
              isLoading={isLoading}
              currentFolder={currentFolder}
              onFolderClick={handleNavigateToFolder}
              onDeleteFile={handleDeleteFile}
              onDownloadFile={handleDownloadFile}
            />
          </Card>
        </TabsContent>
        
        {/* Storage Settings Tab */}
        <TabsContent value="settings">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Storage Providers</h3>
              <Button 
                onClick={() => setMinioModalOpen(true)}
                className="gap-2"
              >
                <Database className="h-4 w-4" />
                Configure MinIO
              </Button>
            </div>
            
            <Separator className="my-4" />
            
            {/* Providers list */}
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No storage providers configured</h3>
                <p className="text-sm max-w-md mx-auto mb-6">
                  Configure a MinIO storage provider to start managing files
                </p>
                <Button 
                  onClick={() => setMinioModalOpen(true)}
                  className="gap-2"
                >
                  <Database className="h-4 w-4" />
                  Configure MinIO
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {providers.map((provider) => (
                  <div 
                    key={provider.id} 
                    className="flex justify-between items-center p-4 rounded-md border"
                  >
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{provider.name}</p>
                        <p className="text-xs text-gray-500">
                          {provider.type.toUpperCase()} 
                          {provider.is_default && " (Default)"}
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.info("Edit not implemented yet")}>
                          Edit Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            if (confirm(`Delete provider ${provider.name}?`)) {
                              fileStorageService.deleteProvider(provider.id)
                                .then(() => {
                                  toast.success("Provider deleted");
                                  fetchProviders();
                                })
                                .catch((error) => {
                                  toast.error("Failed to delete provider");
                                  console.error(error);
                                });
                            }
                          }}
                        >
                          Delete Provider
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Modals */}
      <UploadFileModal 
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleFileUpload}
        currentFolder={currentFolder}
      />
      
      <CreateFolderModal
        isOpen={folderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        onCreateFolder={handleCreateFolder}
        currentFolder={currentFolder}
      />
      
      <MinioConfigModal
        isOpen={minioModalOpen}
        onClose={() => setMinioModalOpen(false)}
        onConfigureMinio={handleConfigureMinio}
        existingProviders={providers}
      />
    </div>
  );
}
