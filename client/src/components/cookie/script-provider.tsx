"use client";

import Script from "next/script";
import { useCookieConsent } from "@/lib/contexts/cookie-context";

interface ScriptProviderProps {
  category: "necessary" | "preferences" | "statistics" | "marketing";
  src: string;
  strategy?: "beforeInteractive" | "afterInteractive" | "lazyOnload";
  id?: string;
  onLoad?: () => void;
}

/**
 * A component that conditionally renders scripts based on cookie consent
 */
export default function ScriptProvider({
  category,
  src,
  strategy = "afterInteractive",
  id,
  onLoad,
}: ScriptProviderProps) {
  const { consent, consentGiven } = useCookieConsent();

  // Necessary scripts are always loaded
  if (category === "necessary") {
    return (
      <Script
        src={src}
        strategy={strategy}
        id={id}
        onLoad={onLoad}
      />
    );
  }

  // Non-necessary scripts are only loaded if consent is given for that category
  if (consentGiven && consent && consent[category]) {
    return (
      <Script
        src={src}
        strategy={strategy}
        id={id}
        onLoad={onLoad}
      />
    );
  }

  // If no consent, don't render anything
  return null;
}
