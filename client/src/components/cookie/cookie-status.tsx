"use client";

import { useCookieConsent } from "@/lib/contexts/cookie-context";

interface CookieStatusProps {
  className?: string;
}

/**
 * Composant qui affiche l'état actuel des consentements aux cookies
 */
export default function CookieStatus({ className = "" }: CookieStatusProps) {
  const { consent, consentGiven } = useCookieConsent();

  if (!consentGiven || !consent) {
    return (
      <div className={`p-4 border rounded-md bg-gray-50 ${className}`}>
        <h3 className="text-lg font-medium mb-2">État des cookies</h3>
        <p className="mb-2">Aucun consentement n&apos;a encore été donné pour les cookies.</p>
        <p className="text-sm text-gray-600">Veuillez configurer vos préférences via la bannière de cookies.</p>
      </div>
    );
  }

  const acceptedCookies = Object.entries(consent)
    .filter(([key, value]) => value === true && key !== "accept_all" && key !== "reject_all")
    .map(([key]) => key);

  return (
    <div className={`p-4 border rounded-md bg-gray-50 ${className}`}>
      <h3 className="text-lg font-medium mb-2">Cookies acceptés</h3>
      
      {acceptedCookies.length > 0 ? (
        <ul className="list-disc pl-5 mb-4">
          {consent.necessary && (
            <li className="mb-1">
              <span className="font-medium">Nécessaires</span>
              <p className="text-sm text-gray-600">
                Ces cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.
              </p>
            </li>
          )}
          
          {consent.preferences && (
            <li className="mb-1">
              <span className="font-medium">Préférences</span>
              <p className="text-sm text-gray-600">
                Ces cookies permettent de mémoriser vos préférences et paramètres.
              </p>
            </li>
          )}
          
          {consent.statistics && (
            <li className="mb-1">
              <span className="font-medium">Statistiques</span>
              <p className="text-sm text-gray-600">
                Ces cookies nous aident à comprendre comment les visiteurs interagissent avec le site.
              </p>
            </li>
          )}
          
          {consent.marketing && (
            <li className="mb-1">
              <span className="font-medium">Marketing</span>
              <p className="text-sm text-gray-600">
                Ces cookies sont utilisés pour suivre les visiteurs sur les sites web et afficher des publicités pertinentes.
              </p>
            </li>
          )}
        </ul>
      ) : (
        <p className="mb-2">Vous n&apos;avez accepté aucun cookie optionnel.</p>
      )}
      
      <div className="text-sm bg-blue-50 p-2 rounded-md border border-blue-100">
        <p className="font-medium text-blue-800">Dernier consentement donné</p>
        <p className="text-blue-700">
          {new Date(consent.timestamp || Date.now()).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
