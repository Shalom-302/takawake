"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button/button";
import { useAuth } from "@/lib/contexts/auth-context";
import { LinkButton } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowNarrowRightIcon, ChevronDownIcon, SearchMdIcon } from "../icons";
import { cn } from "@/lib/utils/cn";
import { Slideout } from "../ui/slideout-menu";

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
                        <div className="flex items-center lg:justify-between gap-4 sm:gap-5">
                            <div className="flex lg:hidden shrink-0 w-9 h-9 bg-black" onClick={toggleMenu}></div>
                            <Link href={"/"}>
                                <div className="h-8 md:h-10 w-32 sm:w-36 md:w-40 relative shrink-0">
                                    <Image
                                        src={"/logo.png"}
                                        fill
                                        alt="logo TEKAWAKE"
                                        className="object-contain"
                                    />
                                </div>
                            </Link>
                            <ul className="hidden lg:flex items-center gap-2">
                                <li className="relative">
                                    <button
                                        type="button"
                                        onClick={toggleDropdown}
                                        className="py-2 px-4 cursor-pointer flex items-center relative gap-1"
                                    >
                                        <span className="font-medium text-sm">{"S'éveiller"}</span>
                                        <div
                                            className={cn(
                                                "h-6 w-6 flex items-center justify-center shrink-0 transition-all duration-300",
                                                {
                                                    "rotate-180": isDropdownOpen,
                                                }
                                            )}
                                        >
                                            <ChevronDownIcon size={18} />
                                        </div>
                                    </button>
                                </li>
                                <li>
                                    <div className="py-2 px-4 cursor-pointer relative">
                                        <span className="font-medium text-sm">{"Vidéos"}</span>
                                    </div>
                                </li>
                                <li>
                                    <div className="py-2 px-4 cursor-pointer relative">
                                        <span className="font-medium text-sm ">{"Le Média"}</span>
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
                            <div className="flex items-center justify-end md:gap-7 w-full lg:w-auto">
                                <div className="border border-black/50 rounded-full lg:shrink-0 h-10 px-3 cursor-pointer w-full lg:w-auto hidden md:flex items-center gap-2">
                                    <div className="h-6 w-6 shrink-0  flex items-center justify-center">
                                        <SearchMdIcon />{" "}
                                    </div>
                                    <span className="text-sm font-medium opacity-60">
                                        {"Rechercher"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="md:hidden block">
                                        <Button
                                            variant="tertiary"
                                            size={"md"}
                                            leftIcon={
                                                <div className="">
                                                    <SearchMdIcon />
                                                </div>
                                            }
                                        />
                                    </div>
                                    <Button
                                        size={"md"}
                                        variant="tertiary"
                                        asChild
                                        className="hidden md:block"
                                    >
                                        <Link href={"#"} className="block">
                                            {"S'inscrire"}
                                        </Link>
                                    </Button>
                                    <Button size={"md"} variant="secondary" asChild>
                                        <Link href={"#"} className="block">
                                            {"Connexion"}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dropdown plein écran (rideau) */}
            <AnimatePresence mode="wait">
                {isDropdownOpen && (
                    <motion.div
                        key="navbar-dropdown"
                        initial={{ opacity: 0, y: -16, scaleY: 0 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -12, scaleY: 0 }}
                        transition={{
                            duration: 0.5,
                            ease: [0.23, 1, 0.32, 1],
                        }}
                        style={{ originY: 0 }}
                        className="fixed left-0 top-0 w-full z-40 bg-white overflow-hidden pt-20 md:pt-[88px]"
                    >
                        <div className="main-container py-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-4">
                                {Array.from({ length: 14 }).map((_, i) => (
                                    <Link href={`/topic/one/robotique-ia`} key={i}>
                                        <div className="flex items-center p-4 rounded-md justify-between gap-4 cursor-pointer sm:hover:bg-black/5">
                                            <div className="flex items-center gap-2 truncate">
                                                <div className="h-12 w-12 shrink-0 bg-black/5"></div>
                                                <span className="font-medium block truncate w-full text-sm text-(--black-tekawake-200)">
                                                    {
                                                        "Mariam joue à la balle tous les jours de la semaine devant la maison de son père"
                                                    }
                                                </span>
                                            </div>
                                            <div className="h-6 w-6 flex items-center justify-center shrink-0 text-(--black-tekawake-200) ">
                                                <ArrowNarrowRightIcon size={20} />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* drawer */}
            <Slideout
                open={isMenuOpen}
                onOpenChange={setIsMenuOpen}
                title="Slideout Title"
                description="This is a basic slideout menu with a title and description."
                content={
                    <div className="space-y-4 flex-1">
                        <p className="text-primary">
                            This is the main content area of the slideout. You can put any content
                            here.
                        </p>
                        <p className="text-primary">
                            The slideout slides in from the right side of the screen and includes a
                            backdrop overlay.
                        </p>
                    </div>
                }
                footer={
                    <div className="flex gap-3 justify-end">
                        <Button onClick={() => setIsMenuOpen(false)} variant={"secondary"}>
                            Cancel
                        </Button>
                        <Button>Save Changes</Button>
                    </div>
                }
            />
        </>
    );
}
