"use client"

import React, { ReactNode } from 'react'
import { AuditProvider } from './audit-context'

// Import d'autres providers ici si nécessaire

interface ProviderProps {
  children: ReactNode
}

/**
 * Composant racine qui encapsule tous les fournisseurs de contexte de l'application
 * Cela simplifie leur utilisation dans layout.tsx
 */
export function Providers({ children }: ProviderProps) {
  return (
    <AuditProvider>
      {/* Ajouter d'autres providers ici si nécessaire */}
      {children}
    </AuditProvider>
  )
}
