import axiosClient from '@/lib/api/axios-client';

export interface Document {
  id: string;
  name: string;
  description: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at: string;
  status: DocumentStatus;
  workflow_step: WorkflowStep;
  owner_id: string;
  signatures: Signature[];
  signatories: Signatory[];
}

export interface Signature {
  id: string;
  document_id: string;
  user_id: string;
  user_name: string;
  signature_type: SignatureType;
  signature_image?: string;
  position_x: number;
  position_y: number;
  page: number;
  created_at: string;
  verified: boolean;
  timestamp_id?: string;
}

export interface Signatory {
  id: string;
  document_id: string;
  user_id: string;
  user_name: string;
  email: string;
  status: SignatoryStatus;
  order: number;
}

export enum DocumentStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  SIGNED = 'signed',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum WorkflowStep {
  PREPARATION = 'preparation',
  SIGNATURE = 'signature',
  VERIFICATION = 'verification',
  ARCHIVING = 'archiving',
}

export enum SignatureType {
  STANDARD = 'standard',
  ADVANCED = 'advanced',
  QUALIFIED = 'qualified',
}

export enum SignatoryStatus {
  PENDING = 'pending',
  SIGNED = 'signed',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

// Type de réponse pour la création d'un document
export interface DocumentCreateResponse {
  id: string;
  message: string;
}

// Services pour la gestion des documents
const DocumentService = {
  // Récupérer tous les documents de l'utilisateur
  async getDocuments(): Promise<Document[]> {
    const response = await axiosClient.get('/digital-signature/documents');
    return response.data;
  },

  // Récupérer un document par ID
  async getDocument(id: string): Promise<Document> {
    const response = await axiosClient.get(`/digital-signature/documents/${id}`);
    return response.data;
  },

  // Télécharger un document
  async downloadDocument(id: string): Promise<Blob> {
    const response = await axiosClient.get(`/digital-signature/documents/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Créer un nouveau document
  async createDocument(file: File, description: string): Promise<DocumentCreateResponse> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('description', description);

    const response = await axiosClient.post('/digital-signature/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Mettre à jour un document
  async updateDocument(id: string, data: Partial<Document>): Promise<Document> {
    const response = await axiosClient.put(`/digital-signature/documents/${id}`, data);
    return response.data;
  },

  // Supprimer un document
  async deleteDocument(id: string): Promise<void> {
    await axiosClient.delete(`/digital-signature/documents/${id}`);
  },

  // Ajouter un signataire à un document
  async addSignatory(documentId: string, email: string, order: number): Promise<Signatory> {
    const response = await axiosClient.post(`/digital-signature/documents/${documentId}/signatories`, {
      email,
      order
    });
    return response.data;
  },

  // Obtenir le statut du workflow d'un document
  async getWorkflowStatus(documentId: string): Promise<{ 
    current_step: WorkflowStep,
    next_step: WorkflowStep | null,
    progress: number,
    pending_actions: string[]
  }> {
    const response = await axiosClient.get(`/digital-signature/documents/${documentId}/workflow`);
    return response.data;
  }
};

export default DocumentService;
