"use client"

import React, { useRef, useState, useEffect } from 'react';
import SignaturePad from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { SignatureType } from '@/lib/services/document-service';
import { AlertCircle, Check, Download, RefreshCw, Save, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SignaturePadProps {
  onSave: (signatureImage: string, signatureType: SignatureType) => void;
  onCancel: () => void;
  defaultType?: SignatureType;
  hasCertificate?: boolean;
}

export function SignaturePadComponent({
  onSave,
  onCancel,
  defaultType = SignatureType.STANDARD,
  hasCertificate = false
}: SignaturePadProps) {
  const sigCanvas = useRef<SignaturePad>(null);
  const [signatureType, setSignatureType] = useState<SignatureType>(defaultType);
  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const [canvasWidth, setCanvasWidth] = useState<number>(500);
  const [canvasHeight, setCanvasHeight] = useState<number>(200);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ajuster la taille du canvas en fonction de la taille du conteneur
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth - 40; // subtract padding
        setCanvasWidth(width);
        setCanvasHeight(Math.min(200, width / 2.5));
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  // Vérifier si le canvas est vide après chaque modification
  const handleChange = () => {
    if (sigCanvas.current) {
      setIsEmpty(sigCanvas.current.isEmpty());
    }
  };

  // Effacer la signature
  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsEmpty(true);
    }
  };

  // Sauvegarder la signature
  const handleSave = () => {
    if (sigCanvas.current && !isEmpty) {
      const signatureImage = sigCanvas.current.toDataURL('image/png');
      onSave(signatureImage, signatureType);
    }
  };

  // Télécharger la signature
  const handleDownload = () => {
    if (sigCanvas.current && !isEmpty) {
      const signatureImage = sigCanvas.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = signatureImage;
      link.download = 'signature.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto" ref={containerRef}>
      <CardHeader>
        <CardTitle>Signature électronique</CardTitle>
        <CardDescription>
          Dessinez votre signature dans la zone ci-dessous
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Types de signature */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Type de signature</p>
          <Select
            value={signatureType}
            onValueChange={(value) => setSignatureType(value as SignatureType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SignatureType.STANDARD}>
                Standard (Simple)
              </SelectItem>
              <SelectItem value={SignatureType.ADVANCED} disabled={!hasCertificate}>
                Avancée (Avec certificat) {!hasCertificate && "- Certificat requis"}
              </SelectItem>
              <SelectItem value={SignatureType.QUALIFIED} disabled={!hasCertificate}>
                Qualifiée (Valeur juridique) {!hasCertificate && "- Certificat requis"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Zone de signature */}
        <div className="border-2 border-dashed border-gray-200 rounded-md overflow-hidden bg-white">
          <SignaturePad
            ref={sigCanvas}
            canvasProps={{
              className: "signature-canvas",
              width: canvasWidth,
              height: canvasHeight,
              style: { width: '100%', height: '100%' }
            }}
            onEnd={handleChange}
          />
        </div>

        {!hasCertificate && signatureType !== SignatureType.STANDARD && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Certificat requis</AlertTitle>
            <AlertDescription>
              Pour utiliser une signature avancée ou qualifiée, vous devez d'abord obtenir un certificat numérique.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <Button variant="outline" size="sm" onClick={handleClear} disabled={isEmpty}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Effacer
          </Button>
          <Button variant="secondary" size="sm" className="ml-2" onClick={handleDownload} disabled={isEmpty}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
        </div>
        <div>
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
          <Button variant="default" size="sm" className="ml-2" onClick={handleSave} disabled={isEmpty}>
            <Check className="mr-2 h-4 w-4" />
            Signer
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
