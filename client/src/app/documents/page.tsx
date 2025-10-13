"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentList } from "@/components/documents/document-list";
import { Plus, FileUp, FileText } from "lucide-react";
import { useDocuments } from "@/lib/contexts/document-context";
import { DocumentStatus, SignatureType } from "@/lib/services/document-service";

export default function DocumentsPage() {
    const { documents, fetchDocuments } = useDocuments();
    const [viewType, setViewType] = useState<"grid" | "table">("grid");
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        signed: 0,
        certificates: 0,
        newLastMonth: 0,
        newToday: 0,
        signedLastMonth: 0,
        expiringCertificates: 0,
    });

    // Fetch documents on mount
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Calculate statistics based on documents data
    useEffect(() => {
        if (documents.length === 0) return;

        const now = new Date();
        const lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);

        const thirtyDaysFromNow = new Date(now);
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        // Count documents by status
        const newLastMonth = documents.filter(doc => new Date(doc.created_at) > lastMonth).length;

        const newToday = documents.filter(doc => new Date(doc.created_at) > startOfToday).length;

        const pending = documents.filter(doc => doc.status === DocumentStatus.PENDING).length;

        const signed = documents.filter(
            doc => doc.status === DocumentStatus.SIGNED || doc.status === DocumentStatus.COMPLETED
        ).length;

        const signedLastMonth = documents.filter(
            doc =>
                (doc.status === DocumentStatus.SIGNED || doc.status === DocumentStatus.COMPLETED) &&
                doc.updated_at &&
                new Date(doc.updated_at) > lastMonth
        ).length;

        // Count signatures with digital certificates
        const certificateSigs = documents.reduce((count, doc) => {
            const certSigs =
                doc.signatures?.filter(
                    sig =>
                        sig.signature_type === SignatureType.ADVANCED ||
                        sig.signature_type === SignatureType.QUALIFIED
                ).length || 0;
            return count + certSigs;
        }, 0);

        // For this example, we'll just show 0 expiring certificates
        // In a real app, you'd need to get this from a certificate service
        const expiringCertificates = 0;

        setStats({
            total: documents.length,
            pending,
            signed,
            certificates: certificateSigs,
            newLastMonth,
            newToday,
            signedLastMonth,
            expiringCertificates,
        });
    }, [documents]);

    return (
        <div className="container py-10 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your documents and track signature workflows
                    </p>
                </div>

                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setViewType(viewType === "grid" ? "table" : "grid")}
                    >
                        {viewType === "grid" ? "Table" : "Grid"}
                    </Button>
                    <Button asChild>
                        <Link href="/documents/new">
                            <Plus className="mr-2 h-4 w-4" />
                            New document
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            +{stats.newLastMonth} since last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Signatures</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.newToday} added today
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Signed this month</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <rect width="20" height="14" x="2" y="5" rx="2" />
                            <path d="M2 10h20" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.signed}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.signedLastMonth > 0 ? "+" : ""}
                            {Math.round(
                                (stats.signedLastMonth /
                                    Math.max(1, stats.signed - stats.signedLastMonth)) *
                                    100
                            )}
                            % since last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Certificate Signatures
                        </CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.certificates}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.expiringCertificates} expires in 30 days
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Document list */}
            <DocumentList listType={viewType} />

            {/* Guide rapide */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>How it works</CardTitle>
                    <CardDescription>
                        Quick guide for document and signature management
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <FileUp className="h-5 w-5 mr-2 text-primary" />
                            <h4 className="font-medium">1. Import a document</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Upload any PDF, Word, or image document you want to sign
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2 text-primary"
                            >
                                <path
                                    d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.075 12.975 13.8623 12.975 13.6C12.975 11.72 12.4778 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <h4 className="font-medium">2. Add signatories</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Invite the people who need to sign the document by email
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2 text-primary"
                            >
                                <path
                                    d="M3.5 2C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V4.70711L9.29289 2H3.5ZM2 2.5C2 1.67157 2.67157 1 3.5 1H9.5C9.63261 1 9.75979 1.05268 9.85355 1.14645L12.7803 4.07322C12.921 4.21388 13 4.40464 13 4.60355V12.5C13 13.3284 12.3284 14 11.5 14H3.5C2.67157 14 2 13.3284 2 12.5V2.5ZM4.75 7.5C4.75 7.22386 4.97386 7 5.25 7H9.75C10.0261 7 10.25 7.22386 10.25 7.5C10.25 7.77614 10.0261 8 9.75 8H5.25C4.97386 8 4.75 7.77614 4.75 7.5ZM5.25 9.5C4.97386 9.5 4.75 9.72386 4.75 10C4.75 10.2761 4.97386 10.5 5.25 10.5H9.75C10.0261 10.5 10.25 10.2761 10.25 10C10.25 9.72386 10.0261 9.5 9.75 9.5H5.25Z"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <h4 className="font-medium">3. Track the process</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Monitor the progress of the signature and receive notifications
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
