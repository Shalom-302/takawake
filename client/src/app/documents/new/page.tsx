"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentProvider, useDocuments } from "@/lib/contexts/document-context";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SignatureType } from "@/lib/services/document-service";
import {
    UploadCloud,
    Plus,
    Trash2,
    ArrowLeft,
    FileText,
    Users,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Signatory {
    email: string;
    name: string;
    role: string;
    order: number;
}

function NewDocumentContent() {
    const router = useRouter();
    const { createDocument, isLoading } = useDocuments();
    const [file, setFile] = useState<File | null>(null);
    const [signatories, setSignatories] = useState<Signatory[]>([]);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "loading" | "success" | "error">(
        "idle"
    );
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("details");

    // Validation schema
    const formSchema = z.object({
        name: z.string().min(3, {
            message: "The document name must contain at least 3 characters.",
        }),
        description: z.string().optional(),
        signatureType: z.enum([
            SignatureType.STANDARD,
            SignatureType.ADVANCED,
            SignatureType.QUALIFIED,
        ]),
        workflow: z.enum(["sequential", "parallel"]),
        expiration: z.enum(["7", "14", "30", "60", "90"]),
    });

    type FormValues = z.infer<typeof formSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            signatureType: SignatureType.STANDARD,
            workflow: "sequential",
            expiration: "30",
        },
    });

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];

            // Check file type (PDF, DOCX)
            const allowedTypes = [
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];
            if (!allowedTypes.includes(selectedFile.type)) {
                setUploadError(
                    "The file type is not supported. Please upload a PDF or Word document."
                );
                setFile(null);
                e.target.value = "";
                return;
            }

            // Check file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (selectedFile.size > maxSize) {
                setUploadError("The file is too large. Maximum 10MB allowed.");
                setFile(null);
                e.target.value = "";
                return;
            }

            setFile(selectedFile);
            setUploadError(null);

            // Try to extract the document name from the file name
            const fileName = selectedFile.name.split(".")[0].replace(/[_-]/g, " ");
            if (form.getValues("name") === "") {
                form.setValue("name", fileName);
            }
        }
    };

    // Add a signatory
    const addSignatory = () => {
        setSignatories([
            ...signatories,
            {
                email: "",
                name: "",
                role: "signer",
                order: signatories.length + 1,
            },
        ]);
    };

    // Remove signatory
    const removeSignatory = (index: number) => {
        const newSignatories = [...signatories];
        newSignatories.splice(index, 1);

        // Update order
        newSignatories.forEach((signatory, idx) => {
            signatory.order = idx + 1;
        });

        setSignatories(newSignatories);
    };

    // Update signatory
    const updateSignatory = (index: number, field: keyof Signatory, value: string) => {
        const newSignatories = [...signatories];
        newSignatories[index] = {
            ...newSignatories[index],
            [field]: value,
        };
        setSignatories(newSignatories);
    };

    // Handle active tab
    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    // Handle form submission
    const onSubmit = async (values: FormValues) => {
        if (!file) {
            setUploadError("Please select a file to upload.");
            return;
        }

        // Validate signatories
        const validSignatories = signatories.filter(s => s.email && s.name);
        if (validSignatories.length === 0) {
            setActiveTab("signatories");
            setUploadError("Please add at least one signatory.");
            return;
        }

        setUploadStatus("loading");
        setUploadError(null);

        try {
            await createDocument({
                name: values.name,
                description: values.description || "",
                file: file,
                signature_type: values.signatureType,
                workflow_type: values.workflow,
                expiration_days: parseInt(values.expiration),
                signatories: validSignatories,
            });

            setUploadStatus("success");

            // Redirect to document list after a short delay
            setTimeout(() => {
                router.push("/documents");
            }, 1500);
        } catch (error) {
            console.error("Error creating document:", error);
            setUploadStatus("error");
            setUploadError("An error occurred while creating the document. Please try again.");
        }
    };

    // Check form is valid to proceed to next step
    const canProceedToSignatories = file && form.getValues("name");

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">New document</h1>
                    <p className="text-muted-foreground">
                        Upload a document and configure the signature workflow
                    </p>
                </div>

                <Button variant="outline" onClick={() => router.push("/documents")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancel
                </Button>
            </div>

            {uploadStatus === "success" ? (
                <Alert variant="success">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Document created successfully!</AlertTitle>
                    <AlertDescription>
                        Your document has been uploaded and the signature workflow initialized. You
                        will be redirected to the document list.
                    </AlertDescription>
                </Alert>
            ) : uploadStatus === "error" ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {uploadError || "An error occurred while creating the document."}
                    </AlertDescription>
                </Alert>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Tabs value={activeTab} onValueChange={handleTabChange}>
                            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                                <TabsTrigger value="details">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Document
                                </TabsTrigger>
                                <TabsTrigger
                                    value="signatories"
                                    disabled={!canProceedToSignatories}
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    Signatories
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="details">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Document details</CardTitle>
                                        <CardDescription>
                                            Upload your document and provide basic information
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Upload du fichier */}
                                        <div className="space-y-2">
                                            <Label>Document to sign</Label>
                                            <div
                                                className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors ${
                                                    file
                                                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                                        : "border-gray-300"
                                                }`}
                                                onClick={() =>
                                                    document
                                                        .getElementById("document-upload")
                                                        ?.click()
                                                }
                                            >
                                                {file ? (
                                                    <>
                                                        <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
                                                        <p className="font-medium">{file.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {(file.size / 1024 / 1024).toFixed(2)}{" "}
                                                            MB
                                                        </p>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            type="button"
                                                            className="mt-2"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                setFile(null);
                                                                if (
                                                                    document.getElementById(
                                                                        "document-upload"
                                                                    )
                                                                ) {
                                                                    (
                                                                        document.getElementById(
                                                                            "document-upload"
                                                                        ) as HTMLInputElement
                                                                    ).value = "";
                                                                }
                                                            }}
                                                        >
                                                            Change file
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                                                        <p className="font-medium">
                                                            Click to upload
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            PDF, DOCX (max. 10MB)
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                            <Input
                                                id="document-upload"
                                                type="file"
                                                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                            {uploadError && (
                                                <p className="text-sm text-red-500 mt-1">
                                                    {uploadError}
                                                </p>
                                            )}
                                        </div>

                                        {/* Nom et description */}
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Document name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Contract of sale"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description (optional)</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Description of the document and its purpose"
                                                            className="resize-none"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        A brief description to help signatories
                                                        understand the document
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Signature type */}
                                        <FormField
                                            control={form.control}
                                            name="signatureType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Signature type</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a signature type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem
                                                                value={SignatureType.STANDARD}
                                                            >
                                                                Standard (Basic)
                                                            </SelectItem>
                                                            <SelectItem
                                                                value={SignatureType.ADVANCED}
                                                            >
                                                                Advanced (With certificate)
                                                            </SelectItem>
                                                            <SelectItem
                                                                value={SignatureType.QUALIFIED}
                                                            >
                                                                Qualified (Legal value)
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>
                                                        The level of security and legal validity of
                                                        the signature
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Workflow configuration */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="workflow"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Workflow type</FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select a workflow type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="sequential">
                                                                    Sequential (In order)
                                                                </SelectItem>
                                                                <SelectItem value="parallel">
                                                                    Parallel (All at the same time)
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormDescription>
                                                            How signatories will receive the
                                                            requests
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="expiration"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Expiration</FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select a duration" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="7">
                                                                    7 days
                                                                </SelectItem>
                                                                <SelectItem value="14">
                                                                    14 days
                                                                </SelectItem>
                                                                <SelectItem value="30">
                                                                    30 days
                                                                </SelectItem>
                                                                <SelectItem value="60">
                                                                    60 days
                                                                </SelectItem>
                                                                <SelectItem value="90">
                                                                    90 days
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormDescription>
                                                            Duration before expiration of signature
                                                            requests
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end">
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                if (canProceedToSignatories) {
                                                    setActiveTab("signatories");
                                                }
                                            }}
                                            disabled={!canProceedToSignatories}
                                        >
                                            Next
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>

                            <TabsContent value="signatories">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Signatories</CardTitle>
                                        <CardDescription>
                                            Add the people who need to sign this document
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {signatories.length === 0 ? (
                                            <div
                                                className="border-2 border-dashed rounded-md p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={addSignatory}
                                            >
                                                <Users className="h-10 w-10 text-muted-foreground mb-2" />
                                                <p className="font-medium">No signatories added</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Click to add a signatory
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {signatories.map((signatory, index) => (
                                                    <div
                                                        key={index}
                                                        className="border rounded-md p-4 space-y-4"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center">
                                                                <div className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center mr-2">
                                                                    {signatory.order}
                                                                </div>
                                                                <h4 className="font-medium">
                                                                    Signatory {index + 1}
                                                                </h4>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                type="button"
                                                                onClick={() =>
                                                                    removeSignatory(index)
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label
                                                                    htmlFor={`signatory-name-${index}`}
                                                                >
                                                                    Name
                                                                </Label>
                                                                <Input
                                                                    id={`signatory-name-${index}`}
                                                                    value={signatory.name}
                                                                    onChange={e =>
                                                                        updateSignatory(
                                                                            index,
                                                                            "name",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    placeholder="Full name"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label
                                                                    htmlFor={`signatory-email-${index}`}
                                                                >
                                                                    Email
                                                                </Label>
                                                                <Input
                                                                    id={`signatory-email-${index}`}
                                                                    type="email"
                                                                    value={signatory.email}
                                                                    onChange={e =>
                                                                        updateSignatory(
                                                                            index,
                                                                            "email",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    placeholder="email@example.com"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label
                                                                htmlFor={`signatory-role-${index}`}
                                                            >
                                                                Role
                                                            </Label>
                                                            <Select
                                                                value={signatory.role}
                                                                onValueChange={value =>
                                                                    updateSignatory(
                                                                        index,
                                                                        "role",
                                                                        value
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger
                                                                    id={`signatory-role-${index}`}
                                                                >
                                                                    <SelectValue placeholder="Select a role" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="signer">
                                                                        Signer
                                                                    </SelectItem>
                                                                    <SelectItem value="approver">
                                                                        Approver
                                                                    </SelectItem>
                                                                    <SelectItem value="viewer">
                                                                        Viewer (no signature)
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                ))}

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={addSignatory}
                                                    className="w-full"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add a signatory
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-between">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setActiveTab("details")}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isLoading || signatories.length === 0}
                                        >
                                            {isLoading ? "Creating..." : "Create document"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </form>
                </Form>
            )}
        </div>
    );
}

export default function NewDocumentPage() {
    return (
        <DocumentProvider>
            <div className="container py-6">
                <NewDocumentContent />
            </div>
        </DocumentProvider>
    );
}
