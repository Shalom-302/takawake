"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress-indicators/progress";
import { Button } from "@/components/ui/buttons/button";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Clock, MessageSquare, Bell, Activity, RefreshCw, BarChart3 } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useMessaging } from "@/lib/contexts/messaging-context";
import { formatRelativeTime } from "@/lib/utils/date-utils";

export default function DashboardPage() {
    const { user } = useAuth();
    const { conversations, refreshConversations, websocketStatus } = useMessaging();
    const [timeStamp, setTimeStamp] = useState(new Date().toLocaleTimeString());
    const [tokenStatus, setTokenStatus] = useState<"valid" | "refreshing">("valid");
    const [lastRefresh, setLastRefresh] = useState<string | null>(null);
    const [stats, setStats] = useState({
        messagesCount: 0,
        activitiesCount: 0,
        notificationsCount: 0,
        lastConnection: "",
        currentSessionDuration: 0,
    });

    // Calculate stats from real data
    useEffect(() => {
        // Count unread messages across all conversations
        const unreadMessages = conversations.reduce(
            (total, conv) => total + (conv.unread_count || 0),
            0
        );

        // Last connection time (example - would ideally come from backend)
        const lastLogin = localStorage.getItem("last_login") || new Date().toISOString();

        setStats(prev => ({
            ...prev,
            messagesCount: unreadMessages,
            // Conservons ces valeurs pour le moment, à remplacer plus tard par des données réelles
            activitiesCount: conversations.length,
            notificationsCount: Math.min(5, unreadMessages + 1), // Simulation basique
            lastConnection: formatRelativeTime(new Date(lastLogin)),
        }));

        // Store current login time for next visit
        localStorage.setItem("last_login", new Date().toISOString());
    }, [conversations]);

    // Function to update session duration
    const updateSessionDuration = useCallback(() => {
        setStats(prev => ({
            ...prev,
            currentSessionDuration: prev.currentSessionDuration + 1,
        }));
    }, []);

    useEffect(() => {
        // Force refresh of conversations when component mounts
        refreshConversations();

        // Listen to console logs to capture refresh events
        const originalConsoleLog = console.log;
        console.log = function (...args) {
            if (args[0] === "Token refresh in progress..." || args[0]?.includes?.("token")) {
                setTokenStatus("refreshing");
                setLastRefresh(new Date().toLocaleTimeString());

                // Reset status to "valid" after 2 seconds
                setTimeout(() => {
                    setTokenStatus("valid");
                }, 2000);
            }
            originalConsoleLog.apply(console, args);
        };

        // Update timestamp every second to show that the component is active
        const timeInterval = setInterval(() => {
            setTimeStamp(new Date().toLocaleTimeString());
        }, 1000);

        // Update session duration every minute
        const sessionInterval = setInterval(updateSessionDuration, 60000);

        return () => {
            clearInterval(timeInterval);
            clearInterval(sessionInterval);
            console.log = originalConsoleLog;
        };
    }, [updateSessionDuration, refreshConversations]);

    // Format session duration in hours:minutes
    const formatSessionDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    };

    // Select recent conversations to display
    const recentConversations = conversations
        .sort((a, b) => {
            const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
            const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
            return dateB - dateA;
        })
        .slice(0, 3);

    return (
        <ProtectedRoute>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome {user?.username || "to your dashboard"}. Here is a summary of your
                        activity.
                    </p>
                </div>

                {/* Token refresh notification */}
                {tokenStatus === "refreshing" && (
                    <div
                        className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md"
                        role="alert"
                    >
                        <p className="font-bold">Token refresh in progress...</p>
                        <p>Last attempt : {lastRefresh}</p>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Unread messages</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.messagesCount}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.messagesCount > 0
                                    ? `${Math.min(stats.messagesCount, 5)} new since your last visit`
                                    : "No new messages"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                            <Bell className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.notificationsCount}</div>
                            <p className="text-xs text-muted-foreground">Need your attention</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Last connection</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-md font-bold">{stats.lastConnection}</div>
                            <p className="text-xs text-muted-foreground">
                                Active conversations: {stats.activitiesCount}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Token status</CardTitle>
                            <RefreshCw
                                className={`h-4 w-4 ${tokenStatus === "refreshing" ? "animate-spin text-amber-500" : "text-green-500"}`}
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="text-md font-bold capitalize">
                                {tokenStatus === "valid" ? "Valid" : "Refreshing"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Last refresh: {lastRefresh || "N/A"}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Carte d'aperçu des audits */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">
                                Activités récentes
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <Link href="/audit" className="hover:underline">
                                    Audit Log
                                </Link>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Suivez et analysez toutes les activités système
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recent Messages */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle className="text-xl">Recent messages</CardTitle>
                            <CardDescription>Your recent conversations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentConversations.length > 0 ? (
                                    recentConversations.map(conversation => (
                                        <div
                                            key={conversation.id}
                                            className="flex items-start space-x-4"
                                        >
                                            <div className="bg-primary/10 rounded-full p-2">
                                                <MessageSquare className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {conversation.is_group
                                                        ? conversation.title || "Group conversation"
                                                        : `Conversation with ${conversation.participants
                                                              .filter(p => p.id !== user?.id)
                                                              .map(p => p.username || p.id)
                                                              .join(", ")}`}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {conversation.last_message?.content ||
                                                        "No messages yet"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {conversation.last_message_at
                                                        ? formatRelativeTime(
                                                              new Date(conversation.last_message_at)
                                                          )
                                                        : "Never"}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <p>No recent conversations</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            asChild
                                        >
                                            <Link href="/messages/new">Start a conversation</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/messages">See all messages</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Detailed Stats */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle className="text-xl">System activity</CardTitle>
                            <CardDescription>Information about the system state</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <div className="flex items-center">
                                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span>System performance</span>
                                    </div>
                                    <span className="font-medium">Excellent</span>
                                </div>
                                <Progress value={92} className="h-2" />
                                <p className="text-xs text-muted-foreground">
                                    The system is operating at 92% of its optimal capacity.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <div className="flex items-center">
                                        <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span>WebSocket connection status</span>
                                    </div>
                                    <span
                                        className={`font-medium ${websocketStatus === "connected" ? "text-green-500" : "text-amber-500"}`}
                                    >
                                        {websocketStatus === "connected"
                                            ? "Connected"
                                            : "Connecting..."}
                                    </span>
                                </div>
                                <Progress
                                    value={websocketStatus === "connected" ? 100 : 60}
                                    className="h-2"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Message deduplication system is active and functional.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Recent system log</p>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p>
                                        ● WebSocket service {websocketStatus} at {timeStamp}
                                    </p>
                                    <p>
                                        ● User: {user?.username || "Anonymous"} (ID:{" "}
                                        {user?.id || "Not logged in"})
                                    </p>
                                    <p>
                                        ● User session active since:{" "}
                                        {formatSessionDuration(stats.currentSessionDuration)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/system-status">Check system status</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
