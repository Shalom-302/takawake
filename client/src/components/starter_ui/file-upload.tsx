/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useRef, useState } from "react";
import { XCloseIcon, FileFiveIcon, FileFourIcon, ImageOneIcon } from "../icons";

type UploadProps = {
    file?: Record<string, File | File[] | null>;
    setFile?: React.Dispatch<React.SetStateAction<Record<string, File | File[] | null>>>;
    multiple?: boolean;
    title: string;
    id: string;
    desc: string;
    illustration: any;
    maxFileSize?: number; // en Ko
    acceptedFileTypes?: string[];
} & React.ComponentPropsWithRef<"div">;

const formatFileSize = (sizeInBytes: number) => {
    const sizeInKilobytes = sizeInBytes / 1024;
    const sizeInMegabytes = sizeInKilobytes / 1024;
    const sizeInGigabytes = sizeInMegabytes / 1024;
    const sizeInTerabytes = sizeInGigabytes / 1024;

    if (sizeInTerabytes >= 1) return `${sizeInTerabytes.toFixed(2)} To`;
    if (sizeInGigabytes >= 1) return `${sizeInGigabytes.toFixed(2)} Go`;
    if (sizeInMegabytes >= 1) return `${sizeInMegabytes.toFixed(2)} Mo`;
    if (sizeInKilobytes >= 1) return `${sizeInKilobytes.toFixed(2)} Ko`;
    return `${sizeInBytes} octets`;
};

export const FileUpload = React.forwardRef<HTMLDivElement, UploadProps>(
    (
        {
            file,
            setFile,
            multiple = false,
            maxFileSize,
            id,
            acceptedFileTypes,
            title,
            desc,
            illustration,
        },
        ref
    ) => {
        const [errorMessages, setErrorMessages] = useState<string[]>([]);
        console.log(errorMessages)

        const fileInputRef = useRef<HTMLInputElement>(null);

        const handleFilesUpload = (newFiles: FileList) => {
            const fileList = Array.from(newFiles);
            const validFiles: File[] = [];

            fileList.forEach(file => {
                if (maxFileSize && file.size > maxFileSize * 1024) {
                    setErrorMessages(prev => [
                        ...prev,
                        `Le fichier ${file.name} dépasse la taille maximale autorisée (${maxFileSize} Ko).`,
                    ]);
                } else if (acceptedFileTypes && !acceptedFileTypes.includes(file.type)) {
                    setErrorMessages(prev => [
                        ...prev,
                        `Le fichier ${file.name} n'est pas d'un type accepté (${file.type}).`,
                    ]);
                } else {
                    validFiles.push(file);
                }
            });

            setFile?.(prev => {
                const current = prev?.[id];
                if (multiple) {
                    const newFiles = [
                        ...(Array.isArray(current) ? current : current ? [current] : []),
                        ...validFiles,
                    ];
                    return { ...prev, [id]: newFiles };
                } else {
                    return { ...prev, [id]: validFiles[0] || null };
                }
            });
        };

        const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            handleFilesUpload(event.dataTransfer.files);
        };

        const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.files) {
                handleFilesUpload(event.target.files);
            }
        };

        const handleReset = () => {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        };

        const removeFile = (fileName: string) => {
            setFile?.(prev => {
                const current = prev?.[id];
                if (!multiple) return { ...prev, [id]: null };
                const updated = (Array.isArray(current) ? current : []).filter(
                    file => file.name !== fileName
                );
                return { ...prev, [id]: updated };
            });
            handleReset();
        };

        const files = multiple
            ? (file?.[id] as File[]) || []
            : file?.[id]
              ? [file[id] as File]
              : [];

        return (
            <div ref={ref}>
                <label htmlFor={`fileInput-${id}`} className="cursor-pointer block group mb-4">
                    <div
                        onDrop={handleDrop}
                        onDragOver={event => event.preventDefault()}
                        className="py-4 px-6 border border-primary transition-all p-4 rounded-lg flex items-center justify-center"
                    >
                        <div className="flex flex-col items-center">
                            {illustration}
                            <p className="text-sm mt-3 mb-xs text-center text-primary font-medium">
                                {title}
                            </p>
                            {maxFileSize && (
                                <p className="text-xs text-center text-primary/60 pt-1">{`${desc} (max. ${maxFileSize}Ko)`}</p>
                            )}
                            <input
                                type="file"
                                id={`fileInput-${id}`}
                                multiple={multiple}
                                onChange={handleFileInputChange}
                                className="hidden"
                                ref={fileInputRef}
                                accept={acceptedFileTypes?.join(",")}
                            />
                        </div>
                    </div>
                </label>

                {files.length > 0 && (
                    <div className="mb-2">
                        <span className="text-xs text-primary/60 block font-medium">
                            Fichiers sélectionnés
                        </span>
                    </div>
                )}

                <div className="space-y-2">
                    {files.map((selectedFile, idx) => (
                        <div
                            key={idx}
                            className="border rounded-lg p-3 border-primary relative"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="shrink-0 text-primary">
                                        {selectedFile.type.startsWith("application") ? (
                                            <FileFiveIcon size={18} />
                                        ) : selectedFile.type.startsWith("image") ? (
                                            <ImageOneIcon size={18} />
                                        ) : (
                                            <FileFourIcon size={18} />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-primary">
                                            {selectedFile.name}
                                        </h4>
                                        <span className="text-xs block leading-[20px] text-primary/60">
                                            {formatFileSize(selectedFile.size)}
                                        </span>
                                    </div>
                                </div>
                                <div
                                    onClick={() => removeFile(selectedFile.name)}
                                    className="cursor-pointer h-8 w-8 rounded-full shrink-0 text-primary flex items-center justify-center transition-all"
                                >
                                    <XCloseIcon size={18} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);
