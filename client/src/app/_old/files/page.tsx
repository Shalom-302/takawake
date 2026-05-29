"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Heading, HeadingDescription, HeadingTitle } from "@/components/heading";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button/button";
import { toast } from "sonner";
import { FolderIcon, File as FileIcon, Upload, Search, SortAsc, Filter } from "lucide-react";
import { Input } from "@/components/ui/input/input";
import {
    DropdownMenuRoot as DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import axios from "axios";

import fileStorageService, {
    StoredFile,
    FileFolder,
} from "@/lib/services/file-storage-service";

import FileList from "@/components/files/file-list";
import UploadFileModal from "@/components/files/upload-file-modal";
import CreateFolderModal from "@/components/files/create-folder-modal";

export default function FilesPage() {
    const [activeTab, setActiveTab] = useState("files");
    const [files, setFiles] = useState<StoredFile[]>([]);
    const [folders, setFolders] = useState<FileFolder[]>([]);
    const [currentFolder, setCurrentFolder] = useState<FileFolder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    // Modals
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [folderModalOpen, setFolderModalOpen] = useState(false);

    // Fetch files with the current folder, page, and search settings
    const fetchFiles = useCallback(async () => {
        setIsLoading(true);
        try {
            // Get folders once
            const folderResponse = await fileStorageService.getFolders();
            console.log("folders--", folderResponse);

            // Get files with the desired filters
            const fileResponse = await fileStorageService.getFiles({
                page: currentPage,
                folder_id: currentFolder?.id,
                search: searchQuery,
            });
            console.log("fileResponse", fileResponse);

            // Filter files based on the current folder
            let filteredFiles = fileResponse.items;

            // If we are in a specific folder, filter files that start with the folder path
            if (currentFolder) {
                filteredFiles = fileResponse.items.filter(file => {
                    // Check if storage_path starts with the folder name (with or without space)
                    return (
                        file.storage_path.startsWith(currentFolder.name + "/") ||
                        file.storage_path.startsWith(currentFolder.name + " /") ||
                        // Check also file_metadata.folder_id if available
                        file.metadata?.folder_id === currentFolder.id
                    );
                });
            } else {
                // If we are at the root, display only files that do not have a "/"
                // in their storage_path, meaning they are not in a folder
                filteredFiles = fileResponse.items.filter(file => {
                    // A file is at the root if:

                    // 1. It does not have a folder_id in its metadata
                    if (file.metadata?.folder_id) return false;

                    // 2. Its storage_path does not exist or does not contain a "/"
                    if (!file.storage_path) return true;
                    return file.storage_path.indexOf("/") === -1;
                });
            }

            // Update status with filtered files
            setFiles(filteredFiles);

            // Logic for filtering folders:
            // - If we're at the root (currentFolder is null), display folders with parent_id null
            // - Otherwise, display folders whose parent_id matches the current folder ID
            const foldersInCurrentParent = folderResponse
                .map(a => a.folder)
                .filter(folder => {
                    if (currentFolder === null) {
                        return folder.parent_id === null;
                    } else {
                        return folder.parent_id === currentFolder.id;
                    }
                });

            console.log("folders^^^", foldersInCurrentParent);

            setFolders(foldersInCurrentParent);
        } catch (error: unknown) {
            console.error("Error fetching files:", error);
            toast.error("Failed to load files");
        } finally {
            setIsLoading(false);
        }
    }, [currentFolder, currentPage, searchQuery]);

    const fetchProviders = async () => {
        try {
            const providersData = await fileStorageService.getProviders();
            return providersData;
        } catch (error: unknown) {
            console.error("Error fetching providers:", error);
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
                parent_id: currentFolder?.id,
            });
            toast.success(`Folder "${name}" created successfully`);
            await fetchFiles();
            setFolderModalOpen(false);
        } catch (error: unknown) {
            toast.error("Failed to create folder");
            console.error("Error creating folder:", error);
        }
    };

    const handleFileUpload = async (
        file: File,
        isPublic: boolean = false,
        customFilename?: string
    ) => {
        try {
            // Retrieve providers
            const providers = await fetchProviders();

            // Check if at least one provider is available
            if (providers.length === 0) {
                toast.error("No storage provider configured. Please contact your administrator.");
                return;
            }
            console.log("providers", providers);

            // Find the default provider or use the first available
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
        } catch (error: unknown) {
            toast.error("Failed to upload file");
            console.error("Error uploading file:", error);
        }
    };

    const handleDeleteFile = async (fileId: number): Promise<void> => {
        try {
            await fileStorageService.deleteFile(fileId);
            toast.success("File deleted successfully");
            await fetchFiles();
        } catch (error: unknown) {
            console.error("Error deleting file:", error);

            // Check if it's an API error with a message
            if (axios.isAxiosError(error)) {
                const apiResponse = error.response?.data as { detail?: string };
                const apiError = apiResponse?.detail || "Failed to delete file";
                toast.error(apiError);
            } else {
                toast.error("Failed to delete file");
            }

            throw error;
        }
    };

    const handleDownloadFile = async (fileId: number): Promise<string> => {
        try {
            const downloadUrl = await fileStorageService.getFileDownloadUrl(fileId);
            return downloadUrl;
        } catch (error: unknown) {
            console.error("Error downloading file:", error);
            toast.error("Failed to download file");
            return "";
        }
    };

    const handleNavigateToFolder = (folder: FileFolder | null) => {
        setCurrentFolder(folder);
        setCurrentPage(1);
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
                <HeadingDescription>Manage and share your files securely</HeadingDescription>
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
                            <div className="flex items-center gap-2">{renderBreadcrumbs()}</div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setFolderModalOpen(true)}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <FolderIcon className="h-4 w-4" />
                                    New Folder
                                </Button>
                                <Button onClick={() => setUploadModalOpen(true)} className="gap-2">
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
                                    onChange={e => setSearchQuery(e.target.value)}
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
                                        <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
                                        <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
                                        <DropdownMenuItem>Date (Newest)</DropdownMenuItem>
                                        <DropdownMenuItem>Date (Oldest)</DropdownMenuItem>
                                        <DropdownMenuItem>Size (Largest)</DropdownMenuItem>
                                        <DropdownMenuItem>Size (Smallest)</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" title="Filter">
                                            <Filter className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Images</DropdownMenuItem>
                                        <DropdownMenuItem>Documents</DropdownMenuItem>
                                        <DropdownMenuItem>Videos</DropdownMenuItem>
                                        <DropdownMenuItem>Audio</DropdownMenuItem>
                                        <DropdownMenuItem>Archives</DropdownMenuItem>
                                        <DropdownMenuItem>Other</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* File list */}
                        <FileList
                            files={files}
                            folders={folders}
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
