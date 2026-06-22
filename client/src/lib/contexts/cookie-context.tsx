"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
// import {
//     useCookieSettings,
//     useSubmitCookieConsent,
//     getConsentFromLocalStorage,
//     isConsentExpired,
// } from "../services/cookie-service";
import { CookieSettings, CookieConsentSubmission } from "../types/cookies";

interface CookieContextType {
    cookieSettings: CookieSettings | null;
    showCookieBanner: boolean;
    consentGiven: boolean;
    consent: CookieConsentSubmission | null;
    acceptAll: () => Promise<void>;
    rejectNonEssential: () => Promise<void>;
    savePreferences: (preferences: CookieConsentSubmission) => Promise<void>;
    resetConsent: () => void;
    hideBanner: () => void;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

interface CookieProviderProps {
    children: ReactNode;
}

export function CookieProvider({ children }: CookieProviderProps) {
    // Use our SWR hook for cookie settings
    // const { cookieSettings, isLoadingSettings } = useCookieSettings();
    // const { submitConsent } = useSubmitCookieConsent();

    const [showCookieBanner, setShowCookieBanner] = useState<boolean>(false);
    const [consentGiven, setConsentGiven] = useState<boolean>(false);
    const [consent, setConsent] = useState<CookieConsentSubmission | null>(null);

    // Initialize cookie settings and consent state
    // useEffect(() => {
    //     async function initialize() {
    //         try {
    //             // Check that consent exists and has not expired
    //             const storedConsent = getConsentFromLocalStorage();

    //             // Handle the case where the parameters are null (API failure)
    //             // Use a default expiration period of 180 days if the parameters are null
    //             const expiryDays = cookieSettings?.consent_expiry_days || 180;

    //             if (storedConsent && !isConsentExpired(expiryDays)) {
    //                 setConsent(storedConsent);
    //                 setConsentGiven(true);
    //                 // Do not show banner if consent is already given
    //                 setShowCookieBanner(false);
    //             } else {
    //                 // Reset consent if expired
    //                 setConsent(null);
    //                 setConsentGiven(false);
    //                 // Show banner if no consent or expired
    //                 setShowCookieBanner(true);
    //             }
    //         } catch (error) {
    //             console.error("Error initializing cookie consent:", error);
    //         }
    //     }

    //     if (!isLoadingSettings && cookieSettings) {
    //         initialize();
    //     }
    // }, [cookieSettings, isLoadingSettings]);

    // Accept all cookies
    const acceptAll = async (): Promise<void> => {
        try {
            const newConsent: CookieConsentSubmission = {
                necessary: true,
                preferences: true,
                statistics: true,
                marketing: true,
                accept_all: true,
                reject_all: false,
            };

            setConsent(newConsent);
            setConsentGiven(true);
            setShowCookieBanner(false);
        } catch (error) {
            console.error("Error accepting all cookies:", error);
        }
    };

    // Reject non-essential cookies
    const rejectNonEssential = async (): Promise<void> => {
        try {
            const newConsent: CookieConsentSubmission = {
                necessary: true,
                preferences: false,
                statistics: false,
                marketing: false,
                accept_all: false,
                reject_all: true,
            };

            setConsent(newConsent);
            setConsentGiven(true);
            setShowCookieBanner(false);
        } catch (error) {
            console.error("Error rejecting non-essential cookies:", error);
        }
    };

    // Save custom preferences
    const savePreferences = async (preferences: CookieConsentSubmission): Promise<void> => {
        try {
            // Ensure that necessary cookies are always included
            const updatedPreferences = {
                ...preferences,
                necessary: true,
            };

            setConsent(updatedPreferences);
            setConsentGiven(true);
            setShowCookieBanner(false);
        } catch (error) {
            console.error("Error saving cookie preferences:", error);
        }
    };

    // Reset consent
    const resetConsent = (): void => {
        setConsent(null);
        setConsentGiven(false);
        setShowCookieBanner(true);
    };

    // Hide banner without changing consent
    const hideBanner = (): void => {
        setShowCookieBanner(false);
    };

    // Context value
    const value: CookieContextType = {
        // cookieSettings: cookieSettings || null,
        cookieSettings: null,
        showCookieBanner,
        consentGiven,
        consent,
        acceptAll,
        rejectNonEssential,
        savePreferences,
        resetConsent,
        hideBanner,
    };

    return <CookieContext.Provider value={value}>{children}</CookieContext.Provider>;
}

export function useCookieConsent() {
    const context = useContext(CookieContext);
    if (context === undefined) {
        throw new Error("useCookieConsent must be used within a CookieProvider");
    }
    return context;
}
