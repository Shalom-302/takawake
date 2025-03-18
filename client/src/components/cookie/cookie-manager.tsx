"use client";

import { useEffect } from "react";
import { useCookieConsent } from "@/lib/context/cookie-context";
import CookieBanner from "./cookie-banner";
import FloatingConsentButton from "./floating-consent-button";

/**
 * A component that handles the cookie consent management
 * It initializes cookies based on consent and provides the cookie banner UI
 */
export default function CookieManager() {
  const { consent, consentGiven } = useCookieConsent();

  // Initialize cookies based on consent
  useEffect(() => {
    if (!consentGiven || !consent) return;

    // Set/remove functional/preferences cookies
    if (consent.preferences) {
      // Code to set preferences cookies
      // Example: localStorage.setItem("theme", "dark");
    } else {
      // Code to remove preferences cookies
      // Example: localStorage.removeItem("theme");
    }

    // Set/remove statistics/analytics cookies
    if (consent.statistics) {
      // Initialize analytics (this would be handled by the ScriptProvider component)
      console.log("Analytics enabled");
    }

    // Set/remove marketing cookies
    if (consent.marketing) {
      // Initialize marketing tools (this would be handled by the ScriptProvider component)
      console.log("Marketing enabled");
    }
  }, [consent, consentGiven]);

  return (
    <>
      <CookieBanner />
      <FloatingConsentButton />
    </>
  );
}
