import useSWR, { mutate } from 'swr';
import { CookieSettings, CookieConsentSubmission } from '../types/cookies';

// Constants
const CONSENT_STORAGE_KEY = 'cookie_consent';

// Fetcher for SWR calls
const fetcher = async (url: string) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Hook to retrieve cookie settings from the backend
 */
export function useCookieSettings() {
  const { data, error, isLoading, mutate } = useSWR<CookieSettings>(
    `/api/privacy/cookie-settings`,
    fetcher
  );

  return {
    cookieSettings: data,
    isLoadingSettings: isLoading,
    isErrorSettings: error,
    refreshSettings: mutate
  };
}

/**
 * Hook to submit cookie consent
 */
export function useSubmitCookieConsent() {
  // Reference to useCookieSettings hook to invalidate cache if necessary
  const { refreshSettings } = useCookieSettings();

  const submitConsent = async (consent: CookieConsentSubmission): Promise<boolean> => {
    try {
      const consentWithTimestamp = {
        ...consent,
        timestamp: Date.now()
      };
      
      const response = await fetch(`/api/privacy/cookie-consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consentWithTimestamp),
      });

      if (!response.ok) {
        throw new Error('Failed to submit consent');
      }

      // Store consent in local storage
      storeConsentInLocalStorage(consentWithTimestamp);
      
      // Invalidate cache if necessary
      await refreshSettings();
      
      return true;
    } catch (error) {
      console.error('Error submitting cookie consent:', error);
      return false;
    }
  };

  return { submitConsent };
}

/**
 * Retrieves the consent stored in local storage
 */
export function getStoredConsent(): CookieConsentSubmission | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    
    if (!storedConsent) {
      return null;
    }
    
    return JSON.parse(storedConsent) as CookieConsentSubmission;
  } catch (error) {
    console.error('Error retrieving stored consent:', error);
    return null;
  }
}

/**
 * Retrieves the consent from local storage while checking for expiration
 */
export function getConsentFromLocalStorage(expiryDays: number = 180): CookieConsentSubmission | null {
  const storedConsent = getStoredConsent();
  
  if (!storedConsent) {
    return null;
  }
  
  // Check for expiration
  if (isConsentExpired(expiryDays)) {
    return null;
  }
  
  return storedConsent;
}

/**
 * Stores the consent in local storage
 */
export function storeConsentInLocalStorage(consent: CookieConsentSubmission): void {
  // Check if code is running in the browser
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Ensure there is an expiration timestamp
    const consentWithTimestamp = {
      ...consent,
      timestamp: consent.timestamp || Date.now()
    };
    
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentWithTimestamp));
  } catch (error) {
    console.error('Error storing consent:', error);
  }
}

/**
 * Checks if the consent has expired
 */
export function isConsentExpired(expiryDays: number = 180): boolean {
  const storedConsent = getStoredConsent();
  
  if (!storedConsent || !('timestamp' in storedConsent)) {
    return true;
  }
  
  interface ConsentWithTimestamp extends CookieConsentSubmission {
    timestamp: number;
  }
  
  const consentWithTimestamp = storedConsent as ConsentWithTimestamp;
  const expiryTime = consentWithTimestamp.timestamp + (expiryDays * 24 * 60 * 60 * 1000);
  
  return Date.now() > expiryTime;
}

/**
 * Type for cookie status response
 */
interface CookieStatusResponse {
  active: boolean;
  message: string;
  consent: (CookieConsentSubmission & {
    consentDate: string | null;
    acceptedCookies: string[];
  }) | null;
  expired: boolean;
}

/**
 * Hook to retrieve the complete cookie status
 */
export function useCookieStatus() {
  const { data, error, isLoading, mutate } = useSWR<CookieStatusResponse>(
    `/api/privacy/cookie-status`,
    fetcher
  );

  return {
    status: data,
    isLoading,
    isError: !!error,
    refreshStatus: mutate
  };
}
