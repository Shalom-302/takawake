"use client";

import Link from "next/link";
import Image from "next/image";
import {
    Sparkles,
    CalendarCheck,
    History,
    CalendarRange,
    Flame,
    Radio,
    Search,
    PanelLeftClose,
    Sun,
    Languages,
    Globe,
    MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/contexts/auth-context";

export type FeedView = "foryou" | "today" | "yesterday" | "week" | "trending" | "live";

const GROUPS: {
    title: string;
    items: { key: FeedView; label: string; icon: React.ElementType; accent: string }[];
}[] = [
    {
        title: "Tekawake",
        items: [{ key: "foryou", label: "Pour vous", icon: Sparkles, accent: "text-(--blue-tekawake-500)" }],
    },
    {
        title: "À la Une",
        items: [
            { key: "today", label: "Aujourd'hui", icon: CalendarCheck, accent: "text-(--purple-dreams-500)" },
            { key: "yesterday", label: "Hier", icon: History, accent: "text-(--purple-dreams-500)" },
            { key: "week", label: "Cette semaine", icon: CalendarRange, accent: "text-(--purple-dreams-500)" },
        ],
    },
    {
        title: "Explorer",
        items: [
            { key: "trending", label: "Tendances", icon: Flame, accent: "text-amber-500" },
            { key: "live", label: "En direct", icon: Radio, accent: "text-amber-500" },
        ],
    },
];

const UTILITIES: { label: string; icon: React.ElementType }[] = [
    { label: "Thème", icon: Sun },
    { label: "Langue", icon: Languages },
    { label: "Pays", icon: Globe },
];

interface FeedSidebarProps {
    // null = aucune vue active surlignée (ex. page article réutilisant la sidebar).
    view: FeedView | null;
    onViewChange: (v: FeedView) => void;
    onSearch?: (term: string) => void;
}

export default function FeedSidebar({ view, onViewChange, onSearch }: FeedSidebarProps) {
    const { user, isAuthenticated, logout } = useAuth();
    const email = user?.email ?? "";
    const initial = (email || "T").charAt(0).toUpperCase();

    return (
        <aside className="flex h-full flex-col px-4 py-5">
            {/* Logo + collapse */}
            <div className="flex items-center justify-between px-1">
                <Link href="/" className="relative block h-7 w-32">
                    <Image src="/logo.png" alt="TEKAWAKE" fill className="object-contain object-left" />
                </Link>
                <button
                    type="button"
                    aria-label="Réduire le menu"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-(--black-tekawake-200) transition-colors hover:bg-black/[0.04]"
                >
                    <PanelLeftClose className="h-[18px] w-[18px]" />
                </button>
            </div>

            {/* Search */}
            <form
                onSubmit={e => {
                    e.preventDefault();
                    const v = (e.currentTarget.elements.namedItem("nav") as HTMLInputElement)?.value;
                    onSearch?.(v ?? "");
                }}
                className="mt-6 flex h-10 items-center gap-2 rounded-xl border border-black/[0.07] bg-black/[0.02] px-3"
            >
                <Search className="h-4 w-4 shrink-0 text-(--black-tekawake-200)" />
                <input
                    name="nav"
                    placeholder="Naviguer…"
                    className="w-full bg-transparent text-sm font-medium text-(--black-tekawake-500) outline-none placeholder:text-(--black-tekawake-200)"
                />
                <kbd className="hidden shrink-0 rounded-md border border-black/[0.08] bg-white px-1.5 py-0.5 text-[11px] font-medium text-(--black-tekawake-200) sm:block">
                    ⌘K
                </kbd>
            </form>

            {/* Nav groups */}
            <nav className="mt-7 flex flex-col gap-6">
                {GROUPS.map(group => (
                    <div key={group.title} className="flex flex-col gap-0.5">
                        <span className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wide text-(--black-tekawake-200)">
                            {group.title}
                        </span>
                        {group.items.map(item => {
                            const Icon = item.icon;
                            const active = view === item.key;
                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => onViewChange(item.key)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-left text-[15px] font-medium transition-colors",
                                        active
                                            ? "bg-(--blue-tekawake-50) font-semibold text-(--blue-tekawake-800)"
                                            : "text-(--black-tekawake-500)/80 hover:bg-black/[0.03]",
                                    )}
                                >
                                    <Icon className={cn("h-[18px] w-[18px] shrink-0", item.accent)} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Utilities */}
            <div className="mt-7 flex flex-col gap-0.5 border-t border-black/[0.06] pt-5">
                {UTILITIES.map(item => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.label}
                            type="button"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-[15px] font-medium text-(--black-tekawake-500)/80 transition-colors hover:bg-black/[0.03]"
                        >
                            <Icon className="h-[18px] w-[18px] shrink-0 text-(--black-tekawake-200)" />
                            {item.label}
                        </button>
                    );
                })}
            </div>

            {/* Profile / auth */}
            <div className="mt-auto pt-5">
                {isAuthenticated ? (
                    <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-black/[0.03]">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-(--purple-dreams-500) to-(--blue-tekawake-500) text-sm font-semibold text-white">
                            {initial}
                        </span>
                        <div className="min-w-0 flex-1">
                            <Link href="/account" className="block text-sm font-semibold text-(--black-tekawake-500)">
                                Mon compte
                            </Link>
                            <p className="truncate text-xs text-(--black-tekawake-200)">{email}</p>
                        </div>
                        <button
                            type="button"
                            aria-label="Options du compte"
                            onClick={() => logout()}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-(--black-tekawake-200) transition-colors hover:bg-black/[0.05]"
                        >
                            <MoreVertical className="h-[18px] w-[18px]" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/auth/login"
                            className="flex h-10 items-center justify-center rounded-xl bg-(--black-tekawake-500) text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        >
                            Connexion
                        </Link>
                        <Link
                            href="/auth/register"
                            className="flex h-10 items-center justify-center rounded-xl border border-black/[0.08] text-sm font-semibold text-(--black-tekawake-500) transition-colors hover:bg-black/[0.03]"
                        >
                            Inscription
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    );
}
