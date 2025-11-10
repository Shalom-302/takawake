import React, { useState } from "react";
import { Bell, User, Menu, MessageSquare, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar/avatar";
import { DropdownMenuCustom as DropdownMenu } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge/badge";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMessaging } from "@/lib/contexts/messaging-context";

interface Notification {
    id: string;
    title: string;
    message: string;
    read: boolean;
    timestamp: string;
}

interface AppHeaderProps {
    user: any;
    onLogout: () => void;
}

export function AppHeader({ user, onLogout }: AppHeaderProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { conversations } = useMessaging();

    // Calculer le nombre total de messages non lus
    const unreadMessagesCount = conversations.reduce(
        (total, conversation) => total + (conversation.unread_count || 0),
        0
    );

    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: "1",
            title: "Nouveau message",
            message: "Vous avez reçu un nouveau message de Jean",
            read: false,
            timestamp: "2 min",
        },
        {
            id: "2",
            title: "Rappel",
            message: "Réunion prévue dans 30 minutes",
            read: false,
            timestamp: "15 min",
        },
        {
            id: "3",
            title: "Mise à jour",
            message: "L'application a été mise à jour vers la version 2.0",
            read: true,
            timestamp: "2h",
        },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n => (n.id === id ? { ...n, read: true } : n)));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <header className="w-full px-[24px] border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-8 flex">
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/dashboard"
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"
                            )}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/messages"
                            className={cn(
                                "transition-colors hover:text-foreground/80 relative",
                                pathname === "/messages" ? "text-foreground" : "text-foreground/60"
                            )}
                        >
                            Messages
                            {unreadMessagesCount > 0 && (
                                <Badge
                                    variant="color"
                                    className="absolute -top-2 -right-4 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                                >
                                    {unreadMessagesCount}
                                </Badge>
                            )}
                        </Link>
                        <Link
                            href="/settings"
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                pathname === "/settings" ? "text-foreground" : "text-foreground/60"
                            )}
                        >
                            Settings
                        </Link>
                    </nav>
                </div>
                <div className="flex-1"></div>
                <div className="flex items-center gap-2">
                    {/* Messages */}
                    <Link href="/messages">
                        <Button className="relative mr-1 md:hidden">
                            <MessageSquare className="h-4 w-4" />
                            {unreadMessagesCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                                    {unreadMessagesCount}
                                </Badge>
                            )}
                        </Button>
                    </Link>

                    {/* Notifications */}
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <Button className="relative">
                                <Bell className="h-4 w-4" />
                                {unreadCount > 0 && (
                                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end" className="w-80">
                            <DropdownMenu.Label className="flex items-center justify-between">
                                Notifications
                                {unreadCount > 0 && (
                                    <Button
                                        size="sm"
                                        onClick={markAllAsRead}
                                        className="text-xs h-7"
                                    >
                                        Mark all as read
                                    </Button>
                                )}
                            </DropdownMenu.Label>
                            <DropdownMenu.Separator />
                            {notifications.length === 0 ? (
                                <div className="py-4 text-center text-muted-foreground">
                                    No notifications
                                </div>
                            ) : (
                                <div className="max-h-[300px] overflow-y-auto">
                                    {notifications.map(notification => (
                                        <DropdownMenu.Item
                                            key={notification.id}
                                            className={cn(
                                                "flex flex-col items-start p-3 cursor-pointer",
                                                !notification.read && "bg-muted/50"
                                            )}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span className="font-medium">
                                                    {notification.title}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {notification.timestamp}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {notification.message}
                                            </p>
                                        </DropdownMenu.Item>
                                    ))}
                                </div>
                            )}
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>

                    {/* User menu */}
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <Button className="rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={user?.avatar || ""}
                                        alt={user?.name || "User"}
                                    />
                                    <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end">
                            <DropdownMenu.Label>My account</DropdownMenu.Label>
                            <DropdownMenu.Separator />
                            <DropdownMenu.Item asChild>
                                <Link href="/profile" className="cursor-pointer flex w-full">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item asChild>
                                <Link href="/settings" className="cursor-pointer flex w-full">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator />
                            <DropdownMenu.Item onClick={onLogout} className="cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>

                    {/* Mobile menu */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button className="md:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col space-y-4 mt-6">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/messages"
                                    className="flex items-center py-2 relative"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Messages
                                    {unreadMessagesCount > 0 && (
                                        <Badge
                                            variant="modern"
                                            className="ml-auto h-4 px-1 text-[10px]"
                                        >
                                            {unreadMessagesCount}
                                        </Badge>
                                    )}
                                </Link>
                                <Link
                                    href="/settings"
                                    className="flex items-center py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Settings
                                </Link>
                                <Button variant="secondary" onClick={onLogout} className="mt-6">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </Button>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
