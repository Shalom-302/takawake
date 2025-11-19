"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button/button";
import { useAuth } from "@/lib/contexts/auth-context";
import { LinkButton } from "../ui/button";
import { Badge } from "../ui/badge";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { isAuthenticated, logout } = useAuth();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
    };

    const closeDropdown = () => {
        setIsDropdownOpen(false);
    };

    return (
        <>
            {/* Overlay */}
            <AnimatePresence>
                {isDropdownOpen && (
                    <motion.div
                        key="navbar-overlay"
                        className="fixed inset-0 z-40 bg-black/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closeDropdown}
                    />
                )}
            </AnimatePresence>

            <section className="bg-white fixed top-0 z-50 w-full">
                <div className="bg-white relative">
                    <div className="main-container py-5">
                        <div className="flex items-center justify-between gap-5">
                            <Link href={"/"}>
                                <div className="h-12 w-48 bg-black/10 relative shrink-0"></div>
                            </Link>
                            <ul className="flex items-center gap-2">
                                <li className="relative">
                                    <button
                                        type="button"
                                        onClick={toggleDropdown}
                                        className="py-2 px-4 cursor-pointer flex items-center gap-2 relative"
                                    >
                                        <span className="font-medium text-sm">{"S'éveiller"}</span>
                                        <div className="h-6 w-6 shrink-0 bg-black/5"></div>
                                    </button>
                                </li>
                                <li>
                                    <div className="py-2 px-4 cursor-pointer relative">
                                        <span className="font-medium text-sm">{"Vidéos"}</span>
                                    </div>
                                </li>
                                <li>
                                    <div className="py-2 px-4 cursor-pointer relative">
                                        <span className="font-medium text-sm">{"Le Média"}</span>
                                    </div>
                                </li>
                                <li>
                                    <div className="py-2 px-4 cursor-pointer relative space-x-2 flex items-center">
                                        <span className="font-medium text-sm">{"Apprendre"}</span>
                                        <div className="pb-4">
                                            <Badge variant="pill-color" size={"sm"}>
                                                Bientôt
                                            </Badge>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <div className="flex items-center gap-7">
                                <div className="border border-black/30 rounded-full shrink-0 h-11 px-4 cursor-pointer flex items-center gap-4">
                                    <div className="h-6 w-6 shrink-0 bg-black/5"></div>
                                    <span className="text-sm opacity-60">{"Rechercher"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* <Button variant="secondary">Button secondary</Button> */}
                                    <Button size={"md"} variant="tertiary" asChild>
                                        <Link href={"#"}>{"Se connecter"}</Link>
                                    </Button>
                                    <Button size={"md"} variant="secondary" asChild>
                                        <Link href={"#"}>{"S'inscrire"}</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dropdown */}
            <AnimatePresence mode="wait">
                {isDropdownOpen && (
                    <motion.div
                        key="navbar-dropdown"
                        initial={{ opacity: 0, y: -12, scaleY: 1 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -10, scaleY: 1 }}
                        transition={{
                            duration: 0.25,
                            ease: [0.23, 1, 0.32, 1],
                        }}
                        style={{ originY: 0 }}
                        className="fixed left-0 pt-[100px] w-full z-40 bg-white shadow-xl overflow-hidden"
                    >
                        <div className="main-container py-5">
                            <div className="grid grid-cols-3 gap-x-10">
                                {Array.from({ length: 14 }).map((_, i) => (
                                    <Link href={`/topic/one/robotique-ia`} key={i}>
                                        <div className="flex items-center p-4 rounded-md justify-between gap-4 cursor-pointer sm:hover:bg-black/5">
                                            <div className="flex items-center gap-2 truncate">
                                                <div className="h-12 w-12 shrink-0 bg-black/5"></div>
                                                <span className="font-medium block truncate w-full text-sm">
                                                    {
                                                        "Mariam joue à la balle tous les jours de la semaine devant la maison de son père"
                                                    }
                                                </span>
                                            </div>
                                            <div className="h-6 w-6 flex items-center justify-center shrink-0 bg-black/10 "></div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
