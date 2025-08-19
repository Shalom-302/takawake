/**
 * Types for cookie consent management
 */

export interface CookieCategory {
    id: number;
    name: string;
    description: string;
    is_necessary: boolean;
    created_at: string;
    updated_at: string;
}

export interface CookieSettings {
    id: number;
    consent_expiry_days: number;
    block_until_consent: boolean;
    created_at: string;
    updated_at: string;
    categories: CookieCategory[];
}

export interface CookieConsent {
    necessary: boolean;
    preferences: boolean;
    statistics: boolean;
    marketing: boolean;
}

export interface CookieConsentSubmission extends CookieConsent {
    accept_all: boolean;
    reject_all: boolean;
    user_ip?: string;
    user_agent?: string;
    timestamp?: number; // Horodatage du consentement
}
