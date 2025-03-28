"use client";

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  FolderIcon, 
  File as FileIcon, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  Archive, 
  Download, 
  Trash2, 
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { StoredFile, FileFolder } from '@/lib/services/file-storage-service';
import { formatDistanceToNow } from 'date-fns';

interface FileListProps {
  files: StoredFile[];
  folders: FileFolder[];
  isLoading: boolean;
  currentFolder: FileFolder | null;
  onFolderClick: (folder: FileFolder | null) => void;
  onDeleteFile: (fileId: number) => Promise<void>;
  onDownloadFile: (fileId: number) => Promise<string>;
}

const FileList: React.FC<FileListProps> = ({
  files,
  folders,
  isLoading,
  currentFolder,
  onFolderClick,
  onDeleteFile,
  onDownloadFile
}) => {
  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Helper function to get an icon based on MIME type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FileImage className="h-4 w-4 text-blue-500" />;
    } else if (mimeType.startsWith('video/')) {
      return <FileVideo className="h-4 w-4 text-purple-500" />;
    } else if (mimeType.startsWith('audio/')) {
      return <FileAudio className="h-4 w-4 text-green-500" />;
    } else if (
      mimeType.includes('pdf') || 
      mimeType.includes('word') || 
      mimeType.includes('text') ||
      mimeType.includes('document')
    ) {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else if (
      mimeType.includes('zip') || 
      mimeType.includes('compressed') || 
      mimeType.includes('archive')
    ) {
      return <Archive className="h-4 w-4 text-yellow-500" />;
    } else {
      return <FileIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Handle file download
  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const url = await onDownloadFile(fileId);
      
      // Create a hidden anchor element for downloading
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // Empty state
  if (!isLoading && files?.length === 0 && folders?.length === 0) {
    return (
      <div className="text-center py-12">
        <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No files or folders</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new folder or uploading a file.
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Navigate to parent folder button */}
      {currentFolder && (
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          onClick={() => onFolderClick(null)}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Root
        </Button>
      )}
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Name</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden md:table-cell">Size</TableHead>
            <TableHead className="hidden md:table-cell">Modified</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Folders first */}
          {folders.map((folder) => (
            <TableRow key={`folder-${folder.id}`}>
              <TableCell
                className="font-medium cursor-pointer hover:text-blue-600"
                onClick={() => onFolderClick(folder)}
              >
                <div className="flex items-center gap-2">
                  <FolderIcon className="h-4 w-4 text-yellow-500" />
                  {folder.name}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">Folder</TableCell>
              <TableCell className="hidden md:table-cell">-</TableCell>
              <TableCell className="hidden md:table-cell">
                {formatDistanceToNow(new Date(folder.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {/* Folder actions could be added here */}
                  <Button size="icon" variant="ghost" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          
          {/* Files */}
          {files?.map((file) => (
            <TableRow key={`file-${file.id}`}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {getFileIcon(file.mime_type)}
                  {file.original_filename}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {file.mime_type.split('/')[1]?.toUpperCase() || file.mime_type}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {formatFileSize(file.file_size)}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDownload(file.id, file.original_filename)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {file.is_public && file.url && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => window.open(file.url, '_blank')}
                      title="Open Public URL"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDeleteFile(file.id)}
                    title="Delete"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FileList;
