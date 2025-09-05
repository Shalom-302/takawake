"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/buttons/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label/label";
import { Textarea } from "@/components/ui/texarea/textarea";
import { FolderIcon } from "lucide-react";
import { FileFolder } from "@/lib/services/file-storage-service";

interface CreateFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateFolder: (name: string, description?: string) => Promise<void>;
    currentFolder: FileFolder | null;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
    isOpen,
    onClose,
    onCreateFolder,
    currentFolder,
}) => {
    const [folderName, setFolderName] = useState("");
    const [description, setDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateFolder = async () => {
        if (!folderName.trim()) return;

        try {
            setIsCreating(true);
            await onCreateFolder(folderName, description || undefined);
            resetForm();
        } catch (error) {
            console.error("Error creating folder:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const resetForm = () => {
        setFolderName("");
        setDescription("");
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
                    <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Parent folder info */}
                    <div className="text-sm text-gray-500">
                        Creating in:{" "}
                        <span className="font-medium">
                            {currentFolder ? currentFolder.name : "Root"}
                        </span>
                    </div>

                    {/* Folder icon */}
                    <div className="flex justify-center py-2">
                        <div className="rounded-full bg-yellow-100 p-3">
                            <FolderIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>

                    {/* Folder name */}
                    <div className="space-y-2">
                        <Label htmlFor="folder-name" className="text-sm font-medium">
                            Folder Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="folder-name"
                            value={folderName}
                            onChange={e => setFolderName(e.target.value)}
                            placeholder="Enter folder name"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                            Description (optional)
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Enter folder description"
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isCreating}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateFolder}
                        disabled={!folderName.trim() || isCreating}
                        className="gap-2"
                    >
                        {isCreating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <FolderIcon className="h-4 w-4" />
                                Create Folder
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateFolderModal;
