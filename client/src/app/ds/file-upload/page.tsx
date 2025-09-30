"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CodeBlock } from "@/ds/components/code-block";
import {
    FileUpload,
    type FileProgressVariant,
    type UploadedFileItemProps,
    type FileType,
    FileUploadForm,
} from "@/components/ui/file-upload";
import { createFileItem, getReadableFileSize, simulateUploadFile } from "@/lib/utils/file-upload";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { ProfilImagePreview } from "@/components/ui/file-upload/upload-media-preview";
import { Button } from "@/components/ui/buttons";
import { toast } from "sonner";

const MAX_SIZE = 1024 * 1024 * 1; // 1MB

// Fichiers de démonstration
const placeholderFiles: UploadedFileItemProps[] = [
    {
        id: "file-01",
        name: "Example dashboard screenshot.jpg",
        type: "jpg",
        size: 720 * 1024,
        progress: 50,
    },
    {
        id: "file-02",
        name: "Tech design requirements_2.pdf",
        type: "pdf",
        size: 720 * 1024,
        progress: 100,
    },
    {
        id: "file-03",
        name: "Tech motion requirements.pdf",
        type: "pdf",
        failed: true,
        size: 1024 * 1024 * 1,
        progress: 0,
    },
];

export default function FileUploadPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">FileUpload</h1>
                <p className="text-muted-foreground mt-2">
                    A comprehensive file upload component with drag & drop functionality, progress
                    tracking, and extensive customization options. Available as a simplified
                    component or individual components for complex use cases.
                </p>
            </div>

            {/* Basic example */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Basic example</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <BasicFileUploadExample />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`const [files, setFiles] = useState<UploadedFileItemProps[]>([]);

    const handleFilesAdded = (newFiles: File[]) => {
        const newFilesWithIds = newFiles.map(file => ({
            id: Math.random().toString(),
            name: file.name,
            size: file.size,
            type: file.type as FileType,
            progress: 0,
        }));

        setFiles([...newFilesWithIds, ...files]);

        newFiles.forEach((file, index) => {
            const fileObject = newFiles.find(
                f =>
                    f.name === newFilesWithIds.find(nf => nf.id === newFilesWithIds[index].id)?.name
            );
            if (fileObject) {
                simulateUploadFile( progress => {
                    setFiles(prev =>
                        prev.map(f => (f.id === newFilesWithIds[index].id ? { ...f, progress } : f))
                    );
                });
            }
        });
    };

    const handleDeleteFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleRetryFile = (id: string) => {
        const file = files.find(f => f.id === id);
        if (!file) return;

        simulateUploadFile( progress => {
            setFiles(prev => prev.map(f => (f.id === id ? { ...f, progress, failed: false } : f)));
        });
    };

    return (
        <FileUpload
            variant="progress-bar"
            files={files}
            onFilesAdded={handleFilesAdded}
            onDeleteFile={handleDeleteFile}
            onRetryFile={handleRetryFile}
        />
    );`}
                    />
                </div>
            </div>

            {/* Progress variants */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Progress variants</h2>
                <div className="grid grid-cols-1 gap-8">
                    {[
                        {
                            variant: "progress-bar",
                            description:
                                "Shows progress with a traditional progress bar below file info",
                        },
                        {
                            variant: "progress-fill",
                            description: "Shows progress with a background fill effect",
                        },
                    ].map(({ variant, description }) => (
                        <div key={variant} className="p-4 border border-tertiary rounded-lg">
                            <p className="text-sm text-muted-foreground mb-4">
                                <strong>Variant: {variant}</strong> - {description}
                            </p>
                            <div className="mb-4">
                                <FileProgressVariantExample
                                    variant={variant as FileProgressVariant}
                                />
                            </div>
                            <CodeBlock
                                className="mt-2"
                                code={`  const [files, setFiles] = useState<UploadedFileItemProps[]>(placeholderFiles);

    const handleFilesAdded = (newFiles: File[]) => {
        const newFilesWithIds = newFiles.map(file => ({
            id: Math.random().toString(),
            name: file.name,
            size: file.size,
            type: file.type as FileType,
            progress: 0,
        }));

        setFiles([...newFilesWithIds, ...files]);

        newFiles.forEach((file, index) => {
            const fileObject = newFiles.find(
                f =>
                    f.name === newFilesWithIds.find(nf => nf.id === newFilesWithIds[index].id)?.name
            );
            if (fileObject) {
                simulateUploadFile( progress => {
                    setFiles(prev =>
                        prev.map(f => (f.id === newFilesWithIds[index].id ? { ...f, progress } : f))
                    );
                });
            }
        });
    };

    const handleDeleteFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleRetryFile = (id: string) => {
        const file = files.find(f => f.id === id);
        if (!file) return;

        simulateUploadFile( progress => {
            setFiles(prev => prev.map(f => (f.id === id ? { ...f, progress, failed: false } : f)));
        });
    };

    return (
        <FileUpload
            files={files}
            variant="${variant}"
            onFilesAdded={handleFilesAdded}
            onDeleteFile={handleDeleteFile}
            onRetryFile={handleRetryFile}
        />
    );`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Form example */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Form example</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <ExampleForm />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`const fileUploadSchema = z.object({
    documents: z.array(z.file()).min(1, "Upload at least one doc"),
    profileImage: z.array(z.file()).nonempty("Upload an image for your profile"),
});

type FormData = z.infer<typeof fileUploadSchema>;
const form = useForm<FormData>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
        documents: [],
        profileImage: [],
    },
});



const onSubmit = async (data: FormData) => {
    const fileContent: {
        documents: string[];
        // CHANGEMENT : 'profileImage' est une chaîne simple car maxFiles=1
        profileImage: string;
    } = { documents: [], profileImage: "" };

    const documentPromises = data.documents.map(async (file: File) => {
        return \`Nom: \${file.name}, Taille: \${file.size} octets\`;
    });
    fileContent.documents = await Promise.all(documentPromises);

    const profileFile = data.profileImage[0];
    if (profileFile) {
        fileContent.profileImage = \`Nom: \${profileFile.name}, Taille: \${profileFile.size} octets\`;
    }

    toast("You submitted the following values", {
        description: (
            <pre className="mt-2 w-[600px] rounded-md bg-neutral-950 p-4">
                <code className="text-white">{JSON.stringify(fileContent, null, 2)}</code>
            </pre>
        ),
    });

    console.log("File content data:", fileContent);
};
form.watch("profileImage");

return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-start gap-10">
                <ProfilImagePreview
                    file={form.getValues("profileImage")[0]}
                    className="size-24 rounded-full"
                />
                <FileUploadForm
                    control={form.control}
                    name="profileImage"
                    label="Photo de profil"
                    isRequired
                    description="Upload your profile image"
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                    allowsMultiple={false}
                    hint="PNG, JPG or JPEG (max. 5MB)"
                    transformFiles={async files =>
                        files.map(file => createFileItem(file, { progress: 0 }))
                    }
                />
            </div>
            <FileUploadForm
                control={form.control}
                name="documents"
                label="Documents"
                hint="Upload your documents (PDF, DOC, DOCX)"
                isRequired
                accept=".pdf,.doc,.docx,application/pdf"
                maxSize={10 * 1024 * 1024} // 10MB
                maxFiles={5}
                variant="progress-bar"
                transformFiles={async files =>
                    files.map(file => createFileItem(file, { progress: 0 }))
                }
            />

            <Button type="submit">Submit</Button>
        </form>
    </Form>
);`}
                    />
                </div>
            </div>

            {/* File type restrictions */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">File type restrictions</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                        <strong>Accept: image/*</strong> - Only image files are accepted
                    </p>
                    <div className="mb-4">
                        <ImageOnlyExample />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={` const [files, setFiles] = useState<UploadedFileItemProps[]>([]);

    const handleFilesAdded = (newFiles: File[]) => {
        const newFilesWithIds = newFiles.map(file => ({
            id: Math.random().toString(),
            name: file.name,
            size: file.size,
            type: file.type as FileType,
            progress: 0,
        }));

        setFiles([...newFilesWithIds, ...files]);

        newFiles.forEach((file, index) => {
            const fileObject = newFiles.find(
                f =>
                    f.name === newFilesWithIds.find(nf => nf.id === newFilesWithIds[index].id)?.name
            );
            if (fileObject) {
                simulateUploadFile( progress => {
                    setFiles(prev =>
                        prev.map(f => (f.id === newFilesWithIds[index].id ? { ...f, progress } : f))
                    );
                });
            }
        });
    };

    const handleUnacceptedFiles = (files: FileList) => {
        console.log("Unaccepted files:", files);
        // Ici, vous pourriez afficher une notification
    };

    const handleDeleteFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleRetryFile = (id: string) => {
        const file = files.find(f => f.id === id);
        if (!file) return;

        simulateUploadFile( progress => {
            setFiles(prev => prev.map(f => (f.id === id ? { ...f, progress, failed: false } : f)));
        });
    };

    return (
        <FileUpload
            variant="progress-bar"
            files={files}
            accept="image/*"
            hint="Please upload PNG or JPEG images only."
            onFilesAdded={handleFilesAdded}
            onDeleteFile={handleDeleteFile}
            onRetryFile={handleRetryFile}
        />
    );`}
                    />
                </div>
            </div>

            {/* File size limits */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">File size limits</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                        <strong>Max size: 1MB</strong> - Files exceeding this limit will be rejected
                    </p>
                    <div className="mb-4">
                        <MaxSizeExample />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`const [files, setFiles] = useState<UploadedFileItemProps[]>([]);
    const MAX_SIZE = 1024 * 1024 * 1; // 1MB

    const handleFilesAdded = (newFiles: File[]) => {
        const newFilesWithIds = newFiles.map(file => ({
            id: Math.random().toString(),
            name: file.name,
            size: file.size,
            type: file.type as FileType,
            progress: 0,
        }));

        setFiles([...newFilesWithIds, ...files]);

        newFiles.forEach((file, index) => {
            const fileObject = newFiles.find(
                f =>
                    f.name === newFilesWithIds.find(nf => nf.id === newFilesWithIds[index].id)?.name
            );
            if (fileObject) {
                simulateUploadFile( progress => {
                    setFiles(prev =>
                        prev.map(f => (f.id === newFilesWithIds[index].id ? { ...f, progress } : f))
                    );
                });
            }
        });
    };

    const handleSizeLimitExceed = (files: FileList) => {
        console.log("Files too large:", files);
        // Ici, vous pourriez afficher une notification
    };

    const handleDeleteFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleRetryFile = (id: string) => {
        const file = files.find(f => f.id === id);
        if (!file) return;

        simulateUploadFile( progress => {
            setFiles(prev => prev.map(f => (f.id === id ? { ...f, progress, failed: false } : f)));
        });
    };

    return (
        <FileUpload
            variant="progress-bar"
            files={files}
            maxSize={MAX_SIZE}
            hint={"Upload files (max. ${getReadableFileSize(MAX_SIZE)})."}
            onFilesAdded={handleFilesAdded}
            onDeleteFile={handleDeleteFile}
            onRetryFile={handleRetryFile}
        />
    );`}
                    />
                </div>
            </div>

            {/* Single file upload */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Single file upload</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                        <strong>allowsMultiple: false</strong> - Only one file can be selected at a
                        time
                    </p>
                    <div className="mb-4">
                        <SingleFileExample />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`const [files, setFiles] = useState<UploadedFileItemProps[]>([]);

    const handleFilesAdded = (newFiles: File[]) => {
        const newFilesWithIds = newFiles.map(file => ({
            id: Math.random().toString(),
            name: file.name,
            size: file.size,
            type: file.type as FileType,
            progress: 0,
        }));

        setFiles(newFilesWithIds); // Remplace le fichier existant

        newFiles.forEach((file, index) => {
            const fileObject = newFiles.find(
                f =>
                    f.name === newFilesWithIds.find(nf => nf.id === newFilesWithIds[index].id)?.name
            );
            if (fileObject) {
                simulateUploadFile( progress => {
                    setFiles(prev =>
                        prev.map(f => (f.id === newFilesWithIds[index].id ? { ...f, progress } : f))
                    );
                });
            }
        });
    };

    const handleDeleteFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleRetryFile = (id: string) => {
        const file = files.find(f => f.id === id);
        if (!file) return;

        simulateUploadFile( progress => {
            setFiles(prev => prev.map(f => (f.id === id ? { ...f, progress, failed: false } : f)));
        });
    };

    return (
        <FileUpload
            variant="progress-bar"
            files={files}
            allowsMultiple={false}
            hint="Select a single file to upload."
            onFilesAdded={handleFilesAdded}
            onDeleteFile={handleDeleteFile}
            onRetryFile={handleRetryFile}
        />
    );`}
                    />
                </div>
            </div>

            {/* Disabled state */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Disabled state</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <DisabledExample />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`<FileUpload
  variant="progress-bar"
  files={files}
  isDisabled={true}
  hint="File upload is currently disabled."
  onFilesAdded={handleFilesAdded}
  onDeleteFile={handleDeleteFile}
  onRetryFile={handleRetryFile}
/>`}
                    />
                </div>
            </div>

            {/* API Reference */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>

                {/* FileUpload.Main */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">FileUpload</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-tertiary">
                                    <th className="text-left py-2 px-4">Props</th>
                                    <th className="text-left py-2 px-4">Type</th>
                                    <th className="text-left py-2 px-4">Default</th>
                                    <th className="text-left py-2 px-4">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">files</td>
                                    <td className="py-2 px-4 text-sm">UploadedFileItemProps[]</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        **Required.** An array of `UploadedFileItemProps` objects to
                                        display the uploaded files.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">variant?</td>
                                    <td className="py-2 px-4 text-sm">
                                        {` "progress-bar" | "progress-fill"`}
                                    </td>
                                    <td className="py-2 px-4 text-sm">{`"progress-bar"`}</td>
                                    <td className="py-2 px-4 text-sm">
                                        The progress display variant. `progress-bar` shows a
                                        progress bar below, while `progress-fill` uses a background
                                        fill effect.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">accept?</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        {` Accepted file types (e.g., "image/*", ".pdf,.docx").`}
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">maxSize?</td>
                                    <td className="py-2 px-4 text-sm">number</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        Maximum file size in bytes. Larger files will be rejected.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">allowsMultiple?</td>
                                    <td className="py-2 px-4 text-sm">boolean</td>
                                    <td className="py-2 px-4 text-sm">true</td>
                                    <td className="py-2 px-4 text-sm">
                                        Allows multiple file selection.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">hint?</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        Hint text displayed in the drop zone.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">isDisabled?</td>
                                    <td className="py-2 px-4 text-sm">boolean</td>
                                    <td className="py-2 px-4 text-sm">false</td>
                                    <td className="py-2 px-4 text-sm">
                                        Disables the upload functionality.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">onFilesAdded?</td>
                                    <td className="py-2 px-4 text-sm">
                                        (files: File[]) =&gt; void
                                    </td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        Called when files are added (dropped or selected).
                                    </td>
                                </tr>

                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">onDeleteFile?</td>
                                    <td className="py-2 px-4 text-sm">
                                        (fileId: string) =&gt; void
                                    </td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        Called when a file is deleted.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">onRetryFile?</td>
                                    <td className="py-2 px-4 text-sm">
                                        (fileId: string) =&gt; void
                                    </td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        Called when file upload is retried.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* UploadedFileItemProps Type */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">UploadedFileItemProps</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-tertiary">
                                    <th className="text-left py-2 px-4">Props</th>
                                    <th className="text-left py-2 px-4">Type</th>
                                    <th className="text-left py-2 px-4">Default</th>
                                    <th className="text-left py-2 px-4">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">id</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        Unique identifier for the file
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">name</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">File name</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">size</td>
                                    <td className="py-2 px-4 text-sm">number</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">File size in bytes</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">progress</td>
                                    <td className="py-2 px-4 text-sm">number</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">Upload progress (0-100)</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">failed?</td>
                                    <td className="py-2 px-4 text-sm">boolean</td>
                                    <td className="py-2 px-4 text-sm">false</td>
                                    <td className="py-2 px-4 text-sm">Whether the upload failed</td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">type?</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        File type for icon display
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">url?</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        The final URL of the file after upload.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">FileUploadForm</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        This component inherits all UI props from the base `FileUpload` component
                        (e.g., `accept`, `maxSize`, `variant`, etc.) and adds the following for RHF
                        integration and upload logic.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-tertiary">
                                    <th className="text-left py-2 px-4">Prop</th>
                                    <th className="text-left py-2 px-4">Type</th>
                                    <th className="text-left py-2 px-4">Default</th>
                                    <th className="text-left py-2 px-4">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* RHF Props */}
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">control</td>
                                    <td className="py-2 px-4 text-sm">
                                        Control&lt;TFieldValues&gt;
                                    </td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        **Required.** The `control` object from `react-hook-form`.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">name</td>
                                    <td className="py-2 px-4 text-sm">
                                        FieldPath&lt;TFieldValues&gt;
                                    </td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        **Required.** The field name in the form schema (e.g.,
                                        &quot;documents&quot;).
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">label</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        Label displayed above the input field.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">storageMode?</td>
                                    <td className="py-2 px-4 text-sm">{`'files' | 'metadata'`}</td>
                                    <td className="py-2 px-4 text-sm">{`'files'`}</td>
                                    <td className="py-2 px-4 text-sm">
                                        Defines the RHF field value format. **&apos;files&apos;**
                                        stores raw `File[]`. **&apos;metadata&apos;** stores
                                        `UploadedFileItemProps[]` (with URL/ID after upload).
                                    </td>
                                </tr>
                                {/* Upload Logic Props */}
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">uploadFn?</td>
                                    <td className="py-2 px-4 text-sm">{`(file, onProgress) => Promise<TResult>`}</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        Asynchronous function to upload the file to a third-party
                                        service.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">transformFiles?</td>
                                    <td className="py-2 px-4 text-sm">{`(files) => UploadedFileItemProps[]`}</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        Function to map raw `File` objects to the
                                        `UploadedFileItemProps` interface before adding them to the
                                        component state.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">onUploadComplete?</td>
                                    <td className="py-2 px-4 text-sm">{`(fileId, result) => void`}</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        Called after a successful upload, with the file ID and the
                                        result from `uploadFn`.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">onFileDeleted?</td>
                                    <td className="py-2 px-4 text-sm">{`(file: UploadedFileItemProps) => void`}</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        Callback triggered when a file is successfully deleted from
                                        the list.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Custom Components */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">
                        Custom Components with FileUploadCustom
                    </h3>
                    <p className="text-sm text-secondary mb-4">For advanced customization:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>
                            <code className="bg-gray-100 px-1 rounded">FileUploadCustom.Root</code>{" "}
                            - Container wrapper
                        </li>
                        <li>
                            <code className="bg-gray-100 px-1 rounded">
                                FileUploadCustom.DropZone
                            </code>
                            - File drop and selection area
                        </li>
                        <li>
                            <code className="bg-gray-100 px-1 rounded">FileUploadCustom.List</code>{" "}
                            - Container for file list items
                        </li>
                        <li>
                            <code className="bg-gray-100 px-1 rounded">
                                FileUploadCustom.ListItemProgressBar
                            </code>{" "}
                            - File item with progress bar
                        </li>
                        <li>
                            <code className="bg-gray-100 px-1 rounded">
                                FileUploadCustom.ListItemProgressFill
                            </code>{" "}
                            - File item with fill progress
                        </li>
                    </ul>
                </div>

                {/* Utilities */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Utilities</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-tertiary">
                                    <th className="text-left py-2 px-4">Function</th>
                                    <th className="text-left py-2 px-4">Signature</th>
                                    <th className="text-left py-2 px-4">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">getReadableFileSize</td>
                                    <td className="py-2 px-4 text-sm">
                                        (bytes: number) =&gt; string
                                    </td>
                                    <td className="py-2 px-4 text-sm">
                                        Converts bytes to human-readable format (KB, MB, etc.)
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Composants pour les exemples
function BasicFileUploadExample() {
    const [files, setFiles] = useState<UploadedFileItemProps[]>([]);

    const handleFilesAdded = (newFiles: File[]) => {
        const newFilesWithIds = newFiles.map(file => ({
            id: Math.random().toString(),
            name: file.name,
            size: file.size,
            type: file.type as FileType,
            progress: 0,
        }));

        setFiles([...newFilesWithIds, ...files]);

        newFiles.forEach((file, index) => {
            const fileObject = newFiles.find(
                f =>
                    f.name === newFilesWithIds.find(nf => nf.id === newFilesWithIds[index].id)?.name
            );
            if (fileObject) {
                simulateUploadFile(progress => {
                    setFiles(prev =>
                        prev.map(f => (f.id === newFilesWithIds[index].id ? { ...f, progress } : f))
                    );
                });
            }
        });
    };

    const handleDeleteFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleRetryFile = (id: string) => {
        const file = files.find(f => f.id === id);
        if (!file) return;

        simulateUploadFile(progress => {
            setFiles(prev => prev.map(f => (f.id === id ? { ...f, progress, failed: false } : f)));
        });
    };

    return (
        <FileUpload
            variant="progress-bar"
            files={files}
            onFilesAdded={handleFilesAdded}
            onDeleteFile={handleDeleteFile}
            onRetryFile={handleRetryFile}
        />
    );
}

function FileProgressVariantExample({ variant }: { variant: "progress-bar" | "progress-fill" }) {
    const [files, setFiles] = useState<UploadedFileItemProps[]>(placeholderFiles);

    const handleFilesAdded = (newFiles: File[]) => {
        const newFilesWithIds = newFiles.map(file => ({
            id: Math.random().toString(),
            name: file.name,
            size: file.size,
            type: file.type as FileType,
            progress: 0,
        }));

        setFiles([...newFilesWithIds, ...files]);

        newFiles.forEach((file, index) => {
            const fileObject = newFiles.find(
                f =>
                    f.name === newFilesWithIds.find(nf => nf.id === newFilesWithIds[index].id)?.name
            );
            if (fileObject) {
                simulateUploadFile(progress => {
                    setFiles(prev =>
                        prev.map(f => (f.id === newFilesWithIds[index].id ? { ...f, progress } : f))
                    );
                });
            }
        });
    };

    const handleDeleteFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleRetryFile = (id: string) => {
        const file = files.find(f => f.id === id);
        if (!file) return;

        simulateUploadFile(progress => {
            setFiles(prev => prev.map(f => (f.id === id ? { ...f, progress, failed: false } : f)));
        });
    };

    return (
        <FileUpload
            files={files}
            variant={variant}
            onFilesAdded={handleFilesAdded}
            onDeleteFile={handleDeleteFile}
            onRetryFile={handleRetryFile}
        />
    );
}

function ImageOnlyExample() {
    const [files, setFiles] = useState<UploadedFileItemProps[]>([]);

    const handleFilesAdded = (newFiles: File[]) => {
        const newFilesWithIds = newFiles.map(file => ({
            id: Math.random().toString(),
            name: file.name,
            size: file.size,
            type: file.type as FileType,
            progress: 0,
        }));

        setFiles([...newFilesWithIds, ...files]);

        newFiles.forEach((file, index) => {
            const fileObject = newFiles.find(
                f =>
                    f.name === newFilesWithIds.find(nf => nf.id === newFilesWithIds[index].id)?.name
            );
            if (fileObject) {
                simulateUploadFile(progress => {
                    setFiles(prev =>
                        prev.map(f => (f.id === newFilesWithIds[index].id ? { ...f, progress } : f))
                    );
                });
            }
        });
    };

    // const handleUnacceptedFiles = (files: FileList) => {
    //     console.log("Unaccepted files:", files);
    //     // Ici, vous pourriez afficher une notification
    // };

    const handleDeleteFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleRetryFile = (id: string) => {
        const file = files.find(f => f.id === id);
        if (!file) return;

        simulateUploadFile(progress => {
            setFiles(prev => prev.map(f => (f.id === id ? { ...f, progress, failed: false } : f)));
        });
    };

    return (
        <FileUpload
            variant="progress-bar"
            files={files}
            accept="image/*"
            hint="Please upload PNG or JPEG images only."
            onFilesAdded={handleFilesAdded}
            onDeleteFile={handleDeleteFile}
            onRetryFile={handleRetryFile}
        />
    );
}

function MaxSizeExample() {
    const [files, setFiles] = useState<UploadedFileItemProps[]>([]);
    const MAX_SIZE = 1024 * 1024 * 1; // 1MB

    const handleFilesAdded = (newFiles: File[]) => {
        const newFilesWithIds = newFiles.map(file => ({
            id: Math.random().toString(),
            name: file.name,
            size: file.size,
            type: file.type as FileType,
            progress: 0,
        }));

        setFiles([...newFilesWithIds, ...files]);

        newFiles.forEach((file, index) => {
            const fileObject = newFiles.find(
                f =>
                    f.name === newFilesWithIds.find(nf => nf.id === newFilesWithIds[index].id)?.name
            );
            if (fileObject) {
                simulateUploadFile(progress => {
                    setFiles(prev =>
                        prev.map(f => (f.id === newFilesWithIds[index].id ? { ...f, progress } : f))
                    );
                });
            }
        });
    };

    // const handleSizeLimitExceed = (files: FileList) => {
    //     console.log("Files too large:", files);
    //     // Ici, vous pourriez afficher une notification
    // };

    const handleDeleteFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleRetryFile = (id: string) => {
        const file = files.find(f => f.id === id);
        if (!file) return;

        simulateUploadFile(progress => {
            setFiles(prev => prev.map(f => (f.id === id ? { ...f, progress, failed: false } : f)));
        });
    };

    return (
        <FileUpload
            variant="progress-bar"
            files={files}
            maxSize={MAX_SIZE}
            hint={`Upload files (max. ${getReadableFileSize(MAX_SIZE)}).`}
            onFilesAdded={handleFilesAdded}
            onDeleteFile={handleDeleteFile}
            onRetryFile={handleRetryFile}
        />
    );
}

function SingleFileExample() {
    const [files, setFiles] = useState<UploadedFileItemProps[]>([]);

    const handleFilesAdded = (newFiles: File[]) => {
        const newFilesWithIds = newFiles.map(file => ({
            id: Math.random().toString(),
            name: file.name,
            size: file.size,
            type: file.type as FileType,
            progress: 0,
        }));

        setFiles(newFilesWithIds); // Remplace les fichiers existants

        newFiles.forEach((file, index) => {
            const fileObject = newFiles.find(
                f =>
                    f.name === newFilesWithIds.find(nf => nf.id === newFilesWithIds[index].id)?.name
            );
            if (fileObject) {
                simulateUploadFile(progress => {
                    setFiles(prev =>
                        prev.map(f => (f.id === newFilesWithIds[index].id ? { ...f, progress } : f))
                    );
                });
            }
        });
    };

    const handleDeleteFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleRetryFile = (id: string) => {
        const file = files.find(f => f.id === id);
        if (!file) return;

        simulateUploadFile(progress => {
            setFiles(prev => prev.map(f => (f.id === id ? { ...f, progress, failed: false } : f)));
        });
    };

    return (
        <FileUpload
            variant="progress-bar"
            files={files}
            allowsMultiple={false}
            hint="Select a single file to upload."
            onFilesAdded={handleFilesAdded}
            onDeleteFile={handleDeleteFile}
            onRetryFile={handleRetryFile}
        />
    );
}

function DisabledExample() {
    const [files, setFiles] = useState<UploadedFileItemProps[]>([]);

    const handleDeleteFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleRetryFile = (id: string) => {
        const file = files.find(f => f.id === id);
        if (!file) return;

        simulateUploadFile(progress => {
            setFiles(prev => prev.map(f => (f.id === id ? { ...f, progress, failed: false } : f)));
        });
    };

    return (
        <FileUpload
            variant="progress-bar"
            files={files}
            isDisabled={true}
            hint="File upload is currently disabled."
            onDeleteFile={handleDeleteFile}
            onRetryFile={handleRetryFile}
            onFilesAdded={() => {}}
        />
    );
}

export const ExampleForm = () => {
    const fileUploadSchema = z.object({
        documents: z.array(z.file()).min(1, "Upload at least one doc"),
        profileImage: z.array(z.file()).nonempty("Upload an image for your profile"),
    });

    type FormData = z.infer<typeof fileUploadSchema>;
    const form = useForm<FormData>({
        resolver: zodResolver(fileUploadSchema),
        defaultValues: {
            documents: [],
            profileImage: [],
        },
    });

    const onSubmit = async (data: FormData) => {
        const fileContent: {
            documents: string[];
            profileImage: string[];
        } = { documents: [], profileImage: [] };

        const documentPromises = data.documents.map(async (file: File) => {
            return `Nom: ${file.name}, Taille: ${file.size} octets`;
        });
        fileContent.documents = await Promise.all(documentPromises);

        const profilePromises = data.profileImage.map(async (file: File) => {
            return `Nom: ${file.name}, Taille: ${file.size} octets`;
        });
        fileContent.profileImage = await Promise.all(profilePromises);

        toast("You submitted the following values", {
            description: (
                <pre className="mt-2 w-[600px] rounded-md bg-neutral-950 p-4">
                    <code className="text-white">{JSON.stringify(fileContent, null, 2)}</code>
                </pre>
            ),
        });

        console.log("File content data:", fileContent);
    };
    form.watch("profileImage");

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-start gap-10">
                    <ProfilImagePreview
                        file={form.getValues("profileImage")[0]}
                        className="size-24 rounded-full"
                    />
                    <FileUploadForm
                        control={form.control}
                        name="profileImage"
                        label="Photo de profil"
                        isRequired
                        description="Upload your profile image"
                        accept="image/*"
                        maxSize={5 * 1024 * 1024} // 5MB
                        allowsMultiple={false}
                        hint="PNG, JPG or JPEG (max. 5MB)"
                        transformFiles={async files =>
                            files.map(file => createFileItem(file, { progress: 0 }))
                        }
                    />
                </div>
                <FileUploadForm
                    control={form.control}
                    name="documents"
                    label="Documents"
                    hint="Upload your documents (PDF, DOC, DOCX)"
                    isRequired
                    accept=".pdf,.doc,.docx,application/pdf"
                    maxSize={10 * 1024 * 1024} // 10MB
                    maxFiles={5}
                    variant="progress-bar"
                    transformFiles={async files =>
                        files.map(file => createFileItem(file, { progress: 0 }))
                    }
                />

                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
};
