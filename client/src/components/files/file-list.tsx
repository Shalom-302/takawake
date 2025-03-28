"use client";

import React, { useState } from 'react';
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
  ChevronLeft,
  Copy,
  Eye
} from 'lucide-react';
import Image from 'next/image';
import { StoredFile, FileFolder } from '@/lib/services/file-storage-service';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// Import des lecteurs personnalisés
import PDFViewer from '@/components/media-players/pdf-viewer';
import VideoPlayer from '@/components/media-players/video-player';
import AudioPlayer from '@/components/media-players/audio-player';

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
  const getFileIcon = (mime_type: string) => {
    if (mime_type?.startsWith('image/')) {
      return <FileImage className="h-4 w-4 text-blue-500" />;
    } else if (mime_type.startsWith('video/')) {
      return <FileVideo className="h-4 w-4 text-purple-500" />;
    } else if (mime_type.startsWith('audio/')) {
      return <FileAudio className="h-4 w-4 text-green-500" />;
    } else if (
      mime_type.includes('pdf') || 
      mime_type.includes('word') || 
      mime_type.includes('text') ||
      mime_type.includes('document')
    ) {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else if (
      mime_type.includes('zip') || 
      mime_type.includes('compressed') || 
      mime_type.includes('archive')
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

  // States for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // States for preview modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);
  
  // State for copy link notification
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Handle preview click
  const handlePreviewClick = (file: StoredFile) => {
    setPreviewFile(file);
    setPreviewModalOpen(true);
  };

  // Handle copy link to clipboard
  const handleCopyLink = async (fileId: number) => {
    try {
      const url = await onDownloadFile(fileId);
      await navigator.clipboard.writeText(url);
      setCopySuccess('Link copied to clipboard!');
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(null);
      }, 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      setCopySuccess('Failed to copy link');
      
      // Clear error message after 2 seconds
      setTimeout(() => {
        setCopySuccess(null);
      }, 2000);
    }
  };

  // Check if file can be previewed
  const canPreview = (mimeType: string): boolean => {
    return (
      mimeType.startsWith('image/') || 
      mimeType.startsWith('video/') || 
      mimeType.startsWith('audio/') || 
      mimeType === 'application/pdf'
    );
  };

  // Render preview content based on file type
  const renderPreview = (file: StoredFile) => {
    if (!file) return null;
    
    if (file.mime_type.startsWith('image/')) {
      return (
        <div className="flex justify-center">
          <Image
            src={file.url || `/api/public/file-storage/files/${file.id}/download`}
            alt={file.original_filename}
            width={800}
            height={600}
            className="max-w-full max-h-[70vh] object-contain"
            style={{ width: 'auto', height: 'auto' }}
            unoptimized={!file.url?.startsWith('http')}
          />
        </div>
      );
    } else if (file.mime_type.startsWith('video/')) {
      return (
        <VideoPlayer 
          url={file.url || `/api/public/file-storage/files/${file.id}/download`}
          title={file.original_filename}
          onDownload={() => handleDownload(file.id, file.original_filename)}
        />
      );
    } else if (file.mime_type.startsWith('audio/')) {
      return (
        <AudioPlayer
          url={file.url || `/api/public/file-storage/files/${file.id}/download`}
          title={file.original_filename}
          onDownload={() => handleDownload(file.id, file.original_filename)}
        />
      );
    } else if (file.mime_type === 'application/pdf') {
      return (
        <PDFViewer
          url={file.url || `/api/public/file-storage/files/${file.id}/download`}
          title={file.original_filename}
          onDownload={() => handleDownload(file.id, file.original_filename)}
        />
      );
    }
    
    return (
      <div className="text-center py-10">
        <p>Preview not available for this file type.</p>
        <Button
          className="mt-4"
          onClick={() => handleDownload(file.id, file.original_filename)}
        >
          Download File
        </Button>
      </div>
    );
  };

  // Handle delete file confirmation
  const handleDeleteClick = (fileId: number) => {
    setFileToDelete(fileId);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  // Handle confirming file deletion
  const confirmDelete = async () => {
    if (fileToDelete === null) return;
    
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await onDeleteFile(fileToDelete);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting file:', error);
      setDeleteError('Failed to delete file. Please try again.');
    } finally {
      setIsDeleting(false);
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

  console.log("folders==", folders)
  return (
    <div>
      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {deleteError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {deleteError}
            </div>
          )}
          
          <DialogFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Preview Modal */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewFile && (
                <>
                  {getFileIcon(previewFile.mime_type)}
                  {previewFile.original_filename}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="my-4">
            {previewFile && renderPreview(previewFile)}
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div>
              {previewFile && (
                <p className="text-sm text-gray-500">
                  {formatFileSize(previewFile.file_size)} • 
                  {/* Uploaded {formatDistanceToNow(new Date(previewFile.created_at), { addSuffix: true })} */}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setPreviewModalOpen(false)}
              >
                Close
              </Button>
              {previewFile && (
                <Button 
                  variant="default"
                  onClick={() => handleDownload(previewFile.id, previewFile.original_filename)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy Success Notification */}
      {copySuccess && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded shadow-lg">
          {copySuccess}
        </div>
      )}
      
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
                {/* {formatDistanceToNow(new Date(folder?.updated_at), { addSuffix: true })} */}
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
                {/* {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })} */}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {canPreview(file.mime_type) && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handlePreviewClick(file)}
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCopyLink(file.id)}
                    title="Copy Link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  
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
                    onClick={() => handleDeleteClick(file.id)}
                    title="Delete"
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
