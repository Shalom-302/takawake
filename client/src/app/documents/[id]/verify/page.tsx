"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentProvider, useDocuments } from '@/lib/contexts/document-context';
import { SignatureVerification } from '@/components/documents/signature-verification';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Shield, Download, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface VerifyPageProps {
  params: {
    id: string;
  };
}

function VerifyDocumentContent({ documentId }: { documentId: string }) {
  const { fetchDocument, currentDocument, isLoading } = useDocuments();
  const router = useRouter();
  const [activeSignatureId, setActiveSignatureId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocument(documentId);
  }, [documentId, fetchDocument]);

  useEffect(() => {
    if (currentDocument?.signatures && currentDocument.signatures.length > 0) {
      setActiveSignatureId(currentDocument.signatures[0].id);
    }
  }, [currentDocument]);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!currentDocument) {
    return (
      <div className="text-center p-8">
        <div className="text-lg font-medium">Document non trouvé</div>
        <p className="text-muted-foreground">
          Ce document n'existe pas ou vous n'avez pas les permissions nécessaires.
        </p>
        <Button className="mt-4" onClick={() => router.push('/documents')}>
          Retour à la liste des documents
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{currentDocument.name}</h1>
          <p className="text-muted-foreground">
            Vérification de l'authenticité du document et des signatures
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/documents/${documentId}`)}>
            <FileText className="mr-2 h-4 w-4" />
            Voir le document
          </Button>
          <Button variant="outline" onClick={() => router.push('/documents')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carte d'information du document */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Informations du document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Nom du document</p>
              <div className="bg-muted p-3 rounded-md">
                {currentDocument.name}
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Description</p>
              <div className="bg-muted p-3 rounded-md min-h-[50px]">
                {currentDocument.description || "Aucune description"}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Créé le</p>
                <div className="bg-muted p-3 rounded-md">
                  {format(new Date(currentDocument.created_at), 'dd/MM/yyyy')}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Dernière mise à jour</p>
                <div className="bg-muted p-3 rounded-md">
                  {format(new Date(currentDocument.updated_at), 'dd/MM/yyyy')}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Statut</p>
              <div className="bg-muted p-3 rounded-md">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  currentDocument.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : currentDocument.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentDocument.status === 'pending' 
                    ? 'En attente de signatures'
                    : currentDocument.status === 'completed'
                    ? 'Complété'
                    : currentDocument.status}
                </span>
              </div>
            </div>
            
            <div className="pt-4">
              <Button variant="outline" className="w-full" onClick={() => window.open(`/api/digital-signature/documents/${documentId}/download`, '_blank')}>
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Colonne principale avec les vérifications */}
        <div className="md:col-span-2 space-y-6">
          {currentDocument.signatures && currentDocument.signatures.length > 0 ? (
            <>
              <Tabs defaultValue={currentDocument.signatures[0].id} onValueChange={(value) => setActiveSignatureId(value)}>
                <TabsList className="mb-4">
                  {currentDocument.signatures.map((signature) => (
                    <TabsTrigger key={signature.id} value={signature.id}>
                      Signature de {signature.user_name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {currentDocument.signatures.map((signature) => (
                  <TabsContent key={signature.id} value={signature.id}>
                    <SignatureVerification 
                      documentId={documentId} 
                      signatureId={signature.id} 
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Aucune signature</h3>
                <p className="text-center text-muted-foreground mt-2">
                  Ce document n'a pas encore été signé.
                </p>
                <Button className="mt-4" onClick={() => router.push(`/documents/${documentId}`)}>
                  Voir le document
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Informations sur les horodatages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Horodatages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentDocument.timestamps && currentDocument.timestamps.length > 0 ? (
                  <div className="space-y-2">
                    {currentDocument.timestamps.map((timestamp, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-md">
                        <div>
                          <p className="text-sm font-medium">{timestamp.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(timestamp.timestamp), 'dd/MM/yyyy à HH:mm:ss')}
                          </p>
                        </div>
                        {timestamp.verification_url && (
                          <Button variant="ghost" size="sm" className="text-xs" onClick={() => window.open(timestamp.verification_url, '_blank')}>
                            Vérifier
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Aucun horodatage disponible pour ce document
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage({ params }: VerifyPageProps) {
  return (
    <DocumentProvider>
      <div className="container py-6">
        <VerifyDocumentContent documentId={params.id} />
      </div>
    </DocumentProvider>
  );
}
