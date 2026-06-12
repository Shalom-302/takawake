import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import { Loader2, RefreshCw } from "lucide-react";
import { DashboardTypeSelect } from "./dashboard-type-select";
import { DateRangeSelect } from "./date-range-select";
import axios from "axios";

interface MatomoDashboardProps {
    title: string;
    description?: string;
    defaultDashboardType?: string;
    defaultDateRange?: string;
    height?: number;
}

export function MatomoDashboard({
    title,
    description,
    defaultDashboardType = "overview",
    defaultDateRange = "last7",
    height = 500,
}: MatomoDashboardProps) {
    const [dashboardType, setDashboardType] = useState(defaultDashboardType);
    const [dateRange, setDateRange] = useState(defaultDateRange);
    const [embedUrl, setEmbedUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.post("/api/matomo/embed/dashboard", {
                dashboard_type: dashboardType,
                date_range: dateRange,
            });

            if (response.data && response.data.embed_url) {
                setEmbedUrl(response.data.embed_url);
            } else {
                setError("No embed URL returned from server");
            }
        } catch (err: unknown) {
            console.error("Error loading Matomo dashboard:", err);
            setError(err instanceof Error ? err.message : "Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    // Load dashboard when component mounts or when type/range changes
    useEffect(() => {
        loadDashboard();
    }, [dashboardType, dateRange]);

    return (
        <Card className="w-full shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </div>
                <div className="flex items-center space-x-2">
                    <DateRangeSelect value={dateRange} onChange={setDateRange} />
                    <DashboardTypeSelect value={dashboardType} onChange={setDashboardType} />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={loadDashboard}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div
                        className="flex flex-col items-center justify-center"
                        style={{ height: `${height}px` }}
                    >
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Chargement du tableau de bord Matomo...
                        </p>
                    </div>
                ) : error ? (
                    <div
                        className="flex flex-col items-center justify-center"
                        style={{ height: `${height}px` }}
                    >
                        <p className="text-sm text-destructive">{error}</p>
                        <Button variant="outline" className="mt-4" onClick={loadDashboard}>
                            Réessayer
                        </Button>
                    </div>
                ) : embedUrl ? (
                    <iframe
                        src={embedUrl}
                        width="100%"
                        height={height}
                        frameBorder="0"
                        className="rounded-md"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                ) : (
                    <div
                        className="flex flex-col items-center justify-center"
                        style={{ height: `${height}px` }}
                    >
                        <p className="text-sm text-muted-foreground">
                            Cliquez sur &quot;Actualiser&quot; pour charger le tableau de bord
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
