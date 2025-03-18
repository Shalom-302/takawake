/**
 * API route pour récupérer le statut complet des cookies
 */
import { NextResponse } from 'next/server';
import { getStoredConsent, isConsentExpired } from '@/lib/services/cookie-service';

export async function GET() {
  try {
    // Récupération du consentement stocké
    const storedConsent = getStoredConsent();
    
    if (!storedConsent) {
      return NextResponse.json({
        active: false,
        message: "Aucun consentement n'a été donné",
        consent: null,
        expired: false
      });
    }
    
    // Vérification de l'expiration
    const isExpired = isConsentExpired();
    
    // Liste des cookies acceptés
    const acceptedCookies = Object.entries(storedConsent)
      .filter(([key, value]) => 
        value === true && 
        key !== "accept_all" && 
        key !== "reject_all" && 
        key !== "timestamp"
      )
      .map(([key]) => key);
    
    // Date du dernier consentement
    const consentDate = storedConsent.timestamp 
      ? new Date(storedConsent.timestamp).toISOString()
      : null;
    
    // Construction de la réponse
    const response = {
      active: !isExpired,
      message: isExpired ? "Le consentement a expiré" : "Consentement actif",
      consent: {
        ...storedConsent,
        consentDate,
        acceptedCookies
      },
      expired: isExpired
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error retrieving cookie status:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve cookie status' },
      { status: 500 }
    );
  }
}
