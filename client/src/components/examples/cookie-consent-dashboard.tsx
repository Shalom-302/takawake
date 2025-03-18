"use client";

import { useState, useEffect } from "react";
import { useCookieConsent } from "@/lib/context/cookie-context";
import CookieStatus from "../cookie/cookie-status";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CookieConsentSubmission } from "@/lib/types/cookies";

/**
 * Tableau de bord complet pour visualiser et gérer les consentements aux cookies
 */
export default function CookieConsentDashboard() {
  const { 
    consent, 
    consentGiven, 
    acceptAll, 
    rejectNonEssential,
    savePreferences,
    resetConsent
  } = useCookieConsent();
  
  const [customPreferences, setCustomPreferences] = useState<CookieConsentSubmission>({
    necessary: true, // Toujours requis
    preferences: false,
    statistics: false,
    marketing: false,
    accept_all: false,
    reject_all: false
  });
  
  // Synchroniser les préférences avec le consentement actuel
  useEffect(() => {
    if (consentGiven && consent) {
      setCustomPreferences({
        necessary: true, // Toujours requis
        preferences: consent.preferences || false,
        statistics: consent.statistics || false,
        marketing: consent.marketing || false,
        accept_all: false,
        reject_all: false
      });
    }
  }, [consent, consentGiven]);
  
  const handlePreferenceChange = (category: keyof CookieConsentSubmission) => {
    if (category === 'necessary') return; // Ne peut pas être modifié
    
    setCustomPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  const handleSavePreferences = async () => {
    await savePreferences(customPreferences);
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">État actuel des cookies</h2>
        <CookieStatus />
      </div>
      
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Gérer les consentements</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Button 
            onClick={acceptAll}
            className="w-full"
          >
            Accepter tous les cookies
          </Button>
          
          <Button 
            onClick={rejectNonEssential}
            variant="outline"
            className="w-full"
          >
            Accepter uniquement les cookies nécessaires
          </Button>
          
          <Button 
            onClick={resetConsent}
            variant="destructive"
            className="w-full sm:col-span-2"
          >
            Réinitialiser le consentement (afficher la bannière)
          </Button>
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Personnaliser les préférences</h3>
          
          <div className="space-y-4">
            {/* Cookies nécessaires - toujours activés */}
            <div className="flex items-start space-x-3">
              <Checkbox id="necessary-dashboard" checked={true} disabled className="mt-1" />
              <div>
                <label
                  htmlFor="necessary-dashboard"
                  className="font-medium text-sm leading-none block mb-1"
                >
                  Cookies nécessaires
                </label>
                <p className="text-sm text-gray-600">
                  Ces cookies sont requis pour le fonctionnement de base du site web. Ils ne peuvent pas être désactivés.
                </p>
              </div>
            </div>
            
            {/* Cookies de préférences */}
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="preferences-dashboard" 
                checked={customPreferences.preferences}
                onCheckedChange={() => handlePreferenceChange('preferences')}
                className="mt-1"
              />
              <div>
                <label
                  htmlFor="preferences-dashboard"
                  className="font-medium text-sm leading-none block mb-1"
                >
                  Cookies de préférences
                </label>
                <p className="text-sm text-gray-600">
                  Ces cookies permettent de mémoriser vos préférences afin de personnaliser votre expérience.
                </p>
              </div>
            </div>
            
            {/* Cookies statistiques */}
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="statistics-dashboard" 
                checked={customPreferences.statistics}
                onCheckedChange={() => handlePreferenceChange('statistics')}
                className="mt-1"
              />
              <div>
                <label
                  htmlFor="statistics-dashboard"
                  className="font-medium text-sm leading-none block mb-1"
                >
                  Cookies statistiques
                </label>
                <p className="text-sm text-gray-600">
                  Ces cookies nous aident à comprendre comment les visiteurs interagissent avec le site web.
                </p>
              </div>
            </div>
            
            {/* Cookies marketing */}
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="marketing-dashboard" 
                checked={customPreferences.marketing}
                onCheckedChange={() => handlePreferenceChange('marketing')}
                className="mt-1"
              />
              <div>
                <label
                  htmlFor="marketing-dashboard"
                  className="font-medium text-sm leading-none block mb-1"
                >
                  Cookies marketing
                </label>
                <p className="text-sm text-gray-600">
                  Ces cookies sont utilisés pour suivre les visiteurs sur les sites web et afficher des publicités.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Button onClick={handleSavePreferences}>
              Enregistrer les préférences
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Scripts chargés</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">Scripts nécessaires</h3>
            <p className="text-sm">Toujours chargés, indépendamment du consentement.</p>
          </div>
          
          {consentGiven && consent?.preferences && (
            <div className="p-4 bg-green-50 border border-green-100 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">Scripts de préférences</h3>
              <p className="text-sm text-green-700">Activés - Ces scripts sont chargés pour mémoriser vos préférences.</p>
            </div>
          )}
          
          {consentGiven && consent?.statistics && (
            <div className="p-4 bg-green-50 border border-green-100 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">Scripts d&apos;analytics</h3>
              <p className="text-sm text-green-700">Activés - Google Analytics et autres outils de statistiques sont chargés.</p>
            </div>
          )}
          
          {consentGiven && consent?.marketing && (
            <div className="p-4 bg-green-50 border border-green-100 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">Scripts marketing</h3>
              <p className="text-sm text-green-700">Activés - Pixels publicitaires et scripts de remarketing sont chargés.</p>
            </div>
          )}
          
          {(!consentGiven || !consent?.preferences) && (
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-md opacity-60">
              <h3 className="font-medium text-gray-500 mb-2">Scripts de préférences</h3>
              <p className="text-sm text-gray-500">Désactivés - Vous n&apos;avez pas donné votre consentement.</p>
            </div>
          )}
          
          {(!consentGiven || !consent?.statistics) && (
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-md opacity-60">
              <h3 className="font-medium text-gray-500 mb-2">Scripts d&apos;analytics</h3>
              <p className="text-sm text-gray-500">Désactivés - Vous n&apos;avez pas donné votre consentement.</p>
            </div>
          )}
          
          {(!consentGiven || !consent?.marketing) && (
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-md opacity-60">
              <h3 className="font-medium text-gray-500 mb-2">Scripts marketing</h3>
              <p className="text-sm text-gray-500">Désactivés - Vous n&apos;avez pas donné votre consentement.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
