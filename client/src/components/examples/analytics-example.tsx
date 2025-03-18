"use client";

import { useEffect, useState } from "react";
import ScriptProvider from "@/components/cookie/script-provider";
import { useCookieConsent } from "@/lib/context/cookie-context";

/**
 * Example component showing how to implement analytics with cookie consent
 */
export default function AnalyticsExample() {
  const { consent, consentGiven } = useCookieConsent();
  const [analyticsStatus, setAnalyticsStatus] = useState<string>("Not initialized");

  // Analytics initialization example
  useEffect(() => {
    if (consentGiven && consent?.statistics) {
      setAnalyticsStatus("Analytics initialized and tracking enabled");
    } else if (consentGiven && !consent?.statistics) {
      setAnalyticsStatus("Analytics disabled by user preference");
    } else {
      setAnalyticsStatus("Waiting for user consent");
    }
  }, [consent, consentGiven]);

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-medium mb-2">Analytics Status</h3>
      <p className="mb-4">{analyticsStatus}</p>
      
      {/* Example Google Analytics script - this will only load if user consents to statistics cookies */}
      <ScriptProvider
        category="statistics"
        src="https://www.googletagmanager.com/gtag/js?id=EXAMPLE-ID"
        id="google-analytics"
        onLoad={() => console.log("Google Analytics loaded")}
      />
      
      {/* A conditional inline script for GA initialization */}
      {consentGiven && consent?.statistics && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'EXAMPLE-ID');
            `,
          }}
        />
      )}
    </div>
  );
}
