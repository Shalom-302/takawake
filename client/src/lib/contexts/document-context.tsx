"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import DocumentService, { 
  Document, 
  SignatureType,
  WorkflowStep,
  CreateDocumentRequest
} from '@/lib/services/document-service';
import SignatureService, {
  SignatureResponse,
  SignatureVerifyResponse
} from '@/lib/services/signature-service';
import { DocumentWebSocketService } from '@/lib/services/document-websocket-service';

interface DocumentContextType {
  // État
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions pour les documents
  fetchDocuments: () => Promise<void>;
  fetchDocument: (id: string) => Promise<Document | null>;
  createDocument: (request: CreateDocumentRequest) => Promise<string | null>;
  updateDocument: (id: string, data: Partial<Document>) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;
  downloadDocument: (id: string) => Promise<void>;
  
  // Actions pour les signataires
  addSignatory: (documentId: string, email: string, name: string, order: number) => Promise<boolean>;
  
  // Actions pour les signatures
  signDocument: (
    documentId: string, 
    signatureType: SignatureType,
    signatureImage?: string,
    position?: { x: number, y: number, page: number }
  ) => Promise<SignatureResponse | null>;
  verifySignature: (documentId: string, signatureId: string) => Promise<SignatureVerifyResponse | null>;
  
  // Actions pour les workflows
  getWorkflowStatus: (documentId: string) => Promise<{
    current_step: WorkflowStep,
    next_step: WorkflowStep | null,
    progress: number,
    pending_actions: string[]
  } | null>;
  
  // Actions pour les certificats
  getUserCertificate: () => Promise<{
    has_certificate: boolean;
    certificate_info?: {
      subject: string;
      issuer: string;
      valid_from: string;
      valid_until: string;
      signature_types: SignatureType[];
    }
  } | null>;
  requestCertificate: (signatureType: SignatureType) => Promise<string | null>;
  
