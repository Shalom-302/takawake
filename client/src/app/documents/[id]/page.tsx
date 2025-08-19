"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DocumentProvider } from "@/lib/contexts/document-context";
import { DocumentViewer } from "@/components/documents/document-viewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface DocumentPageProps {
    params: {
        id: string;
    };
}

export default function DocumentPage({ params }: DocumentPageProps) {
    const router = useRouter();

    return (
        <DocumentProvider>
            <div className="container py-6 space-y-6">
                <Button
                    variant="ghost"
                    className="flex items-center"
                    onClick={() => router.push("/documents")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la liste
                </Button>

                <DocumentViewer documentId={params.id} />
            </div>
        </DocumentProvider>
    );
}
