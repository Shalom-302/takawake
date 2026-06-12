import React, { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

// Configuration du worker PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
    url: string;
    title: string;
    onDownload: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, title, onDownload }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isLoading, setIsLoading] = useState(true);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setIsLoading(false);
    };

    const onDocumentLoadError = (error: Error) => {
        console.error("Error loading PDF document:", error);
        setIsLoading(false);
    };

    const changePage = (offset: number) => {
        setPageNumber(prevPageNumber => {
            const newPageNumber = prevPageNumber + offset;
            return Math.max(1, Math.min(newPageNumber, numPages || 1));
        });
    };

    const previousPage = () => changePage(-1);
    const nextPage = () => changePage(1);

    const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.2, 3));
    const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.2, 0.5));

    return (
        <div className="flex flex-col w-full">
            {/* Contrôles */}
            <div className="flex justify-between items-center p-2 bg-gray-100 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm mr-2 truncate max-w-[150px]">{title}</span>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={previousPage}
                        disabled={pageNumber <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="text-sm">
                        Page {pageNumber} sur {numPages || "?"}
                    </span>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={nextPage}
                        disabled={!numPages || pageNumber >= numPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={zoomOut}>
                        <ZoomOut className="h-4 w-4" />
                    </Button>

                    <span className="text-sm">{Math.round(scale * 100)}%</span>

                    <Button variant="ghost" size="sm" onClick={zoomIn}>
                        <ZoomIn className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="sm" onClick={onDownload}>
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Visualiseur PDF */}
            <div className="flex-1 overflow-auto bg-gray-200 p-4 flex justify-center">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                        <div className="w-10 h-10 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={<div className="h-[600px] w-full"></div>}
                    error={
                        <div className="flex flex-col items-center justify-center p-8">
                            <p className="text-red-500 mb-4">
                                Impossible de charger le document PDF
                            </p>
                            <Button onClick={onDownload}>Télécharger le document</Button>
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="shadow-lg"
                    />
                </Document>
            </div>
        </div>
    );
};

export default PDFViewer;