  // Actions pour les timestamps et preuves
  createTimestamp: (documentId: string, description: string) => Promise<string | null>;
  generateLegalEvidence: (documentId: string) => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | null>(null);

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocuments must be used within a DocumentProvider");
  }
  return context;
};

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Récupérer la liste des documents
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await DocumentService.getDocuments();
      setDocuments(data);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
      toast.error('Unable to retrieve documents list');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Initialize WebSocket service for real-time updates
  useEffect(() => {
    const wsService = DocumentWebSocketService.getInstance();
    
    // Set up document update handler
    const documentUpdateUnsubscribe = wsService.addDocumentUpdateHandler((message) => {
      // Update the document in our local state if it exists
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === message.document_id 
            ? { ...doc, updated_at: message.updated_at } 
            : doc
        )
      );
      
      // If this is the current document, update it too
      if (currentDocument && currentDocument.id === message.document_id) {
        setCurrentDocument(prev => {
          if (!prev) return null;
          return { ...prev, updated_at: message.updated_at };
        });
      }
      
      toast.info(`Document "${documents.find(d => d.id === message.document_id)?.name}" has been updated`);
    });
    
    // Set up signature add handler
    const signatureAddUnsubscribe = wsService.addSignatureAddHandler((message) => {
      toast.success(`New signature added to document by ${message.signatory_email}`);
      
      // Refresh documents list to get updated status
      fetchDocuments();
    });
    
    // Set up workflow status change handler
    const workflowStatusUnsubscribe = wsService.addWorkflowStatusHandler((message) => {
      toast.info(`Document workflow status changed: ${message.current_step} → ${message.next_step || 'completed'}`);
      
      // Refresh documents list to get updated status
      fetchDocuments();
    });
    
    return () => {
      // Clean up all handlers
      documentUpdateUnsubscribe();
      signatureAddUnsubscribe();
      workflowStatusUnsubscribe();
    };
  }, [documents, currentDocument, fetchDocuments]);

  // Récupérer un document par ID
  const fetchDocument = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await DocumentService.getDocument(id);
      setCurrentDocument(data);
      return data;
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch document');
      toast.error('Unable to retrieve document');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Créer un nouveau document
  const createDocument = useCallback(async (request: CreateDocumentRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await DocumentService.createDocument(request);
      toast.success('Document created successfully');
      await fetchDocuments(); // Refresh the list
      return response.id;
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create document');
      toast.error('Unable to create document');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchDocuments]);

  // Mettre à jour un document
  const updateDocument = useCallback(async (id: string, data: Partial<Document>) => {
    setIsLoading(true);
    setError(null);
    try {
      await DocumentService.updateDocument(id, data);
      
      // Mettre à jour la liste locale
      setDocuments(prev => 
        prev.map(doc => doc.id === id ? { ...doc, ...data } : doc)
      );
      
      // Mettre à jour le document courant si c'est celui qui est modifié
      if (currentDocument && currentDocument.id === id) {
        setCurrentDocument(prev => prev ? { ...prev, ...data } : null);
      }
      
      toast.success('Document updated successfully');
      return true;
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update document');
      toast.error('Unable to update document');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentDocument]);

  // Supprimer un document
  const deleteDocument = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await DocumentService.deleteDocument(id);
      
      // Mettre à jour la liste locale
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      // Réinitialiser le document courant si c'est celui qui est supprimé
      if (currentDocument && currentDocument.id === id) {
        setCurrentDocument(null);
      }
      
      toast.success('Document deleted successfully');
      return true;
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      toast.error('Unable to delete document');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentDocument]);

  // Télécharger un document
  const downloadDocument = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const blob = await DocumentService.downloadDocument(id);
      
      // Créer une URL pour le blob
      const url = window.URL.createObjectURL(blob);
      
      // Créer un lien temporaire et cliquer dessus
      const link = window.document.createElement('a');
      link.href = url;
      
      // Obtenir le nom du document depuis l'état local si possible
      const docObj = documents.find(doc => doc.id === id);
      link.download = docObj ? docObj.name : `document-${id}`;
      
      window.document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to download document');
      toast.error('Unable to download document');
    } finally {
      setIsLoading(false);
    }
  }, [documents]);

  // Ajouter un signataire à un document
  const addSignatory = useCallback(async (documentId: string, email: string, name: string, order: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const signatory = await DocumentService.addSignatory(documentId, { 
        email, 
        name, 
        order 
      });
      
      // Mettre à jour le document courant si c'est celui qui est modifié
      if (currentDocument && currentDocument.id === documentId) {
        setCurrentDocument(prev => {
          if (!prev) return null;
          return {
            ...prev,
            signatories: [...prev.signatories, signatory]
          };
        });
      }
      
      toast.success('Signatory added successfully');
      return true;
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add signatory');
      toast.error('Unable to add signatory');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentDocument]);

  // Signer un document
  const signDocument = useCallback(async (
    documentId: string, 
    signatureType: SignatureType,
    signatureImage?: string,
    position?: { x: number, y: number, page: number }
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await SignatureService.signDocument(
        documentId, 
        signatureType, 
        signatureImage, 
        position
      );
      
      toast.success('Document signed successfully');
      
      // Rafraîchir le document courant
      if (currentDocument && currentDocument.id === documentId) {
        await fetchDocument(documentId);
      }
      
      return response;
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign document');
      toast.error('Unable to sign document');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentDocument, fetchDocument]);

  // Vérifier une signature
  const verifySignature = useCallback(async (documentId: string, signatureId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await SignatureService.verifySignature(documentId, signatureId);
      
      if (response.verified) {
        toast.success('Valid signature');
      } else {
        toast.error(`Invalid signature: ${response.error}`);
      }
      
      return response;
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to verify signature');
      toast.error('Unable to verify signature');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtenir le statut du workflow
  const getWorkflowStatus = useCallback(async (documentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await DocumentService.getWorkflowStatus(documentId);
      return status;
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to get workflow status');
      toast.error('Unable to retrieve workflow status');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtenir le certificat de l'utilisateur
  const getUserCertificate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const certificate = await SignatureService.getUserCertificate();
      return certificate;
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to get user certificate');
      toast.error('Unable to retrieve user certificate');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Demander un nouveau certificat
  const requestCertificate = useCallback(async (signatureType: SignatureType) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await SignatureService.requestCertificate(signatureType);
      toast.success('Certificate request sent successfully');
      return response.request_id;
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to request certificate');
      toast.error('Unable to request certificate');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Créer un timestamp
  const createTimestamp = useCallback(async (documentId: string, description: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await SignatureService.createTimestamp(documentId, description);
      toast.success('Timestamp created successfully');
      
      // Rafraîchir le document courant
      if (currentDocument && currentDocument.id === documentId) {
        await fetchDocument(documentId);
      }
      
      return response.id;
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create timestamp');
      toast.error('Unable to create timestamp');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentDocument, fetchDocument]);

  // Générer une preuve légale
  const generateLegalEvidence = useCallback(async (documentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const blob = await SignatureService.generateLegalEvidence(documentId);
      
      // Créer une URL pour le blob
      const url = window.URL.createObjectURL(blob);
      
      // Créer un lien temporaire et cliquer dessus
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `legal-evidence-${documentId}.pdf`;
      
      window.document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Legal evidence generated successfully');
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate legal evidence');
      toast.error('Unable to generate legal evidence');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les documents au montage du composant
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const value = {
    // État
    documents,
    currentDocument,
    isLoading,
    error,
    
    // Actions pour les documents
    fetchDocuments,
    fetchDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
    
    // Actions pour les signataires
    addSignatory,
    
    // Actions pour les signatures
    signDocument,
    verifySignature,
    
    // Actions pour les workflows
    getWorkflowStatus,
    
    // Actions pour les certificats
    getUserCertificate,
    requestCertificate,
    
    // Actions pour les timestamps et preuves
    createTimestamp,
    generateLegalEvidence
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export default DocumentProvider;
