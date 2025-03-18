"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getCookieSettings, 
  getStoredConsent, 
  isConsentExpired, 
  storeConsent, 
  updateConsentDate,
  submitCookieConsent
} from '../services/cookie-service';
import { CookieSettings, CookieConsentSubmission } from '../types/cookies';

interface CookieContextType {
  cookieSettings: CookieSettings | null;
  showCookieBanner: boolean;
  consentGiven: boolean;
  consent: CookieConsentSubmission | null;
  acceptAll: () => Promise<void>;
  rejectNonEssential: () => Promise<void>;
  savePreferences: (preferences: CookieConsentSubmission) => Promise<void>;
  hideBanner: () => void;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

interface CookieProviderProps {
  children: ReactNode;
}

export function CookieProvider({ children }: CookieProviderProps) {
  const [cookieSettings, setCookieSettings] = useState<CookieSettings | null>(null);
  const [showCookieBanner, setShowCookieBanner] = useState<boolean>(false);
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [consent, setConsent] = useState<CookieConsentSubmission | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Initialize cookie settings and consent state
  useEffect(() => {
    async function initialize() {
      try {
        // Fetch cookie settings from API
        const settings = await getCookieSettings();
        setCookieSettings(settings);
        
        // Check if consent exists and is not expired
        const storedConsent = getStoredConsent();
        
        // Handle the case where settings is null (API failure)
        // Use a default expiry period of 180 days if settings is null
        const expiryDays = settings?.consent_expiry_days || 180;
        const expired = isConsentExpired(expiryDays);
        
        if (storedConsent && !expired) {
          setConsent(storedConsent);
          setConsentGiven(true);
          setShowCookieBanner(false);
        } else {
          // Default consent (only necessary cookies)
          setConsent({
            necessary: true,
            preferences: false,
            statistics: false,
            marketing: false,
            accept_all: false,
            reject_all: true
          });
          setConsentGiven(false);
          setShowCookieBanner(true);
        }
        
        setInitialized(true);
      } catch (error) {
        console.error('Error initializing cookie context:', error);
        // En cas d'erreur, on initialise quand même le contexte avec des valeurs par défaut
        setCookieSettings(null);
        setConsent({
          necessary: true,
          preferences: false,
          statistics: false,
          marketing: false,
          accept_all: false,
          reject_all: true
        });
        setConsentGiven(false);
        setShowCookieBanner(true);
        setInitialized(true);
      }
    }
    
    initialize();
  }, []);

  const savePreferences = async (preferences: CookieConsentSubmission) => {
    try {
      await submitCookieConsent(preferences);
      storeConsent(preferences);
      updateConsentDate();
      setConsent(preferences);
      setConsentGiven(true);
      setShowCookieBanner(false);
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
    }
  };

  const acceptAll = async () => {
    const allAccepted = {
      necessary: true,
      preferences: true,
      statistics: true,
      marketing: true,
      accept_all: true,
      reject_all: false
    };
    
    await savePreferences(allAccepted);
  };

  const rejectNonEssential = async () => {
    const onlyNecessary = {
      necessary: true,
      preferences: false,
      statistics: false,
      marketing: false,
      accept_all: false,
      reject_all: true
    };
    
    await savePreferences(onlyNecessary);
  };

  const hideBanner = () => {
    setShowCookieBanner(false);
  };

  // Only render children when initialization is complete
  if (!initialized) {
    return null; // Or a loading state
  }

  return (
    <CookieContext.Provider
      value={{
        cookieSettings,
        showCookieBanner,
        consentGiven,
        consent,
        acceptAll,
        rejectNonEssential,
        savePreferences,
        hideBanner
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieProvider');
  }
  return context;
}
