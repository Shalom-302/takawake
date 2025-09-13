"use client";

import { useState } from "react";
import Link from "next/link";
import {
    CheckCircle,
    Clock,
    File,
    FileSignature,
    FileText,
    MoreVertical,
    Pencil,
    Trash2,
    Download,
    Eye,
    Shield,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/buttons/button";
import { Badge } from "@/components/ui/badges/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocuments } from "@/lib/contexts/document-context";
import { Document, DocumentStatus, WorkflowStep } from "@/lib/services/document-service";

export interface DocumentListProps {
    listType?: "grid" | "table";
    showFilters?: boolean;
}

export function DocumentList({ listType = "grid", showFilters = true }: DocumentListProps) {
    const { documents, isLoading, deleteDocument, downloadDocument } = useDocuments();
    const [filter, setFilter] = useState<DocumentStatus | "all">("all");

    const filteredDocuments =
        filter === "all" ? documents : documents.filter(doc => doc.status === filter);

    // Fonction pour afficher le statut avec un style approprié
    const getStatusBadge = (status: DocumentStatus) => {
        switch (status) {
            case DocumentStatus.DRAFT:
                return <Badge variant="outline">Brouillon</Badge>;
            case DocumentStatus.PENDING:
                return <Badge variant="secondary">En attente</Badge>;
            case DocumentStatus.SIGNED:
                return <Badge variant="default">Signé</Badge>;
            case DocumentStatus.COMPLETED:
                return (
                    <Badge variant="success" className="bg-green-600">
                        Complété
                    </Badge>
                );
            case DocumentStatus.REJECTED:
                return <Badge variant="destructive">Rejeté</Badge>;
            case DocumentStatus.EXPIRED:
                return (
                    <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800 border-amber-200"
                    >
                        Expiré
                    </Badge>
                );
            default:
                return <Badge variant="outline">Inconnu</Badge>;
        }
    };

    // Fonction pour afficher le type de fichier avec une icône appropriée
    const getFileIcon = (fileType: string) => {
        if (fileType.includes("pdf")) {
            return <FileText className="h-10 w-10 text-red-500" />;
        } else if (fileType.includes("image")) {
            return <File className="h-10 w-10 text-blue-500" />;
        } else if (fileType.includes("word") || fileType.includes("doc")) {
            return <FileText className="h-10 w-10 text-blue-700" />;
        } else {
            return <File className="h-10 w-10 text-gray-500" />;
        }
    };

    // Fonction pour afficher l'étape du workflow
    const getWorkflowStep = (step: WorkflowStep) => {
        switch (step) {
            case WorkflowStep.PREPARATION:
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                        Préparation
                    </Badge>
                );
            case WorkflowStep.SIGNATURE:
                return (
                    <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-800 border-purple-200"
                    >
                        Signature
                    </Badge>
                );
            case WorkflowStep.VERIFICATION:
                return (
                    <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-800 border-amber-200"
                    >
                        Vérification
                    </Badge>
                );
            case WorkflowStep.ARCHIVING:
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-800 border-green-200"
                    >
                        Archivage
                    </Badge>
                );
            default:
                return null;
        }
    };

    // Fonction pour le menu d'actions
    const ActionsMenu = ({ document }: { document: Document }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Menu</span>
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={`/documents/${document.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Voir</span>
                    </Link>
                </DropdownMenuItem>
                {document.status === DocumentStatus.DRAFT && (
                    <DropdownMenuItem asChild>
                        <Link href={`/documents/${document.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Modifier</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link href={`/documents/${document.id}/sign`}>
                        <FileSignature className="mr-2 h-4 w-4" />
                        <span>Signer</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadDocument(document.id)}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Télécharger</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={`/documents/${document.id}/verify`}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Vérifier</span>
                    </Link>
                </DropdownMenuItem>
                {document.status === DocumentStatus.DRAFT && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => deleteDocument(document.id)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Supprimer</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    if (isLoading) {
        return <div className="flex justify-center p-6">Chargement des documents...</div>;
    }

    return (
        <div className="space-y-4">
            {showFilters && (
                <Tabs
                    defaultValue="all"
                    className="w-full"
                    onValueChange={value => setFilter(value as DocumentStatus | "all")}
                >
                    <TabsList className="grid grid-cols-6">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value={DocumentStatus.DRAFT}>Drafts</TabsTrigger>
                        <TabsTrigger value={DocumentStatus.PENDING}>Pending</TabsTrigger>
                        <TabsTrigger value={DocumentStatus.SIGNED}>Signed</TabsTrigger>
                        <TabsTrigger value={DocumentStatus.COMPLETED}>Completed</TabsTrigger>
                        <TabsTrigger value={DocumentStatus.REJECTED}>Rejected</TabsTrigger>
                    </TabsList>
                </Tabs>
            )}

            {filteredDocuments.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No documents</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        You have no documents in this category.
                    </p>
                    <Button asChild className="mt-4">
                        <Link href="/documents/new">Add a document</Link>
                    </Button>
                </div>
            ) : listType === "grid" ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredDocuments.map(document => (
                        <Card key={document.id} className="overflow-hidden">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base">{document.name}</CardTitle>
                                        <CardDescription className="text-xs">
                                            Modified on{" "}
                                            {format(new Date(document.updated_at), "dd/MM/yyyy")}
                                        </CardDescription>
                                    </div>
                                    <ActionsMenu document={document} />
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="flex items-start space-x-4">
                                    {getFileIcon(document.file_type)}
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center space-x-2">
                                            {getStatusBadge(document.status)}
                                            {getWorkflowStep(document.workflow_step)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {document.description || "Aucune description"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0 flex justify-between text-xs text-muted-foreground">
                                <div className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {format(new Date(document.created_at), "dd/MM/yyyy")}
                                </div>
                                {document.signatures.length > 0 && (
                                    <div className="flex items-center">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        {document.signatures.length} signature
                                        {document.signatures.length > 1 ? "s" : ""}
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Step</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Updated At</TableHead>
                                <TableHead>Signatures</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDocuments.map(document => (
                                <TableRow key={document.id}>
                                    <TableCell className="font-medium flex items-center">
                                        {getFileIcon(document.file_type)}
                                        <div className="ml-2">
                                            <div>{document.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {document.description || "No description"}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(document.status)}</TableCell>
                                    <TableCell>{getWorkflowStep(document.workflow_step)}</TableCell>
                                    <TableCell>
                                        {format(new Date(document.created_at), "dd/MM/yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(document.updated_at), "dd/MM/yyyy")}
                                    </TableCell>
                                    <TableCell>{document.signatures.length}</TableCell>
                                    <TableCell className="text-right">
                                        <ActionsMenu document={document} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
