"use client";

import { ReactNode } from "react";
import Navbar from "@/components/layouts/navbar";
import Footer from "@/components/layouts/footer";
import CookieManager from "@/components/cookie/cookie-manager";
import Link from "next/link";
import Image from "next/image";

interface MainLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: MainLayoutProps) {
    return (
        <div className="min-h-screen">
            <div className="h-screen bg-white z-10 flex flex-col justify-between fixed top-0 left-0 w-[300px] border-r border-black/10 ">
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
                            <ul className="mt-2">
                                {[
                                    { id: "aa", label: "Tableau de bord" },
                                    { id: "bb", label: "Veilles" },
                                    { id: "bb", label: "Clusters générés" },
                                    { id: "cc", label: "Articles" },
                                ]?.map((item: any) => (
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
                        <section>
                            <span className="block text-xs opacity-60 font-medium">
                                {"Plateforme"}
                            </span>
                            <ul className="mt-2">
                                {[{ id: "aa", label: "Utilisateurs" }]?.map((item: any) => (
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
            <main className="">{children}</main>
        </div>
    );
}
