"use client";

import React, { useCallback, useState } from "react";
import { type FieldValues, type FieldPath, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Form, FormFieldWrapper, type FormFieldWrapperProps } from "../form";
import { FileUpload, type UploadedFileItemProps } from "./file-upload-base";
import { Button } from "../buttons";
import z from "zod";

export interface FileUploadFormItem extends UploadedFileItemProps {
    file?: File;
}

export interface FileUploadFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldWrapperProps<TFieldValues, TName>, "children">,
        Omit<
            React.ComponentProps<typeof FileUpload>,
            "files" | "onFilesAdded" | "onDeleteFile" | "onRetryFile"
        > {
    // Form-specific props
    isRequired?: boolean;

    // Upload behavior
    autoUpload?: boolean;
    uploadUrl?: string;
    uploadHeaders?: Record<string, string>;
    onUploadSuccess?: (file: File, response: any) => void;
    onUploadError?: (file: File, error: any) => void;
    onUploadProgress?: (file: File, progress: number) => void;

    // File processing
    transformFile?: (file: File) => Promise<File> | File;
    validateFile?: (file: File) => string | null; // Return error message or null

    // Value handling - choose one
    storeAs?: "files" | "file-items" | "urls" | "custom";
    customTransform?: (files: FileUploadFormItem[]) => any;
}

// === UPLOAD UTILITIES ===

const simulateUpload = (
    file: File,
    onProgress: (progress: number) => void,
    onSuccess: () => void,
    onError: (error: Error) => void
): (() => void) => {
    let progress = 0;
    const interval = setInterval(
        () => {
            progress += Math.random() * 15 + 5; // 5-20% increments
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);

                // Simulate occasional failures (5% chance)
                if (Math.random() > 0.95) {
                    onError(new Error("Simulated upload failure"));
                } else {
                    onSuccess();
                }
            }
            onProgress(Math.min(progress, 100));
        },
        150 + Math.random() * 200
    ); // Variable timing for realism

    // Return cleanup function
    return () => clearInterval(interval);
};

const uploadFile = async (
    file: File,
    url: string,
    headers: Record<string, string> = {},
    onProgress: (progress: number) => void
): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", e => {
            if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100;
                onProgress(progress);
            }
        });

        xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch {
                    resolve(xhr.responseText);
                }
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });

        xhr.addEventListener("error", () => {
            reject(new Error("Upload failed"));
        });

        xhr.open("POST", url);

        // Set headers
        Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
        });

        xhr.send(formData);
    });
};

// === MAIN COMPONENT ===

export const FileUploadForm = <
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    // Form props
    isRequired,
    control,
    name,
    label,
    description,

    // Upload props
    autoUpload = false,
    uploadUrl,
    uploadHeaders = {},
    onUploadSuccess,
    onUploadError,
    onUploadProgress,

    // File processing
    transformFile,
    validateFile,

    // Value handling
    storeAs = "files",
    customTransform,

    // FileUpload props
    ...fileUploadProps
}: FileUploadFormProps<TFieldValues, TName>) => {
    return (
        <FormFieldWrapper
            control={control}
            name={name}
            label={label}
            description={description}
            isRequired={isRequired}
        >
            {field => (
                <FileUploadController
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={field.disabled}
                    autoUpload={autoUpload}
                    uploadUrl={uploadUrl}
                    uploadHeaders={uploadHeaders}
                    onUploadSuccess={onUploadSuccess}
                    onUploadError={onUploadError}
                    onUploadProgress={onUploadProgress}
                    transformFile={transformFile}
                    validateFile={validateFile}
                    storeAs={storeAs}
                    customTransform={customTransform}
                    {...fileUploadProps}
                />
            )}
        </FormFieldWrapper>
    );
};

// === CONTROLLER COMPONENT ===

interface FileUploadControllerProps
    extends Omit<FileUploadFormProps<any, any>, "control" | "name" | "label" | "description"> {
    value: any;
    onChange: (value: any) => void;
    onBlur: () => void;
    disabled?: boolean;
}

