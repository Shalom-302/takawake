"use client";

import AnalyticsExample from "@/components/examples/analytics-example";
import FloatingConsentButton from "@/components/cookie/floating-consent-button";
import CookieConsentDashboard from "@/components/examples/cookie-consent-dashboard";
import { useCookieConsent } from "@/lib/context/cookie-context";

export default function CookieDemoPage() {
  const { showCookieBanner } = useCookieConsent();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Démonstration du système de cookies</h1>
      
      <div className="grid gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Tableau de bord de consentement</h2>
          <CookieConsentDashboard />
        </section>
        
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Status des Analytics</h2>
          <AnalyticsExample />
          <p className="mt-2 text-sm text-gray-600">
            Cet exemple montre comment le chargement des scripts d&apos;analytics dépend du consentement de l&apos;utilisateur.
          </p>
        </section>
        
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Bouton flottant de consentement</h2>
          <p className="mb-4">
            Un bouton flottant apparaît pour permettre à l&apos;utilisateur de modifier ses préférences de cookies après avoir donné son consentement initial.
          </p>
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <p className="text-sm">
              État actuel du bouton flottant : <span className="font-semibold">{showCookieBanner ? "Caché (bannière visible)" : "Visible (si consentement donné)"}</span>
            </p>
          </div>
          
          {/* Exemple du bouton flottant (visible uniquement pour la démonstration) */}
          <div className="relative border p-4 rounded-md h-36">
            <p className="text-sm mb-4">Aperçu du bouton (normalement flottant en bas à droite de l&apos;écran) :</p>
            <div className="absolute bottom-4 right-4">
              <FloatingConsentButton />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
