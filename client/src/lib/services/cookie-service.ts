/**
 * Service for managing cookie consent
 */
import { CookieSettings, CookieConsentSubmission } from '../types/cookies';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

/**
 * Get cookie settings and categories from the backend
 */
export async function getCookieSettings(): Promise<CookieSettings> {
  const defaultSettings: CookieSettings = {
    id: 1,
    consent_expiry_days: 180,
    block_until_consent: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: [
      {
        id: 1,
        name: 'Necessary',
        description: 'These cookies are essential for the website to function properly.',
        is_necessary: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Preferences',
        description: 'These cookies allow the website to remember choices you have made in the past.',
        is_necessary: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Statistics',
        description: 'These cookies collect information about how you use the website.',
        is_necessary: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Marketing',
        description: 'These cookies are used to track visitors across websites.',
        is_necessary: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  };

  try {
    const response = await fetch(`${BACKEND_URL}/privacy/cookie-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors'
    });

    if (!response.ok) {
      console.error('Failed to fetch cookie settings:', response.status);
      return defaultSettings;
    }

    const data = await response.json();
    return data || defaultSettings;
  } catch (error) {
    console.error('Error fetching cookie settings:', error);
    // Return default settings if the API fails
    return defaultSettings;
  }
}

/**
 * Submit cookie consent preferences to the backend
 */
export async function submitCookieConsent(consent: CookieConsentSubmission): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/privacy/cookie-consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(consent),
      mode: 'cors'
    });

    if (!response.ok) {
      console.error('Failed to submit cookie consent:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error submitting cookie consent:', error);
    return false;
  }
}

/**
 * Get cookie consent from localStorage
 */
export function getStoredConsent(): CookieConsentSubmission | null {
  if (typeof window === 'undefined') return null;
  
  const consentString = localStorage.getItem('cookieConsent');
  if (!consentString) return null;
  
  try {
    return JSON.parse(consentString);
  } catch {
    return null;
  }
}

/**
 * Store cookie consent in localStorage
 */
export function storeConsent(consent: CookieConsentSubmission): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('cookieConsent', JSON.stringify(consent));
}

/**
 * Check if consent is expired
 */
export function isConsentExpired(expiryDays: number): boolean {
  if (typeof window === 'undefined') return true;
  
  const lastConsentDate = localStorage.getItem('cookieConsentDate');
  if (!lastConsentDate) return true;
  
  const expiryTime = new Date(lastConsentDate).getTime() + (expiryDays * 24 * 60 * 60 * 1000);
  return Date.now() > expiryTime;
}

/**
 * Update consent date in localStorage
 */
export function updateConsentDate(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('cookieConsentDate', new Date().toISOString());
}
