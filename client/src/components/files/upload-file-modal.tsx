"use client";

import React, { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, File as FileIcon } from "lucide-react";
import { FileFolder } from "@/lib/services/file-storage-service";

interface UploadFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File, isPublic: boolean, customFilename?: string) => Promise<void>;
    currentFolder: FileFolder | null;
}

const UploadFileModal: React.FC<UploadFileModalProps> = ({
    isOpen,
    onClose,
    onUpload,
    currentFolder,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [customFilename, setCustomFilename] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Auto-fill the custom filename field with the original filename
            setCustomFilename(selectedFile.name);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            setFile(droppedFile);
            setCustomFilename(droppedFile.name);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setIsUploading(true);
            await onUpload(file, isPublic, customFilename);
            resetForm();
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setCustomFilename("");
        setIsPublic(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";

        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={open => {
                if (!open) {
                    resetForm();
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload File</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Folder location info */}
                    <div className="text-sm text-gray-500">
                        Uploading to:{" "}
                        <span className="font-medium">
                            {currentFolder ? currentFolder.name : "Root"}
                        </span>
                    </div>

                    {/* File dropzone */}
                    <div
                        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${
                            file
                                ? "border-green-500 bg-green-50"
                                : "border-gray-300 hover:border-gray-400"
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {file ? (
                            <div className="space-y-2">
                                <FileIcon className="mx-auto h-8 w-8 text-green-500" />
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                <p className="text-sm font-medium">
                                    Drop your file here or click to browse
                                </p>
                                <p className="text-xs text-gray-500">Supports all file types</p>
                            </div>
                        )}
                    </div>

                    {/* Custom filename */}
                    <div className="space-y-2">
                        <Label htmlFor="filename">Filename (optional)</Label>
                        <Input
                            id="filename"
                            value={customFilename}
                            onChange={e => setCustomFilename(e.target.value)}
                            placeholder="Custom filename"
                            disabled={!file}
                        />
                        <p className="text-xs text-gray-500">
                            Leave blank to use the original filename
                        </p>
                    </div>

                    {/* Public access switch */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="public-access" className="text-sm font-medium">
                                Public Access
                            </Label>
                            <p className="text-xs text-gray-500">
                                Allow anyone with the link to access this file
                            </p>
                        </div>
                        <Switch
                            id="public-access"
                            checked={isPublic}
                            onCheckedChange={setIsPublic}
                            disabled={!file}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isUploading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="gap-2"
                    >
                        {isUploading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                Upload
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UploadFileModal;
