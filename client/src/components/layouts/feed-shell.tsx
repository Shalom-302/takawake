"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import FeedSidebar, { type FeedView } from "@/components/sections/feed/feed-sidebar";

interface FeedShellProps {
    /** Vue active mise en évidence dans la sidebar (null = aucune, ex. page article). */
    view: FeedView | null;
    /** Sélection d'une vue : pilote l'état du feed, ou navigue vers l'accueil. */
    onViewChange: (v: FeedView) => void;
    /** Contenu de la zone principale (colonnes feed/panneau, ou page article). */
    children: ReactNode;
}

/**
 * Coquille commune du feed : sidebar gauche (desktop) + barre & drawer mobiles,
 * avec une zone principale libre. Partagée par la page d'accueil (« À la Une »)
 * et la page article complète, pour une continuité visuelle totale.
 */
export default function FeedShell({ view, onViewChange, children }: FeedShellProps) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    function handleViewChange(v: FeedView) {
        setMobileNavOpen(false);
        onViewChange(v);
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-white lg:flex-row">
            {/* Barre mobile (logo + menu) */}
            <div className="flex shrink-0 items-center justify-between border-b border-black/[0.06] px-4 py-3 lg:hidden">
                <button
                    type="button"
                    aria-label="Ouvrir le menu"
                    onClick={() => setMobileNavOpen(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-(--black-tekawake-500) transition-colors hover:bg-black/[0.04]"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <Link href="/" className="relative block h-6 w-28">
                    <Image src="/logo.png" alt="TEKAWAKE" fill className="object-contain" />
                </Link>
                <span className="h-9 w-9" aria-hidden />
            </div>

            {/* Colonne 1 — sidebar (desktop) */}
            <div className="hidden h-full w-[264px] shrink-0 overflow-y-auto border-r border-black/[0.06] lg:block">
                <FeedSidebar view={view} onViewChange={handleViewChange} />
            </div>

            {/* Zone principale */}
            {children}

            {/* Drawer mobile : la sidebar complète */}
            <AnimatePresence>
                {mobileNavOpen && (
                    <>
                        <motion.div
                            key="drawer-overlay"
                            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setMobileNavOpen(false)}
                        />
                        <motion.div
                            key="drawer-panel"
                            className="fixed inset-y-0 left-0 z-50 w-[284px] max-w-[85%] overflow-y-auto bg-white shadow-2xl lg:hidden"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "tween", duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                        >
                            <button
                                type="button"
                                aria-label="Fermer le menu"
                                onClick={() => setMobileNavOpen(false)}
                                className="absolute right-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-(--black-tekawake-200) transition-colors hover:bg-black/[0.05]"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <FeedSidebar view={view} onViewChange={handleViewChange} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
