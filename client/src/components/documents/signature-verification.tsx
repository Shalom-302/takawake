"use client"

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Shield, CheckCircle, XCircle, Clock, Award, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { SignatureType } from '@/lib/services/document-service';
import { SignatureVerifyResponse } from '@/lib/services/signature-service';
import { useDocuments } from '@/lib/contexts/document-context';

interface SignatureVerificationProps {
  documentId: string;
  signatureId: string;
}

export function SignatureVerification({ documentId, signatureId }: SignatureVerificationProps) {
  const { verifySignature, generateLegalEvidence } = useDocuments();
  const [verificationResult, setVerificationResult] = useState<SignatureVerifyResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGeneratingEvidence, setIsGeneratingEvidence] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const result = await verifySignature(documentId, signatureId);
      setVerificationResult(result);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGenerateEvidence = async () => {
    setIsGeneratingEvidence(true);
    try {
      await generateLegalEvidence(documentId);
    } finally {
      setIsGeneratingEvidence(false);
    }
  };

  const getSignatureTypeLabel = (type: SignatureType) => {
    switch (type) {
      case SignatureType.STANDARD:
        return 'Standard';
      case SignatureType.ADVANCED:
        return 'Avancée';
      case SignatureType.QUALIFIED:
        return 'Qualifiée';
      default:
        return 'Inconnue';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Vérification de signature
        </CardTitle>
        <CardDescription>
          Validez l'authenticité de la signature numérique
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!verificationResult && !isVerifying && (
          <div className="text-center py-6">
            <Search className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Cliquez sur le bouton Vérifier pour authentifier cette signature
            </p>
          </div>
        )}

        {isVerifying && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {verificationResult && (
          <>
            <Alert variant={verificationResult.verified ? "success" : "destructive"}>
              {verificationResult.verified ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {verificationResult.verified 
                  ? "Signature valide" 
                  : "Signature invalide"}
              </AlertTitle>
              <AlertDescription>
                {verificationResult.verified 
                  ? "La signature numérique a été vérifiée avec succès."
                  : `Erreur: ${verificationResult.error || "La signature ne peut pas être vérifiée."}`}
              </AlertDescription>
            </Alert>

            {verificationResult.verified && verificationResult.signature_info && (
              <div className="space-y-3 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Informations sur le signataire</p>
                    <div className="bg-muted p-3 rounded-md">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{verificationResult.signature_info.signer}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Date de signature</p>
                    <div className="bg-muted p-3 rounded-md">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(verificationResult.signature_info.signature_date), 'dd/MM/yyyy à HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Type de signature</p>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {getSignatureTypeLabel(verificationResult.signature_info.signature_type)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Certificat</p>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground">Émetteur:</span>
                        <span className="text-xs ml-2">
                          {verificationResult.signature_info.certificate_info.issuer}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground">Valide jusqu'au:</span>
                        <span className="text-xs ml-2">
                          {format(new Date(verificationResult.signature_info.certificate_info.valid_until), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleVerify}
          disabled={isVerifying}
        >
          <Shield className="mr-2 h-4 w-4" />
          {isVerifying ? "Vérification..." : "Vérifier"}
        </Button>
        
        {verificationResult?.verified && (
          <Button 
            variant="default"
            onClick={handleGenerateEvidence}
            disabled={isGeneratingEvidence}
          >
            <Award className="mr-2 h-4 w-4" />
            {isGeneratingEvidence ? "Génération..." : "Générer une preuve légale"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
