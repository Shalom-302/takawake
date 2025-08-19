"use client";

import { useState } from "react";
import { useCookieConsent } from "@/lib/contexts/cookie-context";
import { motion } from "framer-motion";
import CookieBanner from "./cookie-banner";
import Image from "next/image";

/**
 * A floating button that allows users to open cookie preferences
 */
export default function FloatingConsentButton() {
    const { consentGiven } = useCookieConsent();
    const [isOpen, setIsOpen] = useState(false);

    // If consent not given, the full banner will show instead of this button
    if (!consentGiven) return null;

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
            )}

            <motion.div
                className="fixed bottom-4 right-4 z-50"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                    aria-label="Cookie settings"
                >
                    <Image src="/cookie-icon.svg" alt="Cookie Settings" width={24} height={24} />
                </button>

                {isOpen && (
                    <div className="absolute bottom-16 right-0 w-[90vw] max-w-md">
                        <CookieBanner showAsModal onClose={() => setIsOpen(false)} />
                    </div>
                )}
            </motion.div>
        </>
    );
}
