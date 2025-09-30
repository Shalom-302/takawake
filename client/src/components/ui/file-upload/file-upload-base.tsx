"use client";

import { useId, useRef, useState, type ComponentProps } from "react";
import { FileIcon as FileTypeIcon } from "@untitledui/file-icons";
import { CheckCircle, Trash01, UploadCloud02, XCircle } from "@untitled-ui/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, ButtonUtility } from "@/components/ui/buttons";
import { ProgressBar } from "@/components/ui/progress-indicators";
import { cn } from "@/lib/utils/cn";
import { FeaturedIcon } from "@/components/icons/featured-icons";
import { FormFieldWrapper, type FormFieldWrapperProps } from "../form";
import { type FieldPath, type FieldValues } from "react-hook-form";
import { createFileItem, getReadableFileSize, isFileTypeAccepted } from "@/lib/utils/file-upload";

/** Type de fichier pour les icônes. */
export type FileType = ComponentProps<typeof FileTypeIcon>["type"];

// =========================================================================
// TYPES
// =========================================================================

/** Interface de base pour l'affichage de la liste */
export interface UploadedFileItemProps {
    id: string;
    name: string;
    size: number;
    progress: number;
    failed?: boolean;
    type?: FileType;
    file?: File;
}

/** Interface pour les erreurs de validation */
export interface FileValidationError {
    message: string;
    files: File[];
}

// =========================================================================
// FILE UPLOAD DROP ZONE (Logique de validation conservée pour autonomie)
// =========================================================================

interface FileUploadDropZoneProps {
    className?: string;
    hint?: string;
    isDisabled?: boolean;
    isRequired?: boolean;
    accept?: string;
    allowsMultiple?: boolean;
    maxSize?: number;
    maxFiles?: number;
    currentFileCount?: number;
    onDropFiles?: (files: FileList) => void;
}