const FileUploadController = ({
    value,
    onChange,
    disabled,
    autoUpload,
    uploadUrl,
    uploadHeaders,
    onUploadSuccess,
    onUploadError,
    onUploadProgress,
    transformFile,
    validateFile,
    storeAs,
    customTransform,
    ...fileUploadProps
}: FileUploadControllerProps) => {
    const [files, setFiles] = useState<FileUploadFormItem[]>(() => {
        // Initialize from form value if it exists
        if (Array.isArray(value)) {
            return value.map((item: FileUploadFormItem, index: number) => ({
                id: item.id || `existing-${index}`,
                name: item.name || item.file?.name || `file-${index}`,
                size: item.size || item.file?.size || 0,
                progress: item.progress ?? 100,
                type: item.type || item.file?.type?.split("/")[0] || undefined,
                failed: item.failed || false,
                file: item.file || item, // Support both File objects and FileUploadFormItem
            }));
        }
        return [];
    });

    const [uploadCancellers, setUploadCancellers] = useState<Map<string, () => void>>(new Map());

    // Transform files to form value
    const transformToFormValue = useCallback(
        (fileItems: FileUploadFormItem[]) => {
            switch (storeAs) {
                case "files":
                    return fileItems.filter(item => item.file).map(item => item.file);
                case "file-items":
                    return fileItems;
                case "urls":
                    return fileItems
                        .filter(item => item.progress === 100 && !item.failed)
                        .map(item => `/uploads/${item.name}`); // Example URL structure
                case "custom":
                    return customTransform ? customTransform(fileItems) : fileItems;
                default:
                    return fileItems;
            }
        },
        [storeAs, customTransform]
    );

    // Update form value when files change
    const updateFormValue = useCallback(
        (newFiles: FileUploadFormItem[]) => {
            const formValue = transformToFormValue(newFiles);
            onChange(formValue);
        },
        [onChange, transformToFormValue]
    );

    // Start upload for a file
    const startUpload = useCallback(
        (fileItem: FileUploadFormItem) => {
            if (!fileItem.file) return;

            const updateProgress = (progress: number) => {
                setFiles(prev =>
                    prev.map(item =>
                        item.id === fileItem.id ? { ...item, progress, failed: false } : item
                    )
                );
                onUploadProgress?.(fileItem.file!, progress);
            };

            const onSuccess = (response?: any) => {
                setFiles(prev => {
                    const newFiles = prev.map(item =>
                        item.id === fileItem.id ? { ...item, progress: 100, failed: false } : item
                    );
                    updateFormValue(newFiles);
                    return newFiles;
                });
                onUploadSuccess?.(fileItem.file!, response);
                toast.success(`${fileItem.name} uploaded successfully`);
            };

            const onError = (error: Error) => {
                setFiles(prev => {
                    const newFiles = prev.map(item =>
                        item.id === fileItem.id ? { ...item, failed: true, progress: 0 } : item
                    );
                    updateFormValue(newFiles);
                    return newFiles;
                });
                onUploadError?.(fileItem.file!, error);
                toast.error(`Upload failed for ${fileItem.name}: ${error.message}`);
            };

            // Real upload vs simulation
            let canceller: () => void;

            if (uploadUrl) {
                const uploadPromise = uploadFile(
                    fileItem.file,
                    uploadUrl,
                    uploadHeaders,
                    updateProgress
                );
                canceller = () => {
                    /* Cancel real upload - could be implemented with AbortController */
                };
                uploadPromise.then(onSuccess).catch(onError);
            } else {
                canceller = simulateUpload(
                    fileItem.file,
                    updateProgress,
                    () => onSuccess(),
                    onError
                );
            }

            setUploadCancellers(prev => new Map(prev).set(fileItem.id, canceller));
        },
        [
            uploadUrl,
            uploadHeaders,
            onUploadSuccess,
            onUploadError,
            onUploadProgress,
            updateFormValue,
        ]
    );

    // Handle new files added
    const handleFilesAdded = useCallback(
        async (newFiles: File[]) => {
            const processedFiles: FileUploadFormItem[] = [];

            for (const file of newFiles) {
                // Custom validation
                if (validateFile) {
                    const error = validateFile(file);
                    if (error) {
                        toast.error(`${file.name}: ${error}`);
                        continue;
                    }
                }

                // Transform file if needed
                let processedFile = file;
                if (transformFile) {
                    try {
                        processedFile = await Promise.resolve(transformFile(file));
                    } catch (error) {
                        toast.error(`Failed to process ${file.name}`);
                        continue;
                    }
                }

                const fileItem: FileUploadFormItem = {
                    id: crypto.randomUUID(),
                    name: processedFile.name,
                    size: processedFile.size,
                    progress: autoUpload ? 0 : 100,
                    type: processedFile.type.split("/")[0] as any,
                    file: processedFile,
                    failed: false,
                };

                processedFiles.push(fileItem);
            }

            if (processedFiles.length === 0) return;

            setFiles(prev => {
                const newFiles = [...prev, ...processedFiles];
                if (!autoUpload) {
                    updateFormValue(newFiles);
                }
                return newFiles;
            });

            // Start uploads if auto-upload is enabled
            if (autoUpload && processedFiles.length > 0) {
                processedFiles.forEach((fileItem, index) => {
                    setTimeout(() => startUpload(fileItem), 100 * index);
                });
            }
        },
        [validateFile, transformFile, autoUpload, startUpload, updateFormValue]
    );

    // Handle file deletion
    const handleDeleteFile = useCallback(
        (fileId: string) => {
            // Cancel upload if in progress
            const canceller = uploadCancellers.get(fileId);
            if (canceller) {
                canceller();
                setUploadCancellers(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(fileId);
                    return newMap;
                });
            }

            setFiles(prev => {
                const newFiles = prev.filter(item => item.id !== fileId);
                updateFormValue(newFiles);
                return newFiles;
            });
        },
        [uploadCancellers, updateFormValue]
    );

    // Handle retry
    const handleRetryFile = useCallback(
        (fileId: string) => {
            const fileItem = files.find(f => f.id === fileId);
            if (fileItem) {
                startUpload(fileItem);
            }
        },
        [files, startUpload]
    );

    // Convert FileUploadFormItem[] to UploadedFileItemProps[] for the FileUpload component
    const uploadedFileItems: UploadedFileItemProps[] = files.map(item => ({
        id: item.id,
        name: item.name,
        size: item.size,
        progress: item.progress,
        failed: item.failed,
        type: item.type,
    }));

    return (
        <FileUpload
            {...fileUploadProps}
            files={uploadedFileItems}
            onFilesAdded={handleFilesAdded}
            onDeleteFile={handleDeleteFile}
            onRetryFile={handleRetryFile}
            isDisabled={disabled}
        />
    );
};

