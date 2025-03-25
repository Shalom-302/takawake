import axiosClient from '@/lib/api/axios-client';
import { SignatureType } from './document-service';

export interface SignatureResponse {
  id: string;
  document_id: string;
  certificate_id: string;
  timestamp_id?: string;
  signature_data: string;
  created_at: string;
}

export interface SignatureVerifyResponse {
  verified: boolean;
  error?: string;
  signature_info?: {
    signer: string;
    signature_date: string;
    signature_type: SignatureType;
    certificate_info: {
      issuer: string;
      valid_until: string;
    };
  };
}

export interface TimestampResponse {
  id: string;
  document_id: string;
  hash: string;
  timestamp: string;
  provider: string;
}

// Services pour la gestion des signatures numériques
const SignatureService = {
  // Signer un document numériquement
  async signDocument(
    documentId: string, 
    signatureType: SignatureType,
    signatureImage?: string,
    position?: { x: number, y: number, page: number }
  ): Promise<SignatureResponse> {
    const formData = new FormData();
    formData.append('signature_type', signatureType);
    
    if (signatureImage) {
      // Convertir l'image de signature en blob
      const imageBlob = await (await fetch(signatureImage)).blob();
      formData.append('signature_image', imageBlob);
    }
    
    if (position) {
      formData.append('position_x', position.x.toString());
      formData.append('position_y', position.y.toString());
      formData.append('page', position.page.toString());
    }

    const response = await axiosClient.post(`/digital-signature/sign/document/${documentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Vérifier une signature
  async verifySignature(documentId: string, signatureId: string): Promise<SignatureVerifyResponse> {
    const response = await axiosClient.post(`/digital-signature/verify/signature`, {
      document_id: documentId,
      signature_id: signatureId
    });
    return response.data;
  },

  // Créer un timestamp pour un document
  async createTimestamp(documentId: string, description: string): Promise<TimestampResponse> {
    const response = await axiosClient.post(`/digital-signature/timestamp/create`, {
      document_id: documentId,
      description
    });
    return response.data;
  },

  // Vérifier un timestamp
  async verifyTimestamp(timestampId: string): Promise<{ verified: boolean; error?: string }> {
    const response = await axiosClient.post(`/digital-signature/verify/timestamp`, {
      timestamp_id: timestampId
    });
    return response.data;
  },

  // Générer un certificat de preuve légale
  async generateLegalEvidence(documentId: string): Promise<Blob> {
    const response = await axiosClient.get(`/digital-signature/legal-evidence/${documentId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Obtenir les informations du certificat de l'utilisateur
  async getUserCertificate(): Promise<{
    has_certificate: boolean;
    certificate_info?: {
      subject: string;
      issuer: string;
      valid_from: string;
      valid_until: string;
      signature_types: SignatureType[];
    }
  }> {
    const response = await axiosClient.get(`/digital-signature/certificates/user`);
    return response.data;
  },

  // Demander un nouveau certificat pour l'utilisateur
  async requestCertificate(signatureType: SignatureType): Promise<{ request_id: string }> {
    const response = await axiosClient.post(`/digital-signature/certificates/request`, {
      signature_type: signatureType
    });
    return response.data;
  }
};

export default SignatureService;
