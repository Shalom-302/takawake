/**
 * Application Analytics Provider
 *
 * Ce composant initialise et gère le suivi des interactions utilisateur
 * au niveau de l'application entière.
 */
"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { AnalyticsTrackerProvider } from "@/components/analytics/tracker-provider";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    return (
        <AnalyticsTrackerProvider>
            <AnalyticsRouteChangeTracker>{children}</AnalyticsRouteChangeTracker>
        </AnalyticsTrackerProvider>
    );
}

/**
 * Composant pour suivre les changements de route
 * et enregistrer les vues de page automatiquement
 */
function AnalyticsRouteChangeTracker({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Suivre les changements de page
    useEffect(() => {
        // Import dynamique pour éviter les problèmes SSR
        import("@/lib/services/analytics-service").then(module => {
            const AnalyticsService = module.default;

            // Vérifier si le tracking est déjà initialisé
            if (AnalyticsService.currentSession) {
                // Enregistrer la vue de page
                AnalyticsService.recordEvent({
                    event_type: "view",
                    target_type: "page",
                    target_path: pathname,
                    metadata: {
                        title: document.title,
                        url: window.location.href,
                    },
                });
            }
        });
    }, [pathname]);

    return children;
}

export default AnalyticsProvider;