const FileUploadDropZone = ({
    className,
    hint,
    isDisabled,
    isRequired,
    accept,
    allowsMultiple = true,
    maxSize,
    maxFiles = allowsMultiple ? undefined : 1,
    currentFileCount = 0,
    onDropFiles,
}: FileUploadDropZoneProps) => {
    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [validationErrors, setValidationErrors] = useState<FileValidationError[]>([]);

    const hasErrors = validationErrors.length > 0;

    /**
     * Valide les fichiers de manière synchrone.
     * Retourne les erreurs détectées et la liste des fichiers qui passent toutes les conditions.
     */
    const validateFiles = (files: File[]) => {
        const errors: FileValidationError[] = [];
        let filesPassingAllChecks = files; // Liste des fichiers valides (filtrée à chaque étape)

        // 1. VÉRIFICATION DU NOMBRE MAXIMUM
        if (maxFiles && currentFileCount + files.length > maxFiles) {
            errors.push({
                message: `Maximum ${maxFiles} files allowed. You're trying to add ${files.length} files but only ${maxFiles - currentFileCount} slots available.`,
                // Fichiers excédentaires (pour l'affichage des erreurs)
                files: files.slice(
                    maxFiles - currentFileCount > 0 ? maxFiles - currentFileCount : 0
                ),
            });
            // Limiter les fichiers à traiter pour les vérifications suivantes
            filesPassingAllChecks = files.slice(0, maxFiles - currentFileCount);
        }

        // 2. VÉRIFICATION DE LA TAILLE DES FICHIERS
        if (maxSize) {
            const oversizedFiles = filesPassingAllChecks.filter(file => file.size > maxSize);
            if (oversizedFiles.length > 0) {
                errors.push({
                    message: `Files too large. Maximum size is ${getReadableFileSize(maxSize || 0)}.`,
                    files: oversizedFiles,
                });
                // Retirer les fichiers non valides de la liste
                filesPassingAllChecks = filesPassingAllChecks.filter(file => file.size <= maxSize);
            }
        }

        // 3. VÉRIFICATION DES TYPES DE FICHIERS
        const invalidTypeFiles = filesPassingAllChecks.filter(
            file => !isFileTypeAccepted(file, accept)
        );
        if (invalidTypeFiles.length > 0) {
            errors.push({
                message: `Invalid file types. Accepted types: ${accept || "all files"}.`,
                files: invalidTypeFiles,
            });
            // Retirer les fichiers non valides de la liste
            filesPassingAllChecks = filesPassingAllChecks.filter(file =>
                isFileTypeAccepted(file, accept)
            );
        }

        return {
            errors,
            validFiles: filesPassingAllChecks,
        };
    };

    const handleDragIn = (event: React.DragEvent<HTMLDivElement>) => {
        if (isDisabled) return;
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(true);
    };

    const handleDragOut = (event: React.DragEvent<HTMLDivElement>) => {
        if (isDisabled) return;
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(false);
    };

    /**
     * Traite les fichiers, valide, filtre, et envoie uniquement les fichiers valides.
     */
    const processFiles = (files: File[]): void => {
        // S'assurer de ne traiter qu'un seul fichier si allowsMultiple est faux
        const filesToValidate = allowsMultiple ? files : files.slice(0, 1);

        // 1. Exécuter la validation de manière synchrone et obtenir les résultats
        const { errors, validFiles } = validateFiles(filesToValidate);

        // 2. Mettre à jour l'état des erreurs pour l'affichage (asynchrone)
        setValidationErrors(errors);

        // 3. Transférer les fichiers VALIDES uniquement
        if (validFiles.length > 0) {
            const dataTransfer = new DataTransfer();
            validFiles.forEach(file => dataTransfer.items.add(file));
            onDropFiles?.(dataTransfer.files);
        }

        // 4. Vider la valeur de l'input
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        if (isDisabled) return;
        handleDragOut(event);
        // Important: Utiliser event.dataTransfer.files pour le drag & drop
        processFiles(Array.from(event.dataTransfer.files));
    };

    const handleInputFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Important: Utiliser event.target.files pour la sélection via le bouton
        processFiles(Array.from(event.target.files || []));
    };

    // --- RENDU ---
    return (
        <div className="flex flex-col gap-2">
            <div
                data-dropzone
                onDragOver={handleDragIn}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragEnd={handleDragOut}
                onDrop={handleDrop}
                className={cn(
                    "relative flex flex-col items-center gap-3 rounded-xl bg-primary px-6 py-4 text-tertiary ring-1 ring-secondary transition duration-100 ease-linear ring-inset",
                    isDraggingOver && "ring-2 ring-brand",
                    (hasErrors || isRequired) && "ring-2 ring-error",
                    isDisabled && "cursor-not-allowed bg-disabled_subtle ring-disabled_subtle",
                    className
                )}
            >
                <FeaturedIcon color="gray" variant="modern" size="md">
                    <UploadCloud02 className="size-5" />
                </FeaturedIcon>

                <div className="flex flex-col gap-1 text-center">
                    <div className="flex justify-center gap-1 text-center">
                        <input
                            ref={inputRef}
                            id={id}
                            type="file"
                            className="peer sr-only"
                            disabled={isDisabled}
                            accept={accept}
                            multiple={allowsMultiple}
                            onChange={handleInputFileChange}
                        />
                        <label htmlFor={id} className="flex cursor-pointer">
                            <Button
                                variant="link-color"
                                size="md"
                                isDisabled={isDisabled}
                                onClick={() => inputRef.current?.click()}
                            >
                                Click to upload <span className="md:hidden">and attach files</span>
                            </Button>
                        </label>
                        <span className="text-sm max-md:hidden">or drag and drop</span>
                    </div>
                    <p
                        className={cn(
                            "text-xs transition duration-100 ease-linear",
                            hasErrors && "text-error-primary"
                        )}
                    >
                        {hint ||
                            `SVG, PNG, JPG or GIF (max. ${maxSize ? getReadableFileSize(maxSize) : "N/A"})`}
                    </p>
                </div>
            </div>

            {/* Affichage des erreurs de validation */}
            {hasErrors && (
                <div className="space-y-1">
                    {validationErrors.map((error, index) => (
                        <p key={index} className="text-xs text-error-primary">
                            {error.message}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};

// =========================================================================
// FILE LIST ITEMS (Inchangé)
// =========================================================================

export interface FileListItemProps {
    /** The name of the file. */
    name: string;
    /** The size of the file. */
    size: number;
    /** The upload progress of the file. */
    progress: number;
    /** Whether the file failed to upload. */
    failed?: boolean;
    /** The type of the file. */
    type?: FileType;
    /** The class name of the file list item. */
    className?: string;
    /** The variant of the file icon. */
    fileIconVariant?: ComponentProps<typeof FileTypeIcon>["variant"];
    /** The function to call when the file is deleted. */
    onDelete?: () => void;
    /** The function to call when the file upload is retried. */
    onRetry?: () => void;
}

const FileListItemProgressBar = ({
    name,
    size,
    progress,
    failed,
    type,
    fileIconVariant,
    onDelete,
    onRetry,
    className,
}: FileListItemProps) => {
    const isComplete = progress === 100;

    return (
        <motion.li
            layout="position"
            className={cn(
                "relative flex gap-3 rounded-xl bg-primary p-4 ring-1 ring-secondary transition-shadow duration-100 ease-linear ring-inset",
                failed && "ring-2 ring-error",
                className
            )}
        >
            <FileTypeIcon
                className="size-10 shrink-0 dark:hidden"
                type={type ?? "empty"}
                theme="light"
                variant={fileIconVariant ?? "default"}
            />
            <FileTypeIcon
                className="size-10 shrink-0 not-dark:hidden"
                type={type ?? "empty"}
                theme="dark"
                variant={fileIconVariant ?? "default"}
            />

            <div className="flex min-w-0 flex-1 flex-col items-start">
                <div className="flex w-full max-w-full min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-secondary">{name}</p>

                        <div className="mt-0.5 flex items-center gap-2">
                            <p className="truncate text-sm whitespace-nowrap text-tertiary">
                                {getReadableFileSize(size)}
                            </p>

                            <hr className="h-3 w-px rounded-t-full rounded-b-full border-none bg-border-primary" />

                            <div className="flex items-center gap-1">
                                {isComplete && (
                                    <CheckCircle className="size-4 stroke-[2.5px] text-fg-success-primary" />
                                )}
                                {isComplete && (
                                    <p className="text-sm font-medium text-success-primary">
                                        Complete
                                    </p>
                                )}

                                {!isComplete && !failed && (
                                    <UploadCloud02 className="stroke-[2.5px size-4 text-fg-quaternary" />
                                )}
                                {!isComplete && !failed && (
                                    <p className="text-sm font-medium text-quaternary">
                                        Uploading...
                                    </p>
                                )}

                                {failed && <XCircle className="size-4 text-fg-error-primary" />}
                                {failed && (
                                    <p className="text-sm font-medium text-error-primary">Failed</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <ButtonUtility
                        variant="tertiary"
                        tooltip="Delete"
                        icon={Trash01}
                        size="xs"
                        className="-mt-2 -mr-2 self-start"
                        onClick={onDelete}
                    />
                </div>

                {!failed && (
                    <div className="mt-1 w-full">
                        <ProgressBar labelPosition="right" max={100} min={0} value={progress} />
                    </div>
                )}

                {failed && (
                    <Button
                        variant="link-destructive"
                        size="sm"
                        onClick={onRetry}
                        className="mt-1.5"
                    >
                        Try again
                    </Button>
                )}
            </div>
        </motion.li>
    );
};

const FileListItemProgressFill = ({
    name,
    size,
    progress,
    failed,
    type,
    fileIconVariant,
    onDelete,
    onRetry,
    className,
}: FileListItemProps) => {
    const isComplete = progress === 100;

    return (
        <motion.li
            layout="position"
            className={cn(
                "relative flex gap-3 overflow-hidden rounded-xl bg-primary p-4",
                className
            )}
        >
            {/* Progress fill. */}
            <div
                style={{ transform: `translateX(-${100 - progress}%)` }}
                className={cn(
                    "absolute inset-0 size-full bg-secondary transition duration-75 ease-linear",
                    isComplete && "opacity-0"
                )}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
            />
            {/* Inner ring. */}
            <div
                className={cn(
                    "absolute inset-0 size-full rounded-[inherit] ring-1 ring-secondary transition duration-100 ease-linear ring-inset",
                    failed && "ring-2 ring-error"
                )}
            />
            <FileTypeIcon
                className="relative size-10 shrink-0 dark:hidden"
                type={type ?? "empty"}
                theme="light"
                variant={fileIconVariant ?? "solid"}
            />
            <FileTypeIcon
                className="relative size-10 shrink-0 not-dark:hidden"
                type={type ?? "empty"}
                theme="dark"
                variant={fileIconVariant ?? "solid"}
            />

            <div className="relative flex min-w-0 flex-1">
                <div className="relative flex min-w-0 flex-1 flex-col items-start">
                    <div className="w-full min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-secondary">{name}</p>

                        <div className="mt-0.5 flex items-center gap-2">
                            <p className="text-sm text-tertiary">
                                {failed
                                    ? "Upload failed, please try again"
                                    : getReadableFileSize(size)}
                            </p>

                            {!failed && (
                                <>
                                    <hr className="h-3 w-px rounded-t-full rounded-b-full border-none bg-border-primary" />
                                    <div className="flex items-center gap-1">
                                        {isComplete && (
                                            <CheckCircle className="size-4 stroke-[2.5px] text-fg-success-primary" />
                                        )}
                                        {!isComplete && (
                                            <UploadCloud02 className="size-4 stroke-[2.5px] text-fg-quaternary" />
                                        )}

                                        <p className="text-sm text-tertiary">{progress}%</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {failed && (
                        <Button
                            variant="link-destructive"
                            size="sm"
                            onClick={onRetry}
                            className="mt-1.5"
                        >
                            Try again
                        </Button>
                    )}
                </div>

                <ButtonUtility
                    variant="tertiary"
                    tooltip="Delete"
                    icon={Trash01}
                    size="xs"
                    className="-mt-2 -mr-2 self-start"
                    onClick={onDelete}
                />
            </div>
        </motion.li>
    );
};

const FileUploadRoot = (props: ComponentProps<"div">) => (
    <div {...props} className={cn("flex flex-col gap-4", props.className)}>
        {props.children}
    </div>
);

const FileUploadList = (props: ComponentProps<"ul">) => (
    <ul {...props} className={cn("flex flex-col gap-3", props.className)}>
        <AnimatePresence initial={false}>{props.children}</AnimatePresence>
    </ul>
);

// =========================================================================
// COMPOSANT PRINCIPAL FILEUPLOAD (Autonome)
// =========================================================================

export type FileProgressVariant = "progress-bar" | "progress-fill";

interface FileUploadProps {
    /** Liste des fichiers uploadés */
    files: UploadedFileItemProps[];
    /** Variante d'affichage du progrès */
    variant?: FileProgressVariant;
    /** Types de fichiers acceptés */
    accept?: string;
    /** Taille maximale des fichiers en bytes */
    maxSize?: number;
    /** Nombre maximum de fichiers */
    maxFiles?: number;
    /** Autoriser plusieurs fichiers */
    allowsMultiple?: boolean;
    /** Texte d'aide affiché dans la zone de drop */
    hint?: string;
    /** Désactiver l'upload */
    isDisabled?: boolean;
    /** Callback quand des fichiers sont déposés/sélectionnés (APRES validation interne) */
    onFilesAdded?: (files: File[]) => void;
    /** Callback pour les erreurs de validation */
    onValidationError?: (errors: FileValidationError[]) => void;
    /** Callback pour supprimer un fichier */
    onDeleteFile?: (fileId: string) => void;
    /** Callback pour réessayer l'upload d'un fichier */
    onRetryFile?: (fileId: string) => void;
    /** Erreurs de validation externes (pour l'affichage) */
    validationErrors?: FileValidationError[];
    /** Afficher les erreurs de validation */
    showValidationErrors?: boolean;
    /** Classes CSS additionnelles */
    className?: string;
    /** Classes CSS pour la zone de drop */
    dropZoneClassName?: string;
    /** Classes CSS pour la liste */
    listClassName?: string;
    "aria-invalid"?: boolean;
}

export const FileUpload = ({
    files,
    variant,
    accept,
    maxSize,
    maxFiles,
    allowsMultiple = true,
    hint,
    isDisabled,
    onFilesAdded,
    onDeleteFile,
    onRetryFile,
    className,
    dropZoneClassName,
    listClassName,
    ...props
}: FileUploadProps) => {
    const isRequired = props["aria-invalid"] === true;
    const handleDropFiles = (fileList: FileList) => {
        if (onFilesAdded) {
            onFilesAdded(Array.from(fileList));
        }
    };

    const handleDeleteFile = (fileId: string) => {
        if (onDeleteFile) {
            onDeleteFile(fileId);
        }
    };

    const handleRetryFile = (fileId: string) => {
        if (onRetryFile) {
            onRetryFile(fileId);
        }
    };

    return (
        <FileUploadRoot className={className}>
            <FileUploadDropZone
                className={dropZoneClassName}
                accept={accept}
                maxSize={maxSize}
                maxFiles={maxFiles}
                currentFileCount={files.length}
                allowsMultiple={allowsMultiple}
                hint={hint}
                isDisabled={isDisabled}
                isRequired={isRequired}
                onDropFiles={handleDropFiles}
            />
            {files.length > 0 &&
                (variant === "progress-bar" ? (
                    <FileUploadList className={listClassName}>
                        {files.map(file => (
                            <FileListItemProgressBar
                                key={file.id}
                                name={file.name}
                                size={file.size}
                                progress={file.progress}
                                failed={file.failed}
                                type={file.type}
                                onDelete={() => handleDeleteFile(file.id)}
                                onRetry={() => handleRetryFile(file.id)}
                            />
                        ))}
                    </FileUploadList>
                ) : variant === "progress-fill" ? (
                    <FileUploadList className={listClassName}>
                        {files.map(file => (
                            <FileListItemProgressFill
                                key={file.id}
                                name={file.name}
                                size={file.size}
                                progress={file.progress}
                                failed={file.failed}
                                type={file.type}
                                onDelete={() => handleDeleteFile(file.id)}
                                onRetry={() => handleRetryFile(file.id)}
                            />
                        ))}
                    </FileUploadList>
                ) : null)}
        </FileUploadRoot>
    );
};

// =========================================================================
// INTÉGRATION REACT HOOK FORM (Mapper et contrôler le flux)
// =========================================================================
export interface FileUploadFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldWrapperProps<TFieldValues, TName>, "children">,
        Omit<FileUploadProps, "files" | "onFilesAdded" | "onDeleteFile" | "onRetryFile"> {
    isRequired?: boolean;
    storageMode?: "files" | "metadata";

    /**
     * Fonction d'upload vers service tiers.
     * REMARQUE: J'utilise ici la signature de votre code original (Promise).
     */
    uploadFn?: (
        file: File,
        onProgress: (progress: number) => void
    ) => Promise<{
        url: string;
        [key: string]: string;
    }>;

    transformFiles?: (files: File[]) => Promise<UploadedFileItemProps[]> | UploadedFileItemProps[];
    onFilesAddedSuccess?: (files: UploadedFileItemProps[]) => void;
    onFileDeleted?: (file: UploadedFileItemProps) => void;
    onUploadComplete?: (
        fileId: string,
        result:
            | File
            | {
                  url: string;
                  [key: string]: string;
              }
    ) => void;
    onUploadError?: (fileId: string, error: Error) => void;
}

export const FileUploadForm = <
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    control,
    name,
    label,
    isRequired,
    storageMode = "files",
    uploadFn,
    transformFiles,
    onFilesAddedSuccess,
    onFileDeleted,
    onUploadComplete,
    onUploadError,
    ...props
}: FileUploadFormProps<TFieldValues, TName>) => {
    return (
        <FormFieldWrapper control={control} name={name} label={label} isRequired={isRequired}>
            {field => {
                const { value, onChange } = field;

                /**
                 * Affiche les fichiers pour la UI.
                 */
                const getFilesForDisplay = (): UploadedFileItemProps[] => {
                    if (!value) return [];

                    if (storageMode === "files") {
                        return (value as File[]).map(file => ({
                            id: `${file.name}-${file.size}`,
                            name: file.name,
                            size: file.size,
                            progress: 100,
                            file,
                            type: file.type,
                        }));
                    }
                    return value as UploadedFileItemProps[];
                };

                const filesInForm = getFilesForDisplay();

                /**
                 * Simule un upload rapide.
                 */
                const simulateQuickUpload = (fileId: string) => {
                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += 10;

                        if (storageMode === "metadata") {
                            // On utilise une fonction de mise à jour pour éviter de dépendre de 'value'
                            onChange((prevFiles: UploadedFileItemProps[] = []) =>
                                prevFiles.map(f =>
                                    f.id === fileId
                                        ? { ...f, progress: Math.min(progress, 100) }
                                        : f
                                )
                            );
                        }

                        if (progress >= 100) {
                            clearInterval(interval);
                        }
                    }, 100);
                };

                /**
                 * Upload réel vers service tiers.
                 */
                const startRealUpload = async (fileItem: UploadedFileItemProps) => {
                    if (!fileItem.file || !uploadFn) return;

                    try {
                        const result = await uploadFn(fileItem.file, progress => {
                            // Mise à jour de la progression
                            onChange((prevFiles: UploadedFileItemProps[] = []) =>
                                prevFiles.map(f => (f.id === fileItem.id ? { ...f, progress } : f))
                            );
                        });

                        // Marquer comme complet
                        onChange((prevFiles: UploadedFileItemProps[] = []) =>
                            prevFiles.map(f =>
                                f.id === fileItem.id
                                    ? {
                                          ...f,
                                          progress: 100,
                                          failed: false,
                                          ...result,
                                          file: undefined,
                                      }
                                    : f
                            )
                        );
                        onUploadComplete?.(fileItem.id, result);
                    } catch (error) {
                        console.error(`Upload failed for ${fileItem.name}:`, error);

                        // Marquer l'échec
                        onChange((prevFiles: UploadedFileItemProps[] = []) =>
                            prevFiles.map(f =>
                                f.id === fileItem.id ? { ...f, failed: true, progress: 0 } : f
                            )
                        );
                        onUploadError?.(fileItem.id, error as Error);
                    }
                };

                /**
                 * Gère l'ajout des fichiers.
                 */
                const handleFilesAdded = async (files: File[]) => {
                    try {
                        let newFileItems: UploadedFileItemProps[];

                        if (transformFiles) {
                            newFileItems = await Promise.resolve(transformFiles(files));
                        } else {
                            newFileItems = files.map(file =>
                                createFileItem(file, {
                                    progress: uploadFn || storageMode === "files" ? 0 : 100,
                                })
                            );
                        }

                        // Mise à jour RHF
                        const max = props.maxFiles ?? Infinity;
                        if (storageMode === "files") {
                            const currentFiles = (value as File[]) || [];
                            const newFiles = newFileItems.map(item => item.file!);
                            onChange([...currentFiles, ...newFiles].slice(0, max));

                            if (!uploadFn) {
                                newFileItems.forEach(fileItem => simulateQuickUpload(fileItem.id));
                            }
                        } else {
                            const updatedFiles = [...filesInForm, ...newFileItems].slice(0, max);
                            onChange(updatedFiles);
                        }

                        if (uploadFn) {
                            newFileItems.forEach(fileItem => startRealUpload(fileItem));
                        }
                        onFilesAddedSuccess?.(newFileItems);
                    } catch (error) {
                        console.error("Error processing files:", error);
                    }
                };

                /**
                 * Gère la suppression d'un fichier.
                 */
                const handleDeleteFile = (fileId: string) => {
                    const fileToDelete = filesInForm.find(f => f.id === fileId);

                    if (storageMode === "files") {
                        const currentFiles = (value as File[]) || [];
                        const updatedFiles = currentFiles.filter(
                            f => f.name !== fileToDelete?.name || f.size !== fileToDelete?.size
                        );
                        onChange(updatedFiles);
                    } else {
                        const updatedFiles = filesInForm.filter(f => f.id !== fileId);
                        onChange(updatedFiles);
                    }
                    if (fileToDelete) {
                        onFileDeleted?.(fileToDelete);
                    }
                };

                /**
                 * Gère la relance d'un upload en échec.
                 */
                const handleRetryFile = (fileId: string) => {
                    const fileToRetry = filesInForm.find(f => f.id === fileId);

                    if (fileToRetry && uploadFn) {
                        // Réinitialiser et relancer l'upload
                        onChange((prevFiles: UploadedFileItemProps[] = []) =>
                            prevFiles.map(f =>
                                f.id === fileId ? { ...f, failed: false, progress: 0 } : f
                            )
                        );
                        startRealUpload(fileToRetry);
                    }
                };

                return (
                    <FileUpload
                        {...props}
                        files={filesInForm}
                        onFilesAdded={handleFilesAdded}
                        onDeleteFile={handleDeleteFile}
                        onRetryFile={handleRetryFile}
                    />
                );
            }}
        </FormFieldWrapper>
    );
};

// Pour les cas d'usage avancés
export const FileUploadCustom = {
    Root: FileUploadRoot,
    List: FileUploadList,
    DropZone: FileUploadDropZone,
    ListItemProgressBar: FileListItemProgressBar,
    ListItemProgressFill: FileListItemProgressFill,
};
