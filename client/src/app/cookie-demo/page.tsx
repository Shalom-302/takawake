"use client";

import AnalyticsExample from "@/components/examples/analytics-example";
import FloatingConsentButton from "@/components/cookie/floating-consent-button";
import CookieConsentDashboard from "@/components/examples/cookie-consent-dashboard";
import { useCookieConsent } from "@/lib/contexts/cookie-context";

export default function CookieDemoPage() {
  const { showCookieBanner } = useCookieConsent();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Cookie system demonstration</h1>
      
      <div className="grid gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Cookie consent dashboard</h2>
          <CookieConsentDashboard />
        </section>
        
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Analytics status</h2>
          <AnalyticsExample />
          <p className="mt-2 text-sm text-gray-600">
            This example shows how the loading of analytics scripts depends on user consent.
          </p>
        </section>
        
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Floating consent button</h2>
          <p className="mb-4">
            A floating button appears to allow the user to modify their cookie preferences after initial consent.
          </p>
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <p className="text-sm">
              Current floating button state: <span className="font-semibold">{showCookieBanner ? "Hidden (banner visible)" : "Visible (if consent given)"}</span>
            </p>
          </div>
          
          <div className="relative border p-4 rounded-md h-36">
            <p className="text-sm mb-4">Preview of the button (normally floating in the bottom right-hand corner of the screen) :</p>
            <div className="absolute bottom-4 right-4">
              <FloatingConsentButton />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
