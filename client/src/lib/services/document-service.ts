/**
 * Service for managing documents
 */

import axiosClient from '@/lib/api/axios-client';
import auditService from './audit-service';

// Types pour le service de documents
export enum DocumentStatus {
  DRAFT = 'draft',
  PENDING = 'pending', 
  SIGNED = 'signed',
  COMPLETED = 'completed',  
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  APPROVED = 'approved',
  CANCELLED = 'cancelled'
}

export enum WorkflowStep {
  PREPARATION = 'preparation',
  SIGNATURE = 'signature',
  VERIFICATION = 'verification',
  ARCHIVING = 'archiving',   
  COMPLETED = 'completed'
}

export enum SignatureType {
  SIMPLE = 'simple',
  STANDARD = 'standard',
  ADVANCED = 'advanced',
  QUALIFIED = 'qualified'
}

export enum SignatoryStatus {
  PENDING = 'pending',
  SIGNED = 'signed',
  REJECTED = 'rejected'
}

// Interface pour l'état du workflow
export interface WorkflowState {
  id: string;
  name: string;
  description: string;
}

export interface Signature {
  id: string;
  document_id: string;
  user_id: string;
  user_name: string;
  signature_type: SignatureType;
  position_x?: number;
  position_y?: number;
  page?: number;
  created_at: string;
  verified?: boolean;
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

// Interface pour les métadonnées
export interface DocumentMetadata {
  name?: string;
  description?: string;
  signatories?: Signatory[];
  signature_type?: string;
  expiration_days?: number;
  [key: string]: string | number | boolean | Signatory[] | undefined;
}

export interface Document {
  id: string;
  name: string;
  description: string;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  created_at: string;
  updated_at: string;
  status: DocumentStatus;
  workflow_step?: WorkflowStep;
  owner_id: string;
  signatures: Signature[];
  signatories: Signatory[];
  workflow_instance_id: string;
  current_state: WorkflowState;
  metadata: DocumentMetadata;
}

export interface CreateDocumentRequest {
  name: string;
  description: string;
  file: File;
  signature_type: SignatureType;
  workflow_type: string;
  expiration_days: number;
  signatories: {
    email: string;
    name: string;
    order: number;
  }[];
}

export interface DocumentCreateResponse {
  id: string;
  name: string;
  status?: DocumentStatus;
  created_at?: string;
  workflow_instance_id?: string;
  workflow?: WorkflowInstance;
  file_path?: string;
}

export interface DocumentUpdateMessage {
  document_id: string;
  updated_at: string;
  action: 'updated' | 'signed' | 'rejected';
}

// Interface pour la transition de workflow
interface WorkflowTransition {
  id: string;
  source_state: WorkflowState;
  target_state: WorkflowState;
  name: string;
}

// Interface pour l'instance de workflow
interface WorkflowInstance {
  id: string;
  workflow_id: number;
  target_type: string;
  target_id: string;
  current_state: WorkflowState;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  metadata: DocumentMetadata;
}

// Interface pour les résultats paginés
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * Fonction utilitaire pour convertir un état de workflow en statut de document
 */
const mapWorkflowStateToDocumentStatus = (state: string): DocumentStatus => {
  switch (state?.toLowerCase()) {
    case 'pending':
      return DocumentStatus.PENDING;
    case 'approved':
      return DocumentStatus.APPROVED;
    case 'signed':
      return DocumentStatus.SIGNED;
    case 'rejected':
      return DocumentStatus.REJECTED;
    case 'cancelled':
    case 'canceled':
      return DocumentStatus.CANCELLED;
    case 'expired':
      return DocumentStatus.EXPIRED;
    default:
      return DocumentStatus.DRAFT;
  }
};

const DocumentService = {
  /**
   * Récupérer tous les documents de l'utilisateur
   */
  async getDocuments(): Promise<Document[]> {
    try {
      console.log('Fetching documents from API...');
      
      const response = await axiosClient.get<PaginatedResponse<WorkflowInstance>>('/workflow/instances', {
        params: {
          target_type: 'document',
          page: 1,
          page_size: 100
        }
      });
      
      console.log('Documents API response:', response.data);
      
      return response.data.items.map((instance: WorkflowInstance) => ({
        id: instance.target_id,
        workflow_instance_id: instance.id,
        current_state: instance.current_state,
        metadata: instance.metadata as DocumentMetadata,
        name: instance.metadata?.name || '',
        description: instance.metadata?.description || '',
        status: mapWorkflowStateToDocumentStatus(instance.current_state?.name || ''),
        created_at: instance.created_at,
        updated_at: instance.updated_at,
        owner_id: instance.id.split('-')[0] || '', // Utiliser une partie de l'ID comme owner_id temporaire
        signatures: [],
        signatories: (instance.metadata as DocumentMetadata)?.signatories || []
      }));
      
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  /**
   * Récupérer un document par ID
   * Combine les données du workflow et du document signé
   */
  async getDocument(id: string): Promise<Document> {
    try {
      // 1. Récupérer l'instance de workflow
      const workflowResponse = await axiosClient.get<WorkflowInstance>(`/workflow/instances/${id}`);
      console.log('Workflow instance API response:', workflowResponse.data);
      
      // 2. Récupérer les détails du document signé si disponible
      let signatureData: { signatures?: Signature[] } = { signatures: [] };
      try {
        const signatureResponse = await axiosClient.get(`/digital-signature/sign/document/${workflowResponse.data.target_id}`);
        console.log('Document signature API response:', signatureResponse.data);
        signatureData = signatureResponse.data;
      } catch (signError) {
        console.warn('Could not fetch signature data, document may not be signed yet:', signError);
      }
      
      // Combiner les données
      return {
        id: workflowResponse.data.target_id,
        name: workflowResponse.data.metadata?.name || 'Document sans titre',
        description: workflowResponse.data.metadata?.description || '',
        status: mapWorkflowStateToDocumentStatus(workflowResponse.data.current_state?.name || ''),
        created_at: workflowResponse.data.created_at,
        updated_at: workflowResponse.data.updated_at,
        workflow_instance_id: workflowResponse.data.id,
        current_state: workflowResponse.data.current_state,
        metadata: workflowResponse.data.metadata,
        owner_id: workflowResponse.data.id.split('-')[0] || '', // Utiliser une partie de l'ID comme owner_id temporaire
        signatures: signatureData.signatures || [],
        signatories: (workflowResponse.data.metadata as DocumentMetadata)?.signatories || []
      };
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  },

  /**
   * Creates a new document
   * Uses the digital-signature plugin to create the document and the workflow plugin to manage its lifecycle
   */
  async createDocument(request: CreateDocumentRequest): Promise<DocumentCreateResponse> {
    try {
      console.log('Creating document with request:', request);
      
      // 1. Create physical document via digital-signature
      const formData = new FormData();
      
      // Ensure the file is attached with the exact name "document" as expected by the backend
      formData.append('document', request.file, request.file.name);
      
      // Add necessary metadata
      if (request.description) {
        formData.append('description', request.description);
      }
      
      // Use "qualified" as default signature type if not specified
      formData.append('signature_type', request.signature_type || 'qualified');
      
      // Log detailed form data for debugging
      console.log('Form data details:', {
        fileName: request.file.name,
        fileSize: request.file.size,
        fileType: request.file.type,
        description: request.description,
        signatureType: request.signature_type || 'qualified'
      });
      
      // Debugging FormData content
      console.log('FormData entries:');
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1] instanceof File ? `File (${pair[1].name}, ${pair[1].type}, ${pair[1].size} bytes)` : pair[1]}`);
      }
      
      console.log('Uploading document to digital-signature service...');
      // The axiosClient instance already adds the /api prefix
      const signResponse = await axiosClient.post('/digital-signature/sign/document', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Document upload API response:', signResponse.data);
      
      // 2. Create workflow for this document
      const workflowData = {
        workflow_id: parseInt(request.workflow_type), // ID of the appropriate workflow
        target_type: "document",
        target_id: signResponse.data.id, // ID of the created document
        metadata: {
          name: request.name,
          description: request.description,
          signature_type: request.signature_type,
          signatories: request.signatories,
          expiration_days: request.expiration_days
        }
      };
      
      console.log('Creating workflow instance for document...', workflowData);
      const workflowResponse = await axiosClient.post<WorkflowInstance>('/workflow/instances', workflowData);
      console.log('Workflow creation API response:', workflowResponse.data);
      
      // 3. Return combined data
      return {
        id: signResponse.data.id,
        name: request.name,
        status: mapWorkflowStateToDocumentStatus(workflowResponse.data.current_state?.name || ''),
        created_at: workflowResponse.data.created_at,
        workflow_instance_id: workflowResponse.data.id,
        workflow: workflowResponse.data
      };
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  /**
   * Update a document
   * Updates both workflow metadata and document metadata if necessary
   */
  async updateDocument(id: string, data: Partial<Document>): Promise<Document> {
    try {
      console.log('Updating document with data:', data);
      
      // 1. Update workflow instance
      const workflowData = {
        metadata: {
          ...(data.metadata || {}),
          name: data.name,
          description: data.description
        }
      };
      
      console.log('Updating workflow instance...', workflowData);
      const workflowResponse = await axiosClient.patch(`/workflow/instances/${data.workflow_instance_id}`, workflowData);
      console.log('Workflow update API response:', workflowResponse.data);
      
      // 2. Get updated document
      return this.getDocument(id);
    } catch (error) {
      console.error(`Error updating document ${id}:`, error);
      throw error;
    }
  },

  /**
   * Download a document
   * Uses the digital-signature plugin to retrieve the document content
   */
  async downloadDocument(id: string): Promise<Blob> {
    try {
      console.log('Downloading document...');
      const response = await axiosClient.get(`/digital-signature/sign/document/${id}/download`, {
        responseType: 'blob'
      });
      console.log('Document download API response received');
      return response.data;
    } catch (error) {
      console.error(`Error downloading document ${id}:`, error);
      throw error;
    }
  },

  /**
   * Sign a document
   * Uses the digital-signature plugin for the signature and updates the workflow
   */
  async signDocument(documentId: string, signatureData: {
    signature_type: SignatureType;
    position_x?: number;
    position_y?: number;
    page?: number
  }): Promise<Signature> {
    try {
      console.log('Signing document with signature data:', signatureData);
      
      // 1. Sign the document via digital-signature
      const response = await axiosClient.post<Signature>(`/digital-signature/sign/document/${documentId}/signature`, signatureData);
      console.log('Document signing API response:', response.data);
      
      // 2. Advance the workflow if necessary
      // First get workflow information
      const document = await this.getDocument(documentId);
      if (document.workflow_instance_id) {
        try {
          // Try to progress the workflow to the "signed" state
          // We must first check possible transitions
          const transitionsResponse = await axiosClient.get<WorkflowTransition[]>(`/workflow/instances/${document.workflow_instance_id}/transitions`);
          console.log('Workflow transitions API response:', transitionsResponse.data);
          
          // Find a transition that leads to the "signed" state
          const signedTransition = transitionsResponse.data.find(
            (transition) => transition.target_state?.name?.toLowerCase() === 'signed'
          );
          
          if (signedTransition) {
            // Perform the transition
            const transitionResponse = await axiosClient.post(`/workflow/instances/${document.workflow_instance_id}/transition`, {
              transition_id: signedTransition.id
            });
            console.log('Workflow transition API response:', transitionResponse.data);
          } else {
            console.log('No transition to signed state available');
          }
        } catch (workflowError) {
          console.error('Error updating workflow state:', workflowError);
          // Do not fail the signature operation if workflow update fails
        }
      }
      
      // Register signature action in audit system
      await auditService.createAuditLog({
        action: 'SIGN',
        resource: 'document',
        details: `Document ID: ${documentId}, Signature Type: ${signatureData.signature_type}`
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error signing document ${documentId}:`, error);
      throw error;
    }
  },

  /**
   * Add a signatory to a document
   * Updates workflow metadata
   */
  async addSignatory(documentId: string, signatoryData: {
    email: string;
    name: string;
    order: number;
  }): Promise<Signatory> {
    try {
      console.log('Adding signatory to document with signatory data:', signatoryData);
      
      // 1. Get the document to get the workflow instance ID
      const document = await this.getDocument(documentId);
      
      // 2. Update workflow instance metadata
      const signatories = [...(document.metadata?.signatories || []), signatoryData];
      
      const workflowData = {
        metadata: {
          ...document.metadata,
          signatories
        }
      };
      
      console.log('Updating workflow instance with new signatory...', workflowData);
      await axiosClient.patch(`/workflow/instances/${document.workflow_instance_id}`, workflowData);
      console.log('Workflow update API response received');
      
      // Create a new Signatory object with required fields
      const newSignatory: Signatory = {
        id: `temp-${Date.now()}`, // Temporary ID
        document_id: documentId,
        user_id: '', // To be filled by the backend
        user_name: signatoryData.name,
        email: signatoryData.email,
        order: signatoryData.order,
        status: SignatoryStatus.PENDING // Default status
      };
      
      // Register add signatory action in audit system
      await auditService.createAuditLog({
        action: 'ADD_SIGNATORY',
        resource: 'document',
        details: `Document ID: ${documentId}, Signatory Email: ${newSignatory.email}`
      });
      
      return newSignatory;
    } catch (error) {
      console.error(`Error adding signatory to document ${documentId}:`, error);
      throw error;
    }
  },

  /**
   * Get the workflow status of a document
   * Queries the workflow plugin directly
   */
  async getWorkflowStatus(documentId: string): Promise<{
    current_step: WorkflowStep;
    next_step: WorkflowStep | null;
    completed: boolean;
  }> {
    try {
      console.log('Getting workflow status for document...');
      
      // 1. Get the document to get the workflow instance ID
      const document = await this.getDocument(documentId);
      
      // 2. Get workflow status
      const workflowResponse = await axiosClient.get<WorkflowInstance>(`/workflow/instances/${document.workflow_instance_id}`);
      console.log('Workflow status API response:', workflowResponse.data);
      
      // 3. Get possible next steps (transitions)
      const transitionsResponse = await axiosClient.get<WorkflowTransition[]>(`/workflow/instances/${document.workflow_instance_id}/transitions`);
      console.log('Workflow transitions API response:', transitionsResponse.data);
      
      // Determine next step, if any
      const nextTransition = transitionsResponse.data[0]; // Take the first available transition
      
      // Map workflow state to workflow step
      const mapStateToStep = (state: WorkflowState): WorkflowStep => {
        const name = state.name.toLowerCase();
        if (name.includes('preparation') || name.includes('draft')) {
          return WorkflowStep.PREPARATION;
        } else if (name.includes('sign')) {
          return WorkflowStep.SIGNATURE;
        } else if (name.includes('verif')) {
          return WorkflowStep.VERIFICATION;
        } else if (name.includes('archiv')) {
          return WorkflowStep.ARCHIVING;
        } else if (name.includes('complet')) {
          return WorkflowStep.COMPLETED;
        }
        return WorkflowStep.PREPARATION; // Par défaut
      };
      
      return {
        current_step: mapStateToStep(workflowResponse.data.current_state),
        next_step: nextTransition ? mapStateToStep(nextTransition.target_state) : null,
        completed: workflowResponse.data.is_completed
      };
    } catch (error) {
      console.error(`Error getting workflow status for document ${documentId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a document
   * Cancels the workflow instance and deletes the document
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      console.log('Deleting document...');
      
      // 1. Get the document to get the workflow instance ID
      const document = await this.getDocument(id);
      
      // 2. Cancel the workflow instance
      await axiosClient.post(`/workflow/instances/${document.workflow_instance_id}/cancel`);
      console.log('Workflow cancellation API response received');
      
      // 3. Delete the document if necessary
      try {
        await axiosClient.delete(`/digital-signature/sign/document/${id}`);
        console.log('Document deletion API response received');
      } catch (deleteError) {
        console.warn('Could not delete document from digital-signature service:', deleteError);
      }
      
      // Register delete action in audit system
      await auditService.createAuditLog({
        action: 'DELETE',
        resource: 'document',
        details: `Document ID: ${id}`
      });
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      throw error;
    }
  }
};

export default DocumentService;