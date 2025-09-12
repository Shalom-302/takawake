/**
 * Analytics Overview Component
 * Displays key analytics metrics and statistics in a dashboard format
 */
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/buttons/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select/select";
import { Loader2, Users, Eye, MousePointer, Clock, BarChart } from "lucide-react";
import AnalyticsService from "@/lib/services/analytics-service";

interface AnalyticsOverviewProps {
    className?: string;
}

interface OverviewMetrics {
    total_sessions: number;
    total_events: number;
    unique_users: number;
    events_per_session: number;
}

interface TopEventType {
    type: string;
    count: number;
}

interface TopPage {
    path: string;
    visits: number;
}

export function AnalyticsOverview({ className }: AnalyticsOverviewProps) {
    const [loading, setLoading] = useState(false);
    const [timeRange, setTimeRange] = useState<string>("7");
    const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
    const [topEventTypes, setTopEventTypes] = useState<TopEventType[]>([]);
    const [topPages, setTopPages] = useState<TopPage[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOverviewData();
    }, []);

    const fetchOverviewData = async () => {
        try {
            setLoading(true);
            setError(null);

            const days = parseInt(timeRange);
            const data = await AnalyticsService.getDashboardOverview(days);

            setMetrics(data.metrics);
            setTopEventTypes(data.top_event_types || []);
            setTopPages(data.top_pages || []);
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de la récupération des données");
            console.error("Erreur lors de la récupération des données analytics:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTimeRangeChange = (value: string) => {
        setTimeRange(value);
    };

    const getEventTypeIcon = (type: string) => {
        switch (type) {
            case "click":
                return <MousePointer className="h-4 w-4 mr-2" />;
            case "view":
                return <Eye className="h-4 w-4 mr-2" />;
            case "submit":
                return <BarChart className="h-4 w-4 mr-2" />;
            default:
                return <BarChart className="h-4 w-4 mr-2" />;
        }
    };

    const formatEventTypeName = (type: string) => {
        switch (type) {
            case "click":
                return "Clics";
            case "view":
                return "Vues de page";
            case "submit":
                return "Soumissions";
            default:
                return type;
        }
    };

    const formatPagePath = (path: string) => {
        if (!path) return "Page d'accueil";
        if (path === "/") return "Page d'accueil";

        // Remove trailing slash if present
        const cleanPath = path.endsWith("/") ? path.slice(0, -1) : path;

        // Get the last segment of the path
        const segments = cleanPath.split("/");
        const lastSegment = segments[segments.length - 1];

        // Capitalize and replace dashes with spaces
        return lastSegment
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle>Vue d'ensemble des analyses</CardTitle>
                    <CardDescription>Métriques clés d'utilisation et d'engagement</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                    <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Sélectionner la période" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Dernier jour</SelectItem>
                            <SelectItem value="7">7 derniers jours</SelectItem>
                            <SelectItem value="30">30 derniers jours</SelectItem>
                            <SelectItem value="90">3 derniers mois</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={fetchOverviewData}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Actualiser
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Chargement des données analytics...
                        </p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <p className="text-sm text-destructive">{error}</p>
                        <Button variant="outline" className="mt-4" onClick={fetchOverviewData}>
                            Réessayer
                        </Button>
                    </div>
                ) : metrics ? (
                    <div className="space-y-8">
                        {/* Key metrics grid */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-10 w-10 text-primary" />
                                        <div>
                                            <p className="text-3xl font-bold">
                                                {metrics.unique_users}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Utilisateurs uniques
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-10 w-10 text-primary" />
                                        <div>
                                            <p className="text-3xl font-bold">
                                                {metrics.total_sessions}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Sessions totales
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <MousePointer className="h-10 w-10 text-primary" />
                                        <div>
                                            <p className="text-3xl font-bold">
                                                {metrics.total_events}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Événements enregistrés
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <BarChart className="h-10 w-10 text-primary" />
                                        <div>
                                            <p className="text-3xl font-bold">
                                                {metrics.events_per_session}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Événements par session
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top content sections */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Types d'événements populaires
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {topEventTypes.length > 0 ? (
                                        <div className="space-y-4">
                                            {topEventTypes.map((eventType, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center">
                                                        {getEventTypeIcon(eventType.type)}
                                                        <span>
                                                            {formatEventTypeName(eventType.type)}
                                                        </span>
                                                    </div>
                                                    <span className="font-bold">
                                                        {eventType.count}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Aucune donnée disponible
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Pages les plus visitées
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {topPages.length > 0 ? (
                                        <div className="space-y-4">
                                            {topPages.map((page, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        <span
                                                            className="truncate max-w-[200px]"
                                                            title={page.path}
                                                        >
                                                            {formatPagePath(page.path)}
                                                        </span>
                                                    </div>
                                                    <span className="font-bold">{page.visits}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Aucune donnée disponible
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64">
                        <p className="text-sm text-muted-foreground">
                            Cliquez sur "Actualiser" pour charger les données analytics
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default AnalyticsOverview;
