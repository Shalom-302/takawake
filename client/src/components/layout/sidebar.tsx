"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Files,
    Settings,
    Bell,
    User,
    Activity,
    Bookmark,
    ChevronLeft,
    ChevronRight,
    Menu,
    Folder,
    TestTube,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/buttons/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badges/badge";
import { useMessaging } from "@/lib/contexts/messaging-context";

interface SidebarProps {
    className?: string;
    onToggle?: (isExpanded: boolean) => void;
    initialExpanded?: boolean;
}

export function Sidebar({ className, onToggle, initialExpanded = true }: SidebarProps) {
    const pathname = usePathname();
    const [expanded, setExpanded] = useState(initialExpanded);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { conversations } = useMessaging();

    // Calculer le nombre total de messages non lus
    const unreadMessagesCount = conversations.reduce(
        (total, conversation) => total + (conversation.unread_count || 0),
        0
    );

    // Synchroniser avec initialExpanded si celui-ci change
    useEffect(() => {
        setExpanded(initialExpanded);
    }, [initialExpanded]);

    const toggleSidebar = () => {
        const newExpanded = !expanded;
        setExpanded(newExpanded);
        // Notifier le composant parent du changement
        if (onToggle) {
            onToggle(newExpanded);
        }
    };

    const toggleMobileSidebar = () => {
        setMobileOpen(!mobileOpen);
    };

    const navItems = [
        {
            name: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
        },
        // {
        //   name: 'Messages',
        //   href: '/messages',
        //   icon: MessageSquare
        // },
        {
            name: "Notifications",
            href: "/notifications",
            icon: Bell,
        },
        {
            name: "Documents",
            href: "/documents",
            icon: Files,
        },
        {
            name: "Files",
            href: "/files",
            icon: Folder,
        },
        {
            name: "Audit",
            href: "/audit",
            icon: Activity,
        },
        {
            name: "Settings",
            href: "/settings",
            icon: Settings,
        },
        {
            name: "Tests",
            href: "/tests",
            icon: TestTube,
        },
    ];

    return (
        <>
            {/* Mobile toggle button */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden fixed left-4 top-4 z-50"
                onClick={toggleMobileSidebar}
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen border-r bg-background transition-all duration-300",
                    expanded ? "w-64" : "w-20",
                    mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                    className
                )}
            >
                <div className="flex h-full flex-col py-4">
                    {/* Header and toggle */}
                    <div
                        className={cn(
                            "flex items-center justify-between px-4 py-2 mb-6",
                            !expanded && "justify-center"
                        )}
                    >
                        {expanded && (
                            <Link href="/" className="text-xl font-bold">
                                Kaapi
                            </Link>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="hidden md:flex"
                        >
                            {expanded ? (
                                <ChevronLeft className="h-5 w-5" />
                            ) : (
                                <ChevronRight className="h-5 w-5" />
                            )}
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-3">
                        <TooltipProvider>
                            {navItems.map(item => {
                                const isActive = pathname === item.href;
                                const isMessages = item.name === "Messages";
                                const showBadge = isMessages && unreadMessagesCount > 0;

                                return (
                                    <Tooltip key={item.href} delayDuration={expanded ? 999999 : 0}>
                                        <TooltipTrigger asChild>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors relative",
                                                    isActive
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                                    !expanded && "justify-center"
                                                )}
                                            >
                                                <item.icon
                                                    className={cn("h-5 w-5", expanded && "mr-3")}
                                                />
                                                {expanded && <span>{item.name}</span>}

                                                {/* Badge pour les messages non lus */}
                                                {showBadge && (
                                                    <Badge
                                                        variant="default"
                                                        className={cn(
                                                            "ml-auto flex h-5 w-5 items-center justify-center p-0 text-xs",
                                                            !expanded &&
                                                                "absolute -top-1 -right-1 h-4 w-4 text-[10px]"
                                                        )}
                                                    >
                                                        {unreadMessagesCount}
                                                    </Badge>
                                                )}
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side="right"
                                            className={cn(expanded && "hidden")}
                                        >
                                            {item.name}
                                            {isMessages &&
                                                unreadMessagesCount > 0 &&
                                                ` (${unreadMessagesCount})`}
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </TooltipProvider>
                    </nav>

                    {/* Footer info */}
                    {expanded && (
                        <div className="mt-auto px-4 py-2 text-xs text-muted-foreground">
                            <p> {new Date().getFullYear()} Kaapi</p>
                            <p>Version 1.0.0</p>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
