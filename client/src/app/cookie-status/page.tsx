"use client";

import { useEffect } from "react";
import { useCookieStatus } from "@/lib/services/cookie-service";
import CookieConsentDashboard from "@/components/examples/cookie-consent-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badges/badge";

export default function CookieStatusPage() {
    const { status, isLoading, refreshStatus } = useCookieStatus();

    // Rafraîchir le statut au chargement de la page
    useEffect(() => {
        refreshStatus();
    }, [refreshStatus]);

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">État des cookies</h1>

            <div className="grid gap-8 mb-8">
                {isLoading ? (
                    <div className="text-center p-8">
                        <p>Chargement des informations sur les cookies...</p>
                    </div>
                ) : !status ? (
                    <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md">
                        <p className="text-yellow-800">
                            Impossible de récupérer les informations sur les cookies.
                        </p>
                    </div>
                ) : (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Statut du consentement</CardTitle>
                                <CardDescription>
                                    {status.active
                                        ? "Votre consentement aux cookies est actif et valide."
                                        : "Aucun consentement valide n'a été donné ou votre consentement a expiré."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center mb-4">
                                    <Badge
                                        className={`mr-2 ${status.active ? "bg-green-500" : "bg-gray-400"}`}
                                    >
                                        {status.active ? "Actif" : "Inactif"}
                                    </Badge>
                                    {status.expired && (
                                        <Badge variant="destructive" className="mr-2">
                                            Expiré
                                        </Badge>
                                    )}
                                    {status.consent?.consentDate && (
                                        <span className="text-sm text-gray-500">
                                            Mis à jour le{" "}
                                            {new Date(
                                                status.consent.consentDate
                                            ).toLocaleDateString()}{" "}
                                            à{" "}
                                            {new Date(
                                                status.consent.consentDate
                                            ).toLocaleTimeString()}
                                        </span>
                                    )}
                                </div>

                                {status.consent && (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-medium mb-2">
                                                Cookies acceptés
                                            </h3>
                                            <ul className="list-disc pl-5 space-y-1">
                                                {status.consent.acceptedCookies.length > 0 ? (
                                                    status.consent.acceptedCookies.map(cookie => (
                                                        <li key={cookie} className="capitalize">
                                                            {cookie}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="text-gray-500">
                                                        Aucun cookie accepté
                                                    </li>
                                                )}
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium mb-2">
                                                Détails du consentement
                                            </h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-gray-50 p-2 rounded">
                                                    <span className="font-medium">Nécessaires</span>
                                                    <span className="ml-2">
                                                        {status.consent.necessary ? "✅" : "❌"}
                                                    </span>
                                                </div>
                                                <div className="bg-gray-50 p-2 rounded">
                                                    <span className="font-medium">Préférences</span>
                                                    <span className="ml-2">
                                                        {status.consent.preferences ? "✅" : "❌"}
                                                    </span>
                                                </div>
                                                <div className="bg-gray-50 p-2 rounded">
                                                    <span className="font-medium">
                                                        Statistiques
                                                    </span>
                                                    <span className="ml-2">
                                                        {status.consent.statistics ? "✅" : "❌"}
                                                    </span>
                                                </div>
                                                <div className="bg-gray-50 p-2 rounded">
                                                    <span className="font-medium">Marketing</span>
                                                    <span className="ml-2">
                                                        {status.consent.marketing ? "✅" : "❌"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="mt-8">
                            <h2 className="text-2xl font-semibold mb-4">Gérer vos préférences</h2>
                            <CookieConsentDashboard />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
