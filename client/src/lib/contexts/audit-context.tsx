"use client";

import React, { createContext, useContext, useCallback, ReactNode } from "react";
import auditService, { AuditLog, CreateAuditLogRequest } from "@/lib/services/audit-service";

interface AuditContextType {
    // Fonctions pour interagir avec les logs d'audit
    createAuditLog: (data: CreateAuditLogRequest) => Promise<AuditLog>;
    logAction: (action: string, resource: string, details?: string) => Promise<void>;

    // Fonctions utilitaires pour des cas d'usage communs
    logCreate: (resource: string, resourceId: string | number) => Promise<void>;
    logUpdate: (resource: string, resourceId: string | number, details?: string) => Promise<void>;
    logDelete: (resource: string, resourceId: string | number) => Promise<void>;
    logView: (resource: string, resourceId: string | number) => Promise<void>;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export function useAudit() {
    const context = useContext(AuditContext);
    if (context === undefined) {
        throw new Error("useAudit must be used within an AuditProvider");
    }
    return context;
}

interface AuditProviderProps {
    children: ReactNode;
    userId?: number;
}

export function AuditProvider({ children, userId }: AuditProviderProps) {
    // Récupération de l'ID utilisateur depuis le contexte d'authentification si disponible

    // Fonction générique pour créer un log d'audit
    const createAuditLog = useCallback(
        async (data: CreateAuditLogRequest): Promise<AuditLog> => {
            const logData: CreateAuditLogRequest = {
                ...data,
                user_id: data.user_id || userId, // Utiliser l'ID utilisateur du contexte si non fourni
            };
            return await auditService.createAuditLog(logData);
        },
        [userId]
    );

    // Fonction pratique pour journaliser une action quelconque
    const logAction = useCallback(
        async (action: string, resource: string, details?: string): Promise<void> => {
            try {
                await createAuditLog({
                    action,
                    resource,
                    details,
                    user_id: userId,
                });
            } catch (error) {
                console.error(
                    `Erreur lors de la journalisation de l'action ${action} sur ${resource}:`,
                    error
                );
                // Échouer silencieusement pour éviter de perturber l'expérience utilisateur
            }
        },
        [createAuditLog, userId]
    );

    // Fonctions utilitaires pour des cas d'usage communs

    const logCreate = useCallback(
        async (resource: string, resourceId: string | number): Promise<void> => {
            await logAction("CREATE", resource, `Created ${resource} with ID: ${resourceId}`);
        },
        [logAction]
    );

    const logUpdate = useCallback(
        async (resource: string, resourceId: string | number, details?: string): Promise<void> => {
            await logAction(
                "UPDATE",
                resource,
                details || `Updated ${resource} with ID: ${resourceId}`
            );
        },
        [logAction]
    );

    const logDelete = useCallback(
        async (resource: string, resourceId: string | number): Promise<void> => {
            await logAction("DELETE", resource, `Deleted ${resource} with ID: ${resourceId}`);
        },
        [logAction]
    );

    const logView = useCallback(
        async (resource: string, resourceId: string | number): Promise<void> => {
            await logAction("VIEW", resource, `Viewed ${resource} with ID: ${resourceId}`);
        },
        [logAction]
    );

    const value = {
        createAuditLog,
        logAction,
        logCreate,
        logUpdate,
        logDelete,
        logView,
    };

    return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}
