"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { BookmarkIcon, EyeIcon, FileTwoIcon, HomeLineIcon, StarSixIcon } from "../icons";

interface MainLayoutProps {
    children: ReactNode;
}


const navigationItems = [
    { id: "aa", icon:<><HomeLineIcon size={22} /></>, label: "Tableau de bord", href: "/dashboard" },
    { id: "bb", icon:<><EyeIcon size={22} /></>, label: "Veilles", href: "/dashboard/tech-monitoring" },
    { id: "dd", icon:<><StarSixIcon size={22} /></>, label: "Sujets générés", href: "/dashboard/topics" },
    { id: "cc", icon:<><FileTwoIcon size={22} /></>, label: "Articles", href: "/dashboard/scraping-articles" },
    { id: "ff", icon:<><BookmarkIcon size={22} /></>, label: "Categories", href: "/dashboard/categories" },
];

export default function AdminLayout({ children }: MainLayoutProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Ferme le drawer à chaque changement de page (navigation mobile).
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const isActive = (href: string) => {
        if (!pathname) return false;

        const normalize = (path: string) =>
            path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;

        const current = normalize(pathname);
        const target = normalize(href);

        if (target === "/dashboard") {
            return current === target;
        }

        return current === target || current.startsWith(`${target}/`);
    };

    return (
        <div className="min-h-screen">
            {/* Barre supérieure (mobile uniquement) avec bouton menu */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-30 bg-white border-b border-black/10 flex items-center gap-3 px-4">
                <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Ouvrir le menu"
                    className="p-1 -ml-1"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <div className="h-7 w-28 relative">
                    <Image src="/logo.png" fill alt="logo TEKAWAKE" className="object-contain" />
                </div>
            </div>

            {/* Backdrop (mobile) quand le drawer est ouvert */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-30 bg-black/40"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div
                className={cn(
                    "h-screen bg-white z-40 flex flex-col justify-between fixed top-0 left-0 w-[300px] border-r border-black/10 transition-transform duration-200",
                    mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                )}
            >
                <div className="h-full overflow-auto px-4 py-5 ">
                    <Link href={"/dashboard"}>
                        <div className="h-8 w-32 relative shrink-0">
                            <Image
                                src={"/logo.png"}
                                fill
                                alt="logo TEKAWAKE"
                                className="object-contain"
                            />
                        </div>
                    </Link>
                    <div className="space-y-5 mt-6">
                        <section>
                            <span className="block text-xs opacity-60 font-medium">
                                {"Tekawake"}
                            </span>
                            <ul className="mt-2 space-y-1">
                                {navigationItems.map((item) => {
                                    const isCurrent = isActive(item.href);

                                    return (
                                        <li key={item.id}>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-4 p-2 rounded-md cursor-pointer",
                                                    isCurrent
                                                        ? "bg-black/5"
                                                        : "sm:hover:bg-black/5",
                                                )}
                                                aria-current={isCurrent ? "page" : undefined}
                                            >
                                                <div className="h-6 w-6 shrink-0">
                                                    {item?.icon}
                                                </div>
                                                <span className="block truncate text-sm font-medium">
                                                    {item.label}
                                                </span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                        <section>
                            <span className="block text-xs opacity-60 font-medium">
                                {"Plateforme"}
                            </span>
                            <ul className="mt-2">
                                {[{ id: "aa", label: "Utilisateurs" }]?.map((item: { id: string; label: string }) => (
                                    <li key={item?.id}>
                                        <div className="flex items-center gap-4 p-2 cursor-pointer sm:hover:bg-black/5 rounded-md">
                                            <div className="h-6 w-6 bg-black/10 shrink-0"></div>
                                            <span className="block truncate text-sm font-medium">
                                                {item?.label}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>
                <div className="px-4 pb-5 pt-3 border-t border-black/10 ">
                    <ul className="mb-2">
                        <li>
                            <div className="flex items-center gap-4 p-2 cursor-pointer sm:hover:bg-black/5 rounded-md">
                                <div className="h-6 w-6 bg-black/10 shrink-0"></div>
                                <span className="block truncate text-sm font-medium">
                                    {"Déconnexion"}
                                </span>
                            </div>
                        </li>
                    </ul>
                    <div className="border border-black/10 p-3 rounded-lg flex items-center justify-between gap-4">
                        <div className="h-10 w-10 bg-black/10  shrink-0 rounded-full"></div>
                        <div className="truncate w-full">
                            <span className="block truncate text-sm font-medium">
                                {"John Doe Sévérin"}
                            </span>
                            <span className="block truncate text-sm opacity-60">{"dodosev"}</span>
                        </div>
                    </div>
                </div>
            </div>
            <main className="pl-0 md:pl-[300px] pt-14 md:pt-0">{children}</main>
        </div>
    );
}
