/**
 * Admin Layout Component
 *
 * Provides a consistent layout structure for all admin pages with
 * header, sidebar navigation, and content area.
 */
"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
    LayoutDashboard,
    Users,
    Settings,
    FileText,
    BarChart3,
    Bell,
    MessagesSquare,
    FolderOpen,
    Search,
    ChevronDown,
    LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { signOut } from "next-auth/react";

interface AdminLayoutProps {
    children: ReactNode;
    title: string;
    description?: string;
}

const navigationItems = [
    {
        title: "Général",
        items: [
            {
                title: "Tableau de bord",
                href: "/admin",
                icon: LayoutDashboard,
            },
            {
                title: "Utilisateurs",
                href: "/admin/users",
                icon: Users,
            },
            {
                title: "Fichiers",
                href: "/admin/files",
                icon: FolderOpen,
            },
            {
                title: "Analyses",
                href: "/admin/analytics",
                icon: BarChart3,
            },
        ],
    },
    {
        title: "Contenu",
        items: [
            {
                title: "Documents",
                href: "/admin/documents",
                icon: FileText,
            },
            {
                title: "Messages",
                href: "/admin/messages",
                icon: MessagesSquare,
            },
            {
                title: "Notifications",
                href: "/admin/notifications",
                icon: Bell,
            },
        ],
    },
    {
        title: "Système",
        items: [
            {
                title: "Paramètres",
                href: "/admin/settings",
                icon: Settings,
            },
        ],
    },
];

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
    const pathname = usePathname();

    // Utilisateur par défaut sans dépendre de useSession
    const user = {
        name: "Administrateur",
        email: "admin@example.com",
        image: "",
    };

    // Note: Dans un environnement réel, vous récupéreriez les données utilisateur
    // via un appel API ou un state global plutôt que directement avec useSession

    const userInitials = user.name
        ? user.name
              .split(" ")
              .map(n => n[0])
              .join("")
        : "U";

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <div className="hidden border-r bg-muted/40 lg:block lg:w-64">
                <div className="flex h-full flex-col">
                    <div className="flex h-14 items-center border-b px-4">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <span className="text-primary font-bold text-xl">Kaapi</span>
                            <span className="text-muted-foreground text-sm">Admin</span>
                        </Link>
                    </div>

                    <ScrollArea className="flex-1 py-4">
                        <nav className="grid gap-2 px-2">
                            {navigationItems.map((section, i) => (
                                <div key={i} className="py-2">
                                    <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">
                                        {section.title}
                                    </h3>
                                    {section.items.map((item, j) => (
                                        <Link key={j} href={item.href} prefetch={false}>
                                            <span
                                                className={cn(
                                                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                                    pathname === item.href
                                                        ? "bg-accent text-accent-foreground"
                                                        : "transparent"
                                                )}
                                            >
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </span>
                                        </Link>
                                    ))}
                                    {i < navigationItems.length - 1 && (
                                        <Separator className="my-4" />
                                    )}
                                </div>
                            ))}
                        </nav>
                    </ScrollArea>

                    <div className="mt-auto p-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="w-full justify-start">
                                    <Avatar className="h-6 w-6 mr-2">
                                        <AvatarImage
                                            src={user.image || ""}
                                            alt={user.name || "User"}
                                        />
                                        <AvatarFallback>{userInitials}</AvatarFallback>
                                    </Avatar>
                                    <span className="truncate">{user.name}</span>
                                    <ChevronDown className="ml-auto h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile">Profil</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/admin/settings">Paramètres</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Déconnexion
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
                    <div className="hidden lg:block lg:w-64"></div>
                    <div className="w-full flex-1">
                        <form className="hidden lg:block">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Rechercher..."
                                    className="w-full appearance-none bg-background pl-8 shadow-none lg:w-[300px]"
                                />
                            </div>
                        </form>
                    </div>
                    <div className="flex items-center gap-2 lg:hidden">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <span className="text-primary font-bold">Kaapi</span>
                        </Link>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className="lg:hidden">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                                    <AvatarFallback>{userInitials}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/profile">Profil</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/admin/settings">Paramètres</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="text-destructive focus:text-destructive"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Déconnexion
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-4 lg:p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        {description && <p className="text-muted-foreground">{description}</p>}
                    </div>
                    {children}
                </main>
            </div>
        </div>
    );
}
