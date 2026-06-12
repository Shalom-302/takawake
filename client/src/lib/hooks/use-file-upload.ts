import { UploadedFileItemProps } from "@/components/ui/file-upload";
import { useState, useCallback } from "react";

type Response = {
    url: string;
    id?: string;
};

export interface UploadConfig {
    uploadFn?: (file: File) => Promise<Response>;
    onProgress?: (fileId: string, progress: number) => void;
    onError?: (fileId: string, error: Error) => void;
    onSuccess?: (fileId: string, result: Response) => void;
}

// Hook pour gérer les uploads vers des service tiers comme Cloudinary, S3, etc.
export const useFileUpload = (config: UploadConfig) => {
    const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

    const uploadFile = useCallback(
        async (fileItem: UploadedFileItemProps) => {
            if (!fileItem.file || !config.uploadFn || uploadingFiles.has(fileItem.id)) return;

            setUploadingFiles(prev => new Set(prev).add(fileItem.id));

            try {
                // Simulation du progrès pendant l'upload
                let progress = 0;
                const progressInterval = setInterval(() => {
                    progress += 10;
                    config.onProgress?.(fileItem.id, Math.min(progress, 90));
                }, 200);

                const result = await config.uploadFn(fileItem.file);

                clearInterval(progressInterval);
                config.onProgress?.(fileItem.id, 100);
                config.onSuccess?.(fileItem.id, result);
            } catch (error) {
                console.error("Upload failed:", error);
                config.onError?.(fileItem.id, error as Error);
            } finally {
                setUploadingFiles(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(fileItem.id);
                    return newSet;
                });
            }
        },
        [config, uploadingFiles]
    );

    const retryUpload = useCallback(
        (fileItem: UploadedFileItemProps) => {
            uploadFile(fileItem);
        },
        [uploadFile]
    );

    return {
        uploadFile,
        retryUpload,
        isUploading: (fileId: string) => uploadingFiles.has(fileId),
        uploadingCount: uploadingFiles.size,
    };
};
