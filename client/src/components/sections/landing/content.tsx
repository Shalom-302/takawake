"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { LinkButton } from "@/components/ui/button";

export default function ContentSection() {
    return (
        <>
            <section className="mt-16">
                <div className="main-container">
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2 bg-black/5 rounded-lg p-6">
                            <div className="border-l-3 pl-3 border-black flex items-center gap-4">
                                <span className="font-medium text-sm block shrink-0">
                                    {"Chroniques"}
                                </span>
                                <div className="h-0.5 w-full bg-black"></div>
                                <LinkButton href={"#"} variant="link-color" rightIcon={<>az</>}>
                                    <span>{"Voir plus"}</span>
                                </LinkButton>
                            </div>
                            <div className="grid grid-cols-12 w-full mt-6">
                                <div className="col-span-7 border-r-2 pr-4">
                                    <div className="h-[400px] bg-black/5 rounded-lg "></div>
                                    <div className="mt-6">
                                        <div className="w-full">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium inline-block text-sm">
                                                    {"DEEP LEARNING"}
                                                </span>
                                            </div>
                                            <span className="block line-clamp-2 font-bold text-xl">
                                                {
                                                    "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                                }
                                            </span>
                                            <p className=" line-clamp-2 text-sm mt-2">
                                                {
                                                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur imperdiet tellus odio, non ullamcorper nibh accumsan a. Cras ligula nibh, molestie tempor dolor eget, aliquet auctor augue"
                                                }
                                            </p>
                                            <div className="flex items-center gap-4 mt-4">
                                                <span className="font-medium inline-block text-sm">
                                                    {"Il y a 45 minutes"}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <div className="h-6 w-6 shrink-0 flex items-center justify-center bg-black/5"></div>
                                                    <span className="font-medium inline-block text-sm">
                                                        {"53"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="h-6 w-6 shrink-0 flex items-center justify-center bg-black/5"></div>
                                                    <span className="font-medium inline-block text-sm">
                                                        {"245"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="h-6 w-6 shrink-0 flex items-center justify-center bg-black/5"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-5 pl-4">
                                    <ul className="space-y-6">
                                        <li>
                                            <div className="gap-4">
                                                <div className="w-full">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium inline-block text-sm">
                                                            {"DEEP LEARNING"}
                                                        </span>
                                                    </div>
                                                    <p className="block line-clamp-2 font-bold text-md">
                                                        {
                                                            "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                                        }
                                                    </p>
                                                    <div>
                                                        <span className="font-medium inline-block text-xs opacity-60">
                                                            {"29 décembre 2026"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="gap-4">
                                                <div className="w-full">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium inline-block text-sm">
                                                            {"DEEP LEARNING"}
                                                        </span>
                                                    </div>
                                                    <p className="block line-clamp-2 font-bold text-md">
                                                        {
                                                            "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                                        }
                                                    </p>
                                                    <div>
                                                        <span className="font-medium inline-block text-xs opacity-60">
                                                            {"29 décembre 2026"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="gap-4">
                                                <div className="w-full">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium inline-block text-sm">
                                                            {"DEEP LEARNING"}
                                                        </span>
                                                    </div>
                                                    <p className="block line-clamp-2 font-bold text-md">
                                                        {
                                                            "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                                        }
                                                    </p>
                                                    <div>
                                                        <span className="font-medium inline-block text-xs opacity-60">
                                                            {"29 décembre 2026"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="gap-4">
                                                <div className="w-full">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium inline-block text-sm">
                                                            {"DEEP LEARNING"}
                                                        </span>
                                                    </div>
                                                    <p className="block line-clamp-2 font-bold text-md">
                                                        {
                                                            "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                                        }
                                                    </p>
                                                    <div>
                                                        <span className="font-medium inline-block text-xs opacity-60">
                                                            {"29 décembre 2026"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-1 bg-black/5 rounded-lg p-6">
                            <div className="border-l-3 pl-3 border-black flex items-center gap-4">
                                <span className="font-medium text-sm block shrink-0">
                                    {"Tribune"}
                                </span>
                                <div className="h-0.5 w-full bg-black"></div>
                            </div>
                            <ul className=" my-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <li key={i}>
                                        <div className="gap-4 flex items-center border-b py-4">
                                            <div className="h-24 w-24 shrink-0 bg-black/5 rounded-lg"></div>
                                            <div className="w-full">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium inline-block text-sm">
                                                        {"DEEP LEARNING"}
                                                    </span>
                                                    <span className="font-medium inline-block text-sm">
                                                        &bull;
                                                    </span>
                                                    <span className="font-medium inline-block text-sm">
                                                        {"9 déc. 2026"}
                                                    </span>
                                                </div>
                                                <p className="block line-clamp-2 font-bold text-md">
                                                    {
                                                        "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <LinkButton href={"#"} variant="link-color" rightIcon={<>az</>}>
                                <span>{"Voir plus"}</span>
                            </LinkButton>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-16">
                <div className="main-container">
                    <div className="border-l-3 pl-3 border-black flex items-center gap-4">
                        <span className="font-medium text-sm block shrink-0">
                            {"Les vidéos TEKAWAKE"}
                        </span>
                        <div className="h-0.5 w-full bg-black"></div>
                        <LinkButton href={"#"} variant="link-color" rightIcon={<>az</>}>
                            <span>{"Voir plus"}</span>
                        </LinkButton>
                    </div>
                    <div className="grid grid-cols-2 gap-6 g mt-6">
                        <div>
                            <div className="h-[400px] bg-black/5 rounded-lg relative flex items-center justify-center">
                                <div className="h-20 w-20 bg-black/5 rounded-full flex items-center justify-center">
                                    a
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="w-full">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="border-t-3 border-black inline-block pt-1 ">
                                            <span className="font-semibold text-sm">
                                                {"CYBERSÉCURITÉ"}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="block line-clamp-2 font-bold text-xl">
                                        {
                                            "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="h-[400px] bg-black/5 rounded-lg relative flex items-center justify-center">
                                <div className="h-20 w-20 bg-black/5 rounded-full flex items-center justify-center">
                                    a
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="w-full">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="border-t-3 border-black inline-block pt-1 ">
                                            <span className="font-semibold text-sm">
                                                {"CYBERSÉCURITÉ"}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="block line-clamp-2 font-bold text-xl">
                                        {
                                            "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 mt-12">
                        <div>
                            <div className="h-[400px] bg-black/5 rounded-lg relative flex flex-col justify-end p-5">
                                <div className="h-10 w-10 bg-black/5 rounded-full"></div>
                            </div>
                            <div className="mt-6">
                                <div className="w-full">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="border-t-3 border-black inline-block pt-1 ">
                                            <span className="font-semibold text-sm">
                                                {"CYBERSÉCURITÉ"}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="block line-clamp-2 font-bold text-xl">
                                        {
                                            "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="h-[400px] bg-black/5 rounded-lg relative flex flex-col justify-end p-5">
                                <div className="h-10 w-10 bg-black/5 rounded-full"></div>
                            </div>
                            <div className="mt-6">
                                <div className="w-full">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="border-t-3 border-black inline-block pt-1 ">
                                            <span className="font-semibold text-sm">
                                                {"CYBERSÉCURITÉ"}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="block line-clamp-2 font-bold text-xl">
                                        {
                                            "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="h-[400px] bg-black/5 rounded-lg relative flex flex-col justify-end p-5">
                                <div className="h-10 w-10 bg-black/5 rounded-full"></div>
                            </div>
                            <div className="mt-6">
                                <div className="w-full">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="border-t-3 border-black inline-block pt-1 ">
                                            <span className="font-semibold text-sm">
                                                {"CYBERSÉCURITÉ"}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="block line-clamp-2 font-bold text-xl">
                                        {
                                            "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-16 bg-black/5 py-12 ">
                <div className="main-container">
                    <div className="border-l-3 pl-3 border-black flex items-center gap-4">
                        <span className="font-medium text-sm block shrink-0">
                            {"Les étoiles d'Afrique"}
                        </span>
                        <div className="h-0.5 w-full bg-black"></div>
                        <LinkButton href={"#"} variant="link-color" rightIcon={<>az</>}>
                            <span>{"Voir plus"}</span>
                        </LinkButton>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mt-14">
                        <div className="gap-4 flex items-center py-4">
                            <div className="h-20 w-20 shrink-0 bg-black/5 rounded-lg"></div>
                            <div className="w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium inline-block text-sm">
                                        {"DEEP LEARNING"}
                                    </span>
                                    <span className="font-medium inline-block text-sm">&bull;</span>
                                    <span className="font-medium inline-block text-sm">
                                        {"9 déc. 2026"}
                                    </span>
                                </div>
                                <p className="block line-clamp-2 font-bold text-md">
                                    {
                                        "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="gap-4 flex items-center py-4">
                            <div className="h-20 w-20 shrink-0 bg-black/5 rounded-lg"></div>
                            <div className="w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium inline-block text-sm">
                                        {"DEEP LEARNING"}
                                    </span>
                                    <span className="font-medium inline-block text-sm">&bull;</span>
                                    <span className="font-medium inline-block text-sm">
                                        {"9 déc. 2026"}
                                    </span>
                                </div>
                                <p className="block line-clamp-2 font-bold text-md">
                                    {
                                        "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="gap-4 flex items-center py-4">
                            <div className="h-20 w-20 shrink-0 bg-black/5 rounded-lg"></div>
                            <div className="w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium inline-block text-sm">
                                        {"DEEP LEARNING"}
                                    </span>
                                    <span className="font-medium inline-block text-sm">&bull;</span>
                                    <span className="font-medium inline-block text-sm">
                                        {"9 déc. 2026"}
                                    </span>
                                </div>
                                <p className="block line-clamp-2 font-bold text-md">
                                    {
                                        "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-16 pb-28">
                <div className="main-container">
                    <div className="border-l-3 pl-3 border-black flex items-center gap-4">
                        <span className="font-medium text-sm block shrink-0">
                            {"En tendance actuellement"}
                        </span>
                        <div className="h-0.5 w-full bg-black"></div>
                        <LinkButton href={"#"} variant="link-color" rightIcon={<>az</>}>
                            <span>{"Voir plus"}</span>
                        </LinkButton>
                    </div>

                    <div className="grid grid-cols-3 gap-x-6 gap-y-12 mt-14">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div className="">
                                <div className="h-52 bg-black/5 rounded-lg "></div>
                                <div className="mt-6">
                                    <div className="w-full">
                                        <span className="block line-clamp-2 font-bold text-xl">
                                            {
                                                "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                            }
                                        </span>
                                        <p className=" line-clamp-2 text-sm mt-2">
                                            {
                                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur imperdiet tellus odio, non ullamcorper nibh accumsan a. Cras ligula nibh, molestie tempor dolor eget, aliquet auctor augue"
                                            }
                                        </p>
                                        <div className="flex items-center gap-4 mt-4">
                                            <span className="font-medium inline-block text-sm">
                                                {"Il y a 45 minutes"}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <div className="h-6 w-6 shrink-0 flex items-center justify-center bg-black/5"></div>
                                                <span className="font-medium inline-block text-sm">
                                                    {"53"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="h-6 w-6 shrink-0 flex items-center justify-center bg-black/5"></div>
                                                <span className="font-medium inline-block text-sm">
                                                    {"245"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="h-6 w-6 shrink-0 flex items-center justify-center bg-black/5"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
