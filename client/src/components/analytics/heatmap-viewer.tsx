/**
 * Heatmap Viewer Component
 * Displays user interaction heatmaps with customizable filters
 */
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/buttons/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select/select";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label/label";
import { Loader2, Calendar as CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";
import AnalyticsService, { HeatmapData, HeatmapFilter } from "@/lib/services/analytics-service";

interface HeatmapViewerProps {
    defaultPage?: string;
    defaultComponent?: string;
    defaultEventType?: string;
    className?: string;
}

export function HeatmapViewer({
    defaultPage,
    defaultComponent,
    defaultEventType = "click",
    className,
}: HeatmapViewerProps) {
    const [loading, setLoading] = useState(false);
    const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<HeatmapFilter>({
        page_path: defaultPage,
        component_name: defaultComponent,
        event_type: defaultEventType,
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        end_date: new Date().toISOString(),
    });
    const [startDate, setStartDate] = useState<Date | undefined>(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        generateHeatmap();
    }, []);

    const generateHeatmap = async () => {
        try {
            setLoading(true);
            setError(null);

            // Update dates in filter
            const updatedFilter = {
                ...filter,
                start_date: startDate?.toISOString(),
                end_date: endDate?.toISOString(),
            };

            const data = await AnalyticsService.generateHeatmap(updatedFilter);
            if (data.points.length > 0) {
                setHeatmapData(data);
            }
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de la génération de la heatmap");
            console.error("Erreur lors de la génération de la heatmap:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartDateChange = (date?: Date) => {
        setStartDate(date);
        if (date) {
            setFilter({ ...filter, start_date: date.toISOString() });
        }
    };

    const handleEndDateChange = (date?: Date) => {
        setEndDate(date);
        if (date) {
            setFilter({ ...filter, end_date: date.toISOString() });
        }
    };

    const handleEventTypeChange = (value: string) => {
        setFilter({ ...filter, event_type: value });
    };

    const handlePagePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter({ ...filter, page_path: e.target.value });
    };

    const handleComponentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter({ ...filter, component_name: e.target.value });
    };

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle>Heatmap des interactions utilisateur</CardTitle>
                    <CardDescription>
                        Visualisation des interactions des utilisateurs sur l'application
                    </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                    <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="mr-2 h-4 w-4" />
                                Filtres
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Filtres de heatmap</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Personnalisez les données affichées dans la heatmap
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <div className="grid gap-1">
                                        <Label htmlFor="event-type">Type d'événement</Label>
                                        <Select
                                            value={filter.event_type || "click"}
                                            onValueChange={handleEventTypeChange}
                                        >
                                            <SelectTrigger id="event-type">
                                                <SelectValue placeholder="Sélectionner un type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="click">Clics</SelectItem>
                                                <SelectItem value="view">Vues</SelectItem>
                                                <SelectItem value="hover">Survols</SelectItem>
                                                <SelectItem value="submit">Soumissions</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-1">
                                        <Label htmlFor="page-path">Chemin de la page</Label>
                                        <Input
                                            id="page-path"
                                            placeholder="/tableau-de-bord"
                                            value={filter.page_path || ""}
                                            onChange={handlePagePathChange}
                                        />
                                    </div>
                                    <div className="grid gap-1">
                                        <Label htmlFor="component-name">Nom du composant</Label>
                                        <Input
                                            id="component-name"
                                            placeholder="DataTable"
                                            value={filter.component_name || ""}
                                            onChange={handleComponentNameChange}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="grid gap-1">
                                            <Label htmlFor="start-date">Date de début</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        id="start-date"
                                                        variant={"outline"}
                                                        className="justify-start text-left font-normal"
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {startDate ? (
                                                            format(startDate, "PPP", { locale: fr })
                                                        ) : (
                                                            <span>Choisir une date</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={startDate}
                                                        onSelect={handleStartDateChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="grid gap-1">
                                            <Label htmlFor="end-date">Date de fin</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        id="end-date"
                                                        variant={"outline"}
                                                        className="justify-start text-left font-normal"
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {endDate ? (
                                                            format(endDate, "PPP", { locale: fr })
                                                        ) : (
                                                            <span>Choisir une date</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={endDate}
                                                        onSelect={handleEndDateChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => {
                                        generateHeatmap();
                                        setIsFilterOpen(false);
                                    }}
                                >
                                    Appliquer les filtres
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={generateHeatmap}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Rafraîchir
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Génération de la heatmap en cours...
                        </p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <p className="text-sm text-destructive">{error}</p>
                        <Button variant="outline" className="mt-4" onClick={generateHeatmap}>
                            Réessayer
                        </Button>
                    </div>
                ) : heatmapData ? (
                    <div>
                        <div className="relative w-full overflow-hidden rounded-lg border">
                            {/* Background screenshot or placeholder */}
                            <div className="bg-background h-96 w-full flex items-center justify-center">
                                {filter.page_path ? (
                                    <p className="text-sm text-muted-foreground">
                                        Page: {filter.page_path}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Toutes les pages
                                    </p>
                                )}
                            </div>

                            {/* Heatmap overlay */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    backgroundImage: `url(data:image/png;base64,${heatmapData.base64_image})`,
                                    backgroundSize: "contain",
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                }}
                            />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="text-sm">
                                <span className="font-medium">Événements</span>:{" "}
                                {heatmapData.event_count}
                            </div>
                            <div className="text-sm">
                                <span className="font-medium">Généré</span>:{" "}
                                {format(new Date(heatmapData?.generated_at), "PPp", { locale: fr })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64">
                        <p className="text-sm text-muted-foreground">
                            Cliquez sur "Générer" pour afficher la heatmap
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default HeatmapViewer;
