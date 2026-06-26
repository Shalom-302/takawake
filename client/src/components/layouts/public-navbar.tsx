"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useAuth } from "@/lib/contexts/auth-context";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS: { label: string; href: string; hasDropdown?: boolean }[] = [
    { label: "À la Une", href: "/", hasDropdown: true },
    { label: "Explorer", href: "/articles", hasDropdown: true },
    { label: "Pour vous", href: "/articles" },
];

export default function PublicNavbar() {
    const pathname = usePathname();
    const { isAuthenticated, logout } = useAuth();

    return (
        <header className="relative z-30 w-full">
            <div className="mx-auto flex h-[72px] max-w-[1480px] items-center justify-between px-6 lg:px-10">
                {/* Logo */}
                <Link href="/" className="flex shrink-0 items-center gap-2">
                    <span className="relative block h-7 w-32 sm:w-36">
                        <Image src="/logo.png" alt="TEKAWAKE" fill className="object-contain object-left" />
                    </span>
                </Link>

                {/* Center nav */}
                <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
                    {NAV_ITEMS.map(item => {
                        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-1 rounded-lg px-4 py-2 text-[15px] font-medium text-(--black-tekawake-500) transition-colors hover:bg-black/[0.04]",
                                    active && "bg-black/[0.05]",
                                )}
                            >
                                {item.label}
                                {item.hasDropdown && (
                                    <ChevronDown className="h-4 w-4 text-(--black-tekawake-200)" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                        <>
                            <Button variant="tertiary" size="md" asChild className="hidden sm:inline-flex">
                                <Link href="/account">Mon compte</Link>
                            </Button>
                            <Button variant="secondary" size="md" onClick={() => logout()}>
                                Se déconnecter
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="tertiary" size="md" asChild className="hidden sm:inline-flex">
                                <Link href="/auth/register">Inscription</Link>
                            </Button>
                            <Button variant="secondary" size="md" asChild>
                                <Link href="/auth/login">Connexion</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