// === USAGE EXAMPLES ===

// Example 1: Simple file upload storing File objects

export const SimpleFileUploadExample = () => {
    const form = useForm({
        defaultValues: {
            documents: [] as File[],
        },
    });
    function onSubmit(data: z.infer<typeof form>) {
        console.log("data", data);
        toast("You submitted the following values", {
            description: (
                <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FileUploadForm
                    control={form.control}
                    name="documents"
                    label="Upload Documents"
                    accept=".pdf,.doc,.docx,image/*"
                    maxSize={5 * 1024 * 1024 * 1024}
                    allowsMultiple={true}
                    storeAs="files"
                    variant="progress-bar"
                />
                <Button type="submit">Envoyer</Button>
            </form>
        </Form>
    );
};

// Example 2: Auto-upload with custom validation
/*
export const AutoUploadExample = () => {
    const form = useForm({
        defaultValues: {
            images: [] as string[], // URLs after upload
        }
    });

    return (
        <Form {...form}>
            <FileUploadForm
                control={form.control}
                name="images"
                label="Upload Images"
                accept="image/*"
                autoUpload={true}
                uploadUrl="/api/upload"
                uploadHeaders={{ "Authorization": "Bearer token" }}
                storeAs="urls"
                variant="progress-fill"
                validateFile={(file) => {
                    if (file.size > 2 * 1024 * 1024) {
                        return "File must be smaller than 2MB";
                    }
                    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                        return "Only JPEG, PNG, and WebP images are allowed";
                    }
                    return null;
                }}
                transformFile={async (file) => {
                    // Example: resize image before upload
                    return file; // In real app, you'd resize here
                }}
                onUploadSuccess={(file, response) => {
                    console.log(`${file.name} uploaded:`, response);
                }}
                onUploadError={(file, error) => {
                    console.error("Upload error:", error);
                }}
            />
        </Form>
    );
};
*/
