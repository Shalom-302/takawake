/**
 * User Journey Viewer Component
 * Displays a sequential visualization of a user's interactions with the application
 */
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Calendar as CalendarIcon, Clock, Activity } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";
import AnalyticsService, { UserJourneyFilter } from "@/lib/services/analytics-service";

interface UserJourneyViewerProps {
    userId?: string;
    sessionId?: string;
    className?: string;
}

interface JourneySession {
    session_id: string;
    start_time: string;
    end_time?: string;
    events: JourneyEvent[];
}

interface JourneyEvent {
    id: string;
    timestamp: string;
    event_type: string;
    target_type: string;
    target_id?: string;
    target_path?: string;
    component_name?: string;
    duration_ms?: number;
    metadata?: Record<string, unknown>;
}

export function UserJourneyViewer({ userId, sessionId, className }: UserJourneyViewerProps) {
    const [loading, setLoading] = useState(false);
    const [journeyData, setJourneyData] = useState<JourneySession[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [filter] = useState<UserJourneyFilter>({
        user_id: userId,
        session_id: sessionId,
        limit: 5,
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        end_date: new Date().toISOString(),
    });
    const [selectedSessionIndex, setSelectedSessionIndex] = useState<number>(0);
    const [startDate, setStartDate] = useState<Date | undefined>(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [searchUserId, setSearchUserId] = useState<string>(userId || "");

    useEffect(() => {
        fetchUserJourney();
    }, []);

    const fetchUserJourney = async () => {
        try {
            setLoading(true);
            setError(null);

            // Update filter with current dates and search parameters
            const updatedFilter: UserJourneyFilter = {
                ...filter,
                user_id: searchUserId || undefined,
                start_date: startDate?.toISOString(),
                end_date: endDate?.toISOString(),
            };

            const response = await AnalyticsService.getUserJourney(updatedFilter);
            setJourneyData(response.journey || []);

            // Reset selected session index
            setSelectedSessionIndex(0);
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Une erreur est survenue lors de la récupération du parcours utilisateur"
            );
            console.error("Erreur lors de la récupération du parcours utilisateur:", err);
        } finally {
            setLoading(false);
        }
    };

    const getEventIcon = (eventType: string) => {
        switch (eventType) {
            case "click":
                return <div className="h-2 w-2 rounded-full bg-blue-500" />;
            case "view":
                return <div className="h-2 w-2 rounded-full bg-green-500" />;
            case "submit":
                return <div className="h-2 w-2 rounded-full bg-purple-500" />;
            default:
                return <div className="h-2 w-2 rounded-full bg-gray-500" />;
        }
    };

    const formatEventName = (event: JourneyEvent) => {
        switch (event.event_type) {
            case "click":
                return `Clic sur ${event.target_type}${event.component_name ? ` (${event.component_name})` : ""}`;
            case "view":
                return `Visite de ${event.target_path || "page"}`;
            case "submit":
                return `Soumission de ${event.target_type}${event.component_name ? ` (${event.component_name})` : ""}`;
            default:
                return `${event.event_type} - ${event.target_type}`;
        }
    };

    const selectedSession = journeyData[selectedSessionIndex];

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader>
                <div className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Parcours utilisateur</CardTitle>
                        <CardDescription>
                            Visualisation chronologique des interactions d&apos;un utilisateur
                        </CardDescription>
                    </div>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={fetchUserJourney}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Rafraîchir
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-2">
                        <Label htmlFor="user-id">ID Utilisateur</Label>
                        <div className="flex space-x-2">
                            <Input
                                id="user-id"
                                placeholder="ID Utilisateur"
                                value={searchUserId}
                                onChange={e => setSearchUserId(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="start-date">Date de début</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="start-date"
                                    variant={"outline"}
                                    className="w-full justify-start text-left font-normal"
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
                                    onSelect={setStartDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="end-date">Date de fin</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="end-date"
                                    variant={"outline"}
                                    className="w-full justify-start text-left font-normal"
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
                                    onSelect={setEndDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <Button onClick={fetchUserJourney} className="mb-6 w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Rechercher le parcours
                </Button>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Récupération des données en cours...
                        </p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <p className="text-sm text-destructive">{error}</p>
                        <Button variant="outline" className="mt-4" onClick={fetchUserJourney}>
                            Réessayer
                        </Button>
                    </div>
                ) : journeyData.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-1">
                            <div className="text-sm font-medium mb-2">Sessions</div>
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-2 pr-4">
                                    {journeyData.map((session, index) => (
                                        <div
                                            key={session.session_id}
                                            className={cn(
                                                "p-3 rounded-md border cursor-pointer transition-colors",
                                                selectedSessionIndex === index
                                                    ? "border-primary bg-primary/10"
                                                    : "hover:bg-accent"
                                            )}
                                            onClick={() => setSelectedSessionIndex(index)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-medium truncate w-32">
                                                    Session {index + 1}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(
                                                        new Date(session.start_time),
                                                        "dd/MM/yy",
                                                        { locale: fr }
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {session.events.length} événements
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {format(new Date(session.start_time), "HH:mm", {
                                                    locale: fr,
                                                })}{" "}
                                                -
                                                {session.end_time
                                                    ? format(new Date(session.end_time), " HH:mm", {
                                                          locale: fr,
                                                      })
                                                    : " en cours"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        <div className="lg:col-span-3">
                            {selectedSession ? (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="text-lg font-medium">
                                                Détails de session
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {format(
                                                    new Date(selectedSession.start_time),
                                                    "PPpp",
                                                    { locale: fr }
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                {selectedSession.end_time
                                                    ? `Durée: ${Math.round((new Date(selectedSession.end_time).getTime() - new Date(selectedSession.start_time).getTime()) / 60000)} min`
                                                    : "Session en cours"}
                                            </span>
                                        </div>
                                    </div>

                                    <ScrollArea className="h-[400px]">
                                        <div className="space-y-4 pr-4">
                                            {selectedSession.events.map((event, index) => (
                                                <div
                                                    key={event.id}
                                                    className="flex gap-3 relative pb-4"
                                                >
                                                    {/* Timeline connector */}
                                                    {index < selectedSession.events.length - 1 && (
                                                        <div className="absolute left-[7px] top-[14px] bottom-0 w-[2px] bg-border" />
                                                    )}

                                                    {/* Event icon */}
                                                    <div className="mt-1">
                                                        {getEventIcon(event.event_type)}
                                                    </div>

                                                    {/* Event content */}
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div className="font-medium text-sm">
                                                                {formatEventName(event)}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                                                                {format(
                                                                    new Date(event.timestamp),
                                                                    "HH:mm:ss",
                                                                    { locale: fr }
                                                                )}
                                                            </div>
                                                        </div>

                                                        {event.target_path && (
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                Chemin: {event.target_path}
                                                            </div>
                                                        )}

                                                        {event.target_id && (
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                ID: {event.target_id}
                                                            </div>
                                                        )}

                                                        {event.metadata &&
                                                            Object.keys(event.metadata).length >
                                                                0 && (
                                                                <div className="mt-1 p-2 rounded bg-muted text-xs">
                                                                    <div className="font-medium mb-1">
                                                                        Métadonnées:
                                                                    </div>
                                                                    {Object.entries(
                                                                        event.metadata
                                                                    ).map(([key, value]) => (
                                                                        <div
                                                                            key={key}
                                                                            className="grid grid-cols-12 gap-1"
                                                                        >
                                                                            <span className="col-span-4 text-muted-foreground">
                                                                                {key}:
                                                                            </span>
                                                                            <span className="col-span-8 truncate">
                                                                                {typeof value ===
                                                                                "object"
                                                                                    ? JSON.stringify(
                                                                                          value
                                                                                      ).substring(
                                                                                          0,
                                                                                          50
                                                                                      )
                                                                                    : String(
                                                                                          value
                                                                                      ).substring(
                                                                                          0,
                                                                                          50
                                                                                      )}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64">
                                    <p className="text-sm text-muted-foreground">
                                        Sélectionnez une session pour voir ses détails
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Activity className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Aucune donnée de parcours disponible pour cet utilisateur
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Essayez de modifier les filtres ou de vérifier l&apos;ID utilisateur
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default UserJourneyViewer;
