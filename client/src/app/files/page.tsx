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
  StoredFile, 
  FileFolder,
  StorageProvider  
} from '@/lib/services/file-storage-service';

import FileList from '@/components/files/file-list';
import UploadFileModal from '@/components/files/upload-file-modal';
import CreateFolderModal from '@/components/files/create-folder-modal';

export default function FilesPage() {
  const [activeTab, setActiveTab] = useState('files');
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [folders, setFolders] = useState<FileFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FileFolder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);

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
      console.log("hihihi", fileResponse.map((a) => a.file));
      setFiles(fileResponse.map((a) => a.file));
      
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

 

  const fetchProviders = async () => {
    try {
      const providersData = await fileStorageService.getProviders();
      return providersData;
    } catch (error) {
      console.error('Error fetching providers:', error);
      return [];
    }
  };

  // Re-fetch files when page, folder or search changes
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, currentFolder, currentPage, searchQuery]);

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

  const handleFileUpload = async (
    file: File,
    isPublic: boolean = false,
    customFilename?: string
  ) => {
    try {
      // Récupérer les fournisseurs
      const providers = await fetchProviders();
      
      // Vérifier si au moins un fournisseur est disponible
      if (providers.length === 0) {
        toast.error("No storage provider configured. Please contact your administrator.");
        return;
      }

      // Trouver le fournisseur par défaut ou utiliser le premier disponible
      const defaultProvider = providers.find(p => p.is_default) || providers[0];
      
      await fileStorageService.uploadFile(
        file,
        defaultProvider.id,
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
        <HeadingTitle>File manager</HeadingTitle>
        <HeadingDescription>
          Manage and share your files securely
        </HeadingDescription>
      </Heading>
      

      <Tabs value={activeTab} className="mt-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="files">
            <FileIcon className="mr-2 h-4 w-4" />
            Files & Folders
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
    </div>
  );
}
