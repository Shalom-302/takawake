"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layouts/main-layout";
import { Button } from "@/components/ui/button/button";
import { useAuth } from "@/lib/contexts/auth-context";

function Row({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-black/10 py-3 last:border-b-0">
            <span className="text-sm text-black/60">{label}</span>
            <span className="text-sm font-medium">{value || "—"}</span>
        </div>
    );
}

export default function AccountPage() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();
    const isAdmin = user?.role?.name === "admin";

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.push("/auth/login");
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) {
        return (
            <MainLayout>
                <div className="main-container py-24 text-center text-sm text-black/60">
                    {"Chargement..."}
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <section className="main-container max-w-lg py-12 lg:py-16">
                <h1 className="text-2xl font-bold md:text-3xl">{"Mon compte"}</h1>
                <div className="mt-6 rounded-xl border border-black/10 p-6">
                    <Row label="Email" value={user?.email} />
                    <Row label="Identifiant" value={user?.username} />
                    <Row
                        label="Statut"
                        value={
                            isAdmin
                                ? "Administrateur"
                                : "Compte lecteur — accès à tous les articles, y compris premium"
                        }
                    />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                    {isAdmin && (
                        <Button variant="secondary" asChild>
                            <a href="/dashboard">{"Accéder à l'administration"}</a>
                        </Button>
                    )}
                    <Button variant="secondary-destructive" onClick={() => logout()}>
                        {"Se déconnecter"}
                    </Button>
                </div>
            </section>
        </MainLayout>
    );
}
