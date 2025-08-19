"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Document as PDFDocument, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ZoomIn,
    ZoomOut,
    RotateCcw,
    RotateCw,
    ChevronLeft,
    ChevronRight,
    FileSignature,
    Download,
    Shield,
    Clock,
} from "lucide-react";
import { SignaturePadComponent } from "./signature-pad";
import { WorkflowStatus } from "./workflow-status";
import {
    Document,
    DocumentStatus,
    SignatureType,
    Signature as SignatureModel,
} from "@/lib/services/document-service";
import { useDocuments } from "@/lib/contexts/document-context";

// Importer la worker pour PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
    documentId: string;
    enableSignature?: boolean;
    enableWorkflow?: boolean;
}

export function DocumentViewer({
    documentId,
    enableSignature = true,
    enableWorkflow = true,
}: DocumentViewerProps) {
    const { fetchDocument, currentDocument, downloadDocument, signDocument, isLoading } =
        useDocuments();
    const router = useRouter();

    // État pour le PDF
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [rotation, setRotation] = useState<number>(0);
    const [pdfError, setPdfError] = useState<Error | null>(null);

    // État pour la signature
    const [showSignaturePad, setShowSignaturePad] = useState<boolean>(false);
    const [signaturePosition, setSignaturePosition] = useState<{
        x: number;
        y: number;
        page: number;
    } | null>(null);
    const [signatures, setSignatures] = useState<SignatureModel[]>([]);

    // Référence au conteneur du PDF
    const pdfContainerRef = useRef<HTMLDivElement>(null);

    // Récupérer le document au chargement
    useEffect(() => {
        fetchDocument(documentId);
    }, [documentId, fetchDocument]);

    // Mettre à jour les signatures quand le document est chargé
    useEffect(() => {
        if (currentDocument) {
            setSignatures(currentDocument.signatures || []);
        }
    }, [currentDocument]);

    // Configurer les WebSockets pour les mises à jour de signatures en temps réel
    useEffect(() => {
        const setupWebSocketListener = () => {
            // Simuler l'intégration avec notre système WebSocket existant
            if (typeof window === "undefined" || !window.WebSocket) return;

            // Cette partie serait intégrée au gestionnaire WebSocket existant
            // en écoutant des événements spécifiques aux documents

            /* Exemple d'intégration avec le système existant:
      
      socket.on('document_update', (message) => {
        // Utilisation du système de déduplication existant
        if (processedMessageIds.has(message.id)) return;
        processedMessageIds.add(message.id);
        
        if (message.document_id === documentId) {
          // Mettre à jour le document
          fetchDocument(documentId);
        }
      });
      
      socket.on('signature_add', (message) => {
        if (processedMessageIds.has(message.id)) return;
        processedMessageIds.add(message.id);
        
        if (message.document_id === documentId) {
          setSignatures(prevSignatures => [
            ...prevSignatures,
            message.signature
          ]);
        }
      });
      */
        };

        setupWebSocketListener();
    }, [documentId, fetchDocument]);

    // Gérer le chargement du PDF
    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPdfError(null);
    };

    const onDocumentLoadError = (error: Error) => {
        console.error("Erreur de chargement du PDF:", error);
        setPdfError(error);
    };

    // Navigation entre les pages
    const goToPrevPage = () => {
        setPageNumber(prev => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        if (numPages) {
            setPageNumber(prev => Math.min(prev + 1, numPages));
        }
    };

    // Zoom et rotation
    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
    const rotateClockwise = () => setRotation(prev => (prev + 90) % 360);
    const rotateCounterClockwise = () => setRotation(prev => (prev - 90 + 360) % 360);

    // Gestion de la signature
    const handleStartSigning = () => {
        setShowSignaturePad(true);
    };

    const handleCancelSigning = () => {
        setShowSignaturePad(false);
        setSignaturePosition(null);
    };

    const handleSaveSignature = async (signatureImage: string, signatureType: SignatureType) => {
        if (!signaturePosition) {
            // Si pas de position définie, on place la signature au centre de la page actuelle
            const container = pdfContainerRef.current;
            if (container) {
                const rect = container.getBoundingClientRect();
                setSignaturePosition({
                    x: rect.width / 2 - 100, // centre moins la moitié de la largeur de signature
                    y: rect.height / 2 - 50, // centre moins la moitié de la hauteur de signature
                    page: pageNumber,
                });
            }
        }

        try {
            if (signaturePosition) {
                await signDocument(documentId, signatureType, signatureImage, signaturePosition);

                // Après la signature, on récupère à nouveau le document pour avoir les données à jour
                await fetchDocument(documentId);
            }
        } catch (error) {
            console.error("Erreur lors de la signature:", error);
        } finally {
            setShowSignaturePad(false);
            setSignaturePosition(null);
        }
    };

    // Gérer le clic sur la page pour positionner la signature
    const handlePageClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (
            !enableSignature ||
            !currentDocument ||
            currentDocument.status !== DocumentStatus.PENDING
        ) {
            return;
        }

        const container = pdfContainerRef.current;
        if (container) {
            const rect = container.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            setSignaturePosition({ x, y, page: pageNumber });
            setShowSignaturePad(true);
        }
    };

    // Afficher une signature sur la page
    const renderSignature = (signature: SignatureModel) => {
        if (signature.page !== pageNumber) {
            return null;
        }

        return (
            <div
                key={signature.id}
                className="absolute border border-blue-200 rounded-md overflow-hidden"
                style={{
                    left: `${signature.position_x}px`,
                    top: `${signature.position_y}px`,
                    zIndex: 10,
                }}
            >
                {signature.signature_image ? (
                    <img
                        src={signature.signature_image}
                        alt={`Signature de ${signature.user_name}`}
                        className="max-w-[200px] max-h-[100px]"
                    />
                ) : (
                    <div className="bg-blue-50 text-blue-800 p-2 text-xs">
                        Signature Numérique
                        <br />
                        {signature.user_name}
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-full max-w-sm" />
                <Skeleton className="h-[500px] w-full" />
            </div>
        );
    }

    if (!currentDocument) {
        return (
            <div className="text-center p-8">
                <div className="text-lg font-medium">Document non trouvé</div>
                <p className="text-muted-foreground">
                    Ce document n'existe pas ou vous n'avez pas les permissions nécessaires.
                </p>
                <Button className="mt-4" onClick={() => router.push("/documents")}>
                    Retour à la liste des documents
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* En-tête du document */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold">{currentDocument.name}</h2>
                    <p className="text-muted-foreground text-sm">{currentDocument.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadDocument(documentId)}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                    </Button>

                    {enableSignature && currentDocument.status === DocumentStatus.PENDING && (
                        <Button variant="default" size="sm" onClick={handleStartSigning}>
                            <FileSignature className="mr-2 h-4 w-4" />
                            Signer
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/documents/${documentId}/verify`)}
                    >
                        <Shield className="mr-2 h-4 w-4" />
                        Vérifier
                    </Button>
                </div>
            </div>

            {/* Affichage du pad de signature si actif */}
            {showSignaturePad && (
                <div className="my-4">
                    <SignaturePadComponent
                        onSave={handleSaveSignature}
                        onCancel={handleCancelSigning}
                        hasCertificate={true} // À remplacer par la vérification réelle du certificat
                    />
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Visualiseur de document */}
                <div className="flex-1">
                    {/* Contrôles du PDF */}
                    <div className="bg-muted p-2 rounded-t-md flex justify-between items-center">
                        <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" onClick={zoomOut}>
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={zoomIn}>
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={rotateCounterClockwise}>
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={rotateClockwise}>
                                <RotateCw className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={goToPrevPage}
                                disabled={pageNumber <= 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm">
                                Page {pageNumber} sur {numPages || "--"}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={goToNextPage}
                                disabled={!numPages || pageNumber >= numPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Conteneur du PDF */}
                    <div
                        ref={pdfContainerRef}
                        className="border rounded-b-md p-4 flex justify-center relative min-h-[500px] bg-white"
                        onClick={handlePageClick}
                    >
                        {pdfError ? (
                            <div className="flex flex-col items-center justify-center text-center p-6">
                                <div className="text-red-500 mb-2">
                                    Erreur de chargement du document
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Le document n'a pas pu être chargé. Vérifiez que le format est
                                    supporté.
                                </p>
                            </div>
                        ) : (
                            <PDFDocument
                                file={`/api/digital-signature/documents/${documentId}/download`}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={onDocumentLoadError}
                                loading={<Skeleton className="h-full w-full" />}
                            >
                                <div className="relative">
                                    <Page
                                        pageNumber={pageNumber}
                                        scale={scale}
                                        rotate={rotation}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        loading={<Skeleton className="h-[500px] w-[400px]" />}
                                    />

                                    {/* Rendu des signatures sur cette page */}
                                    {signatures.map(renderSignature)}
                                </div>
                            </PDFDocument>
                        )}
                    </div>
                </div>

                {/* Panneau latéral avec workflow */}
                {enableWorkflow && (
                    <div className="lg:w-1/3 xl:w-1/4">
                        <div className="border rounded-md p-4 h-full">
                            <WorkflowStatus documentId={documentId} />

                            {/* Liste des signataires */}
                            {currentDocument.signatories &&
                                currentDocument.signatories.length > 0 && (
                                    <div className="mt-6 space-y-3">
                                        <h4 className="text-sm font-medium flex items-center">
                                            <Clock className="mr-2 h-4 w-4" />
                                            Signataires
                                        </h4>

                                        <div className="space-y-2">
                                            {currentDocument.signatories.map(signatory => (
                                                <div
                                                    key={signatory.id}
                                                    className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                                                >
                                                    <div>
                                                        <div>{signatory.user_name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {signatory.email}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {signatory.status === "signed" ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                                Signé
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                                <Clock className="mr-1 h-3 w-3" />
                                                                En attente
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
