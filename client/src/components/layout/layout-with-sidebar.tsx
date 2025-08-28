"use client";

import React, { ReactNode, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/header";
import { useAuth } from "@/lib/contexts/auth-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface LayoutWithSidebarProps {
    children: ReactNode;
}

export function LayoutWithSidebar({ children }: LayoutWithSidebarProps) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [expanded, setExpanded] = useState(true);

    // Fonction de déconnexion
    const handleLogout = async () => {
        await logout();
        router.push("/auth/login");
    };

    // Gestionnaire pour l'état de la sidebar
    const handleSidebarToggle = (isExpanded: boolean) => {
        setExpanded(isExpanded);
    };

    // Si l'utilisateur est connecté, afficher le layout complet
    if (user) {
        return (
            <div className="flex h-screen overflow-hidden bg-background">
                {/* Sidebar */}
                <Sidebar onToggle={handleSidebarToggle} initialExpanded={expanded} />

                {/* Main content - s'étire automatiquement quand la sidebar se replie */}
                <div
                    className={cn(
                        "flex-1 flex flex-col transition-all duration-300 overflow-auto",
                        expanded ? "md:pl-64" : "md:pl-20",
                        "w-full" // Prend toute la largeur disponible
                    )}
                >
                    {/* Header */}
                    <AppHeader user={user} onLogout={handleLogout} />

                    {/* Page content */}
                    <main className="flex-1 p-4 md:p-6">{children}</main>
                </div>
            </div>
        );
    }

    // Si l'utilisateur n'est pas connecté, afficher uniquement le contenu
    return <div className="flex-1">{children}</div>;
}
