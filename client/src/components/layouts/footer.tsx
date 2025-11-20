"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const footerLinks = [
    {
        title: "Nos réseaux sociaux",
        links: [
            { name: "Instagram", href: "#" },
            { name: "Youtube", href: "#" },
            { name: "Facebook", href: "#" },
            { name: "LinkedId", href: "#" },
            { name: "X (Twitter)", href: "#" },
        ],
    },
    {
        title: "Infos légales",
        links: [
            { name: "Données personnelles", href: "#" },
            { name: "Mentions légales et crédits", href: "#" },
            { name: "CGU", href: "#" },
        ],
    },
    {
        title: "Changer de langue",
        links: [{ name: "...", href: "#" }],
    },
];

const footerCategories = [
    {
        id: "1",
        links: [
            { name: "Cybersécurité", href: "#" },
            { name: "Intéligence artificielle", href: "#" },
            { name: "Conscience numérique", href: "#" },
            { name: "Blockchain", href: "#" },
            { name: "Données", href: "#" },
        ],
    },
    {
        id: "2",
        links: [
            { name: "Robotique", href: "#" },
            { name: "HealthTech", href: "#" },
            { name: "Fintech", href: "#" },
            { name: "Startups", href: "#" },
        ],
    },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <>
            <section className="bg-black">
                <div className="main-container text-white pt-20 sm:pt-28 pb-10 md:pb-28 ">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 md:gap-20 lg:gap-6">
                        <div className="lg:col-span-3">
                            <div className="bg-white/10 border border-white/20 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg p-8">
                                <div>
                                    <span className="block font-bold text-xl">{"Newsletter"}</span>
                                    <p className="mt-4 text-sm leading-[150%] max-w-md opacity-60">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                        Curabitur imperdiet tellus odio, non ullamcorper nibh
                                        aliquet auctor augue
                                    </p>
                                </div>
                                <div>
                                    ...
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <h3 className="font-semibold first-letter:capitalize text-sm">
                                {"Séveiller sur un sujet"}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {/* Footer links */}
                                {footerCategories.map(group => (
                                    <div key={group.id}>
                                        <ul className="mt-4 space-y-3">
                                            {group.links.map(link => (
                                                <li key={link.name}>
                                                    <Link
                                                        href={link.href}
                                                        className="text-sm  opacity-60"
                                                    >
                                                        {link.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="main-container text-white pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        {/* Logo and description */}
                        <div className="md:col-span-2">
                            <Link href={"/"}>
                                <div className="h-8 md:h-10 w-32 sm:w-36 md:w-40 relative shrink-0">
                                    <Image
                                        src={"/logo_white.png"}
                                        fill
                                        alt="logo TEKAWAKE"
                                        className="object-contain"
                                    />
                                </div>
                            </Link>
                            <p className="mt-4 text-sm max-w-md">
                                Média d’éveil sur la tech en Afrique
                            </p>
                            <div className="mt-6 flex space-x-4">
                                <p className="mt-4 text-sm max-w-md">Backed by Kaanari</p>
                            </div>
                        </div>

                        {/* Footer links */}
                        {footerLinks.map(group => (
                            <div key={group.title}>
                                <h3 className="font-semibold first-letter:capitalize text-sm">
                                    {group.title}
                                </h3>
                                <ul className="mt-4 space-y-3">
                                    {group.links.map(link => (
                                        <li key={link.name}>
                                            <Link href={link.href} className="text-sm  opacity-60">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="py-5 border-t border-white/10">
                    <p className="text-center text-xs text-white">
                        &copy; TEKAWAKE {currentYear} &nbsp; Inc. All rights reserved.
                    </p>
                </div>
            </section>
        </>
    );
}
