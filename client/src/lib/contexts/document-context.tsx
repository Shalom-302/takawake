"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DocumentService, { 
  Document, 
  DocumentStatus, 
  Signatory, 
  WorkflowStep,
  SignatureType
} from '@/lib/services/document-service';
import SignatureService, {
  SignatureResponse,
  SignatureVerifyResponse
} from '@/lib/services/signature-service';

interface DocumentContextType {
  // État
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions pour les documents
  fetchDocuments: () => Promise<void>;
  fetchDocument: (id: string) => Promise<Document | null>;
  createDocument: (file: File, description: string) => Promise<string | null>;
  updateDocument: (id: string, data: Partial<Document>) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;
  downloadDocument: (id: string) => Promise<void>;
  
  // Actions pour les signataires
  addSignatory: (documentId: string, email: string, order: number) => Promise<boolean>;
  
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
  const router = useRouter();
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
    } catch (err: any) {
      setError(err.message || 'Failed to fetch documents');
      toast.error('Impossible de récupérer la liste des documents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Récupérer un document par ID
  const fetchDocument = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await DocumentService.getDocument(id);
      setCurrentDocument(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch document');
      toast.error('Impossible de récupérer le document');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Créer un nouveau document
  const createDocument = useCallback(async (file: File, description: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await DocumentService.createDocument(file, description);
      toast.success('Document créé avec succès');
      await fetchDocuments(); // Rafraîchir la liste
      return response.id;
    } catch (err: any) {
      setError(err.message || 'Failed to create document');
      toast.error('Impossible de créer le document');
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
      
      toast.success('Document mis à jour avec succès');
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update document');
      toast.error('Impossible de mettre à jour le document');
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
      
      toast.success('Document supprimé avec succès');
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
      toast.error('Impossible de supprimer le document');
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
      const link = document.createElement('a');
      link.href = url;
      
      // Obtenir le nom du document depuis l'état local si possible
      const document = documents.find(doc => doc.id === id);
      link.download = document ? document.name : `document-${id}`;
      
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to download document');
      toast.error('Impossible de télécharger le document');
    } finally {
      setIsLoading(false);
    }
  }, [documents]);

  // Ajouter un signataire à un document
  const addSignatory = useCallback(async (documentId: string, email: string, order: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const signatory = await DocumentService.addSignatory(documentId, email, order);
      
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
      
      toast.success('Signataire ajouté avec succès');
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to add signatory');
      toast.error('Impossible d\'ajouter le signataire');
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
      
      toast.success('Document signé avec succès');
      
      // Rafraîchir le document courant
      if (currentDocument && currentDocument.id === documentId) {
        await fetchDocument(documentId);
      }
      
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to sign document');
      toast.error('Impossible de signer le document');
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
        toast.success('Signature valide');
      } else {
        toast.error(`Signature invalide: ${response.error}`);
      }
      
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to verify signature');
      toast.error('Impossible de vérifier la signature');
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
    } catch (err: any) {
      setError(err.message || 'Failed to get workflow status');
      toast.error('Impossible de récupérer le statut du workflow');
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
    } catch (err: any) {
      setError(err.message || 'Failed to get user certificate');
      toast.error('Impossible de récupérer le certificat utilisateur');
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
      toast.success('Demande de certificat envoyée avec succès');
      return response.request_id;
    } catch (err: any) {
      setError(err.message || 'Failed to request certificate');
      toast.error('Impossible de demander un certificat');
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
      toast.success('Horodatage créé avec succès');
      
      // Rafraîchir le document courant
      if (currentDocument && currentDocument.id === documentId) {
        await fetchDocument(documentId);
      }
      
      return response.id;
    } catch (err: any) {
      setError(err.message || 'Failed to create timestamp');
      toast.error('Impossible de créer l\'horodatage');
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
      const link = document.createElement('a');
      link.href = url;
      link.download = `legal-evidence-${documentId}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Preuve légale générée avec succès');
    } catch (err: any) {
      setError(err.message || 'Failed to generate legal evidence');
      toast.error('Impossible de générer la preuve légale');
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
