import axiosClient from '@/lib/api/axios-client';

// Types exportés pour être utilisés dans le reste de l'application
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
  workflow?: any;
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
   * Créer un nouveau document
   * Utilise le plugin digital-signature pour créer le document et le plugin workflow pour gérer son cycle de vie
   */
  async createDocument(request: CreateDocumentRequest): Promise<DocumentCreateResponse> {
    try {
      console.log('Creating document with request:', request);
      
      // 1. Créer le document physique via digital-signature
      const formData = new FormData();
      formData.append('document', request.file);
      formData.append('description', request.description);
      formData.append('signature_type', request.signature_type);
      
      console.log('Uploading document to digital-signature service...');
      const signResponse = await axiosClient.post('/digital-signature/sign/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Document upload API response:', signResponse.data);
      
      // 2. Créer le workflow pour ce document
      const workflowData = {
        workflow_id: parseInt(request.workflow_type), // ID du workflow approprié
        target_type: "document",
        target_id: signResponse.data.id, // ID du document créé
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
      
      // 3. Retourner les données combinées
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
   * Mettre à jour un document
   * Met à jour à la fois les métadonnées du workflow et le document si nécessaire
   */
  async updateDocument(id: string, data: Partial<Document>): Promise<Document> {
    try {
      console.log('Updating document with data:', data);
      
      // 1. Mettre à jour l'instance de workflow
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
      
      // 2. Récupérer le document mis à jour
      return this.getDocument(id);
    } catch (error) {
      console.error(`Error updating document ${id}:`, error);
      throw error;
    }
  },

  /**
   * Télécharger un document
   * Utilise le plugin digital-signature pour récupérer le contenu du document
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
   * Signer un document
   * Utilise le plugin digital-signature pour la signature et met à jour le workflow
   */
  async signDocument(documentId: string, signatureData: {
    signature_type: SignatureType;
    position_x?: number;
    position_y?: number;
    page?: number
  }): Promise<Signature> {
    try {
      console.log('Signing document with signature data:', signatureData);
      
      // 1. Signer le document via digital-signature
      const response = await axiosClient.post<Signature>(`/digital-signature/sign/document/${documentId}/signature`, signatureData);
      console.log('Document signing API response:', response.data);
      
      // 2. Faire avancer le workflow si nécessaire
      // Récupérer d'abord les informations du workflow
      const document = await this.getDocument(documentId);
      if (document.workflow_instance_id) {
        try {
          // Essayer de faire progresser le workflow vers l'état "signé"
          // Nous devons d'abord vérifier les transitions possibles
          const transitionsResponse = await axiosClient.get<WorkflowTransition[]>(`/workflow/instances/${document.workflow_instance_id}/transitions`);
          console.log('Workflow transitions API response:', transitionsResponse.data);
          
          // Trouver une transition qui mène à l'état "signé"
          const signedTransition = transitionsResponse.data.find(
            (transition) => transition.target_state?.name?.toLowerCase() === 'signed'
          );
          
          if (signedTransition) {
            // Effectuer la transition
            const transitionResponse = await axiosClient.post(`/workflow/instances/${document.workflow_instance_id}/transition`, {
              transition_id: signedTransition.id
            });
            console.log('Workflow transition API response:', transitionResponse.data);
          } else {
            console.log('No transition to signed state available');
          }
        } catch (workflowError) {
          console.error('Error updating workflow state:', workflowError);
          // Ne pas faire échouer l'opération de signature si la mise à jour du workflow échoue
        }
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error signing document ${documentId}:`, error);
      throw error;
    }
  },

  /**
   * Ajouter un signataire à un document
   * Met à jour les métadonnées du workflow
   */
  async addSignatory(documentId: string, signatoryData: {
    email: string;
    name: string;
    order: number;
  }): Promise<Signatory> {
    try {
      console.log('Adding signatory to document with signatory data:', signatoryData);
      
      // 1. Récupérer le document pour obtenir l'ID de l'instance workflow
      const document = await this.getDocument(documentId);
      
      // 2. Mettre à jour les métadonnées de l'instance workflow
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
      
      // Créer un nouvel objet Signatory avec les champs requis
      const newSignatory: Signatory = {
        id: `temp-${Date.now()}`, // Identifiant temporaire
        document_id: documentId,
        user_id: '', // À remplir par le backend
        user_name: signatoryData.name,
        email: signatoryData.email,
        order: signatoryData.order,
        status: SignatoryStatus.PENDING // Statut par défaut
      };
      
      return newSignatory;
    } catch (error) {
      console.error(`Error adding signatory to document ${documentId}:`, error);
      throw error;
    }
  },

  /**
   * Obtenir le statut du workflow d'un document
   * Interroge directement le plugin workflow
   */
  async getWorkflowStatus(documentId: string): Promise<{
    current_step: WorkflowStep;
    next_step: WorkflowStep | null;
    completed: boolean;
  }> {
    try {
      console.log('Getting workflow status for document...');
      
      // 1. Récupérer le document pour obtenir l'ID de l'instance workflow
      const document = await this.getDocument(documentId);
      
      // 2. Récupérer l'état du workflow
      const workflowResponse = await axiosClient.get<WorkflowInstance>(`/workflow/instances/${document.workflow_instance_id}`);
      console.log('Workflow status API response:', workflowResponse.data);
      
      // 3. Récupérer les étapes suivantes possibles (transitions)
      const transitionsResponse = await axiosClient.get<WorkflowTransition[]>(`/workflow/instances/${document.workflow_instance_id}/transitions`);
      console.log('Workflow transitions API response:', transitionsResponse.data);
      
      // Déterminer l'étape suivante, s'il y en a une
      const nextTransition = transitionsResponse.data[0]; // Prendre la première transition disponible
      
      // Mapper l'état du workflow à une étape de workflow
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
   * Supprimer un document
   * Annule l'instance de workflow et supprime le document
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      console.log('Deleting document...');
      
      // 1. Récupérer le document pour obtenir l'ID de l'instance workflow
      const document = await this.getDocument(id);
      
      // 2. Annuler l'instance de workflow
      await axiosClient.post(`/workflow/instances/${document.workflow_instance_id}/cancel`);
      console.log('Workflow cancellation API response received');
      
      // 3. Supprimer le document si nécessaire
      try {
        await axiosClient.delete(`/digital-signature/sign/document/${id}`);
        console.log('Document deletion API response received');
      } catch (deleteError) {
        console.warn('Could not delete document from digital-signature service:', deleteError);
      }
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      throw error;
    }
  }
};

export default DocumentService;