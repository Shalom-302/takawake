"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { LinkButton } from "@/components/ui/button";
import { ArrowUpRightIcon, ChevronRightIcon } from "@/components/icons";
import LikeCommentSaveBar from "@/components/composites/like-comment-save-bar";

export default function ContentSection() {
    return (
        <>
            <section className="mt-10 lg:mt-16">
                <div className="main-container">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className=" col-span-1 lg:col-span-2 bg-[#F6F6F6] rounded-lg p-6">
                            <div className="border-l-3 pl-3 border-(--purple-dreams-500) flex items-center gap-4">
                                <span className="font-medium text-sm block shrink-0">
                                    {"Chroniques"}
                                </span>
                                <div className="h-0.5 w-full bg-(--purple-dreams-100)"></div>
                                <LinkButton
                                    href={"#"}
                                    variant="link-color"
                                    rightIcon={
                                        <div className=" text-(--purple-dreams-500) ">
                                            {" "}
                                            <ArrowUpRightIcon />
                                        </div>
                                    }
                                >
                                    <span className="text-(--black-tekawake-500) ">
                                        {"Voir plus"}
                                    </span>
                                </LinkButton>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-0 w-full mt-6 ">
                                <div className="col-span-1 md:col-span-7 md:border-r-2 border-(--purple-dreams-100) md:pr-4">
                                    <div className="h-[400px] bg-black/5 rounded-lg "></div>
                                    <div className="mt-6">
                                        <div className="w-full">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium inline-block text-sm">
                                                    {"DEEP LEARNING"}
                                                </span>
                                            </div>
                                            <span className="block line-clamp-2 font-bold text-lg sm:text-xl ">
                                                {
                                                    "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                                }
                                            </span>
                                            <p className=" line-clamp-2 text-sm mt-2">
                                                {
                                                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur imperdiet tellus odio, non ullamcorper nibh accumsan a. Cras ligula nibh, molestie tempor dolor eget, aliquet auctor augue"
                                                }
                                            </p>
                                            <div className="mt-4">
                                                <LikeCommentSaveBar
                                                    like={123}
                                                    comment={43}
                                                    article_id={""}
                                                    time={"Il y a 45 minutes"}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-1 md:col-span-5 border-t-2 md:border-none pt-10 md:pt-0 md:pl-4">
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
                                                        <span className="font-medium inline-block text-(--black-tekawake-200) text-xs ">
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
                                                        <span className="font-medium inline-block text-(--black-tekawake-200) text-xs ">
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
                                                        <span className="font-medium inline-block text-(--black-tekawake-200) text-xs ">
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
                                                        <span className="font-medium inline-block text-(--black-tekawake-200) text-xs ">
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
                        <div className="col-span-1 bg-[#F6F6F6] rounded-lg p-6">
                            <div className="border-l-3 pl-3 border-(--purple-dreams-500) flex items-center gap-4">
                                <span className="font-medium text-sm block shrink-0">
                                    {"Tribune"}
                                </span>
                                <div className="h-0.5 w-full bg-(--purple-dreams-100)"></div>
                            </div>
                            <ul className=" my-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <li key={i}>
                                        <div className="gap-3 sm:gap-4 flex items-center border-b border-(--purple-dreams-100) py-4">
                                            <div className="h-16 sm:h-24 w-16 sm:w-24 shrink-0 bg-black/5 rounded-lg"></div>
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
                            <LinkButton
                                href={"#"}
                                variant="link-color"
                                rightIcon={<ArrowUpRightIcon />}
                            >
                                <span className="text-(--black-tekawake-500) ">{"Voir plus"}</span>
                            </LinkButton>
                        </div>
                    </div>
                </div>
            </section>

            <section className=" mt-10 lg:mt-16">
                <div className="main-container">
                    <div className="border-l-3 pl-3 border-(--purple-dreams-500) flex items-center gap-4">
                        <span className="font-medium text-sm block shrink-0">
                            {"Les vidéos TEKAWAKE"}
                        </span>
                        <div className="h-0.5 w-full bg-(--purple-dreams-100)"></div>
                        <LinkButton
                            href={"#"}
                            variant="link-color"
                            rightIcon={<ArrowUpRightIcon />}
                        >
                            <span className="text-(--black-tekawake-500) ">{"Voir plus"}</span>
                        </LinkButton>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:gap-6 mt-6">
                        <div>
                            <div className="h-[250px] sm:h-[300px] md:h-[400px] bg-black/5 rounded-lg relative flex items-center justify-center">
                                <div className="h-12 w-12 shadow-sm sm:h-16 sm:w-16 md:h-20 md:w-20 bg-white rounded-full flex items-center justify-center">
                                    <svg
                                        width="32"
                                        height="36"
                                        viewBox="0 0 32 36"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M30 14.3982C32.6667 15.9378 32.6667 19.7868 30 21.3264L6 35.1828C3.33333 36.7224 -1.78935e-06 34.7979 -1.65476e-06 31.7187L-4.43391e-07 4.0059C-3.08794e-07 0.926696 3.33333 -0.997805 6 0.541796L30 14.3982Z"
                                            fill="#6173F4"
                                        />
                                    </svg>
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
                                    <span className="block line-clamp-2 font-bold text-lg sm:text-xl">
                                        {
                                            "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="h-[250px] sm:h-[300px] md:h-[400px] bg-black/5 rounded-lg relative flex items-center justify-center">
                                <div className="h-12 shadow-sm w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 bg-white rounded-full flex items-center justify-center">
                                    <svg
                                        width="32"
                                        height="36"
                                        viewBox="0 0 32 36"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M30 14.3982C32.6667 15.9378 32.6667 19.7868 30 21.3264L6 35.1828C3.33333 36.7224 -1.78935e-06 34.7979 -1.65476e-06 31.7187L-4.43391e-07 4.0059C-3.08794e-07 0.926696 3.33333 -0.997805 6 0.541796L30 14.3982Z"
                                            fill="#6173F4"
                                        />
                                    </svg>
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
                                    <span className="block line-clamp-2 font-bold text-lg sm:text-xl">
                                        {
                                            "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 mt-6 sm:mt-8 md:mt-12">
                        <div>
                            <div className="h-[250px] sm:h-[300px] md:h-[400px] bg-black/5 rounded-lg relative flex flex-col justify-end p-5">
                                <div className="h-10 w-10 shadow-sm flex items-center justify-center bg-white rounded-full">
                                    <svg
                                        width="17"
                                        height="19"
                                        viewBox="0 0 17 19"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M15.9004 7.71854C17.2337 8.48834 17.2337 10.4128 15.9004 11.1826L3.00039 18.6305C1.66705 19.4003 0.000388156 18.438 0.000388223 16.8984L0.000388874 2.00277C0.000388941 0.463164 1.66706 -0.499085 3.00039 0.270716L15.9004 7.71854Z"
                                            fill="#6173F4"
                                        />
                                    </svg>
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
                                    <span className="block line-clamp-2 font-bold text-lg sm:text-xl">
                                        {
                                            "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="h-[250px] sm:h-[300px] md:h-[400px] bg-black/5 rounded-lg relative flex flex-col justify-end p-5">
                                <div className="h-10 w-10 shadow-sm flex items-center justify-center bg-white rounded-full">
                                    <svg
                                        width="17"
                                        height="19"
                                        viewBox="0 0 17 19"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M15.9004 7.71854C17.2337 8.48834 17.2337 10.4128 15.9004 11.1826L3.00039 18.6305C1.66705 19.4003 0.000388156 18.438 0.000388223 16.8984L0.000388874 2.00277C0.000388941 0.463164 1.66706 -0.499085 3.00039 0.270716L15.9004 7.71854Z"
                                            fill="#6173F4"
                                        />
                                    </svg>
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
                                    <span className="block line-clamp-2 font-bold text-lg sm:text-xl">
                                        {
                                            "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <div className="h-[250px] sm:h-[300px] md:h-[400px] bg-black/5 rounded-lg relative flex flex-col justify-end p-5">
                                <div className="h-10 w-10 shadow-sm flex items-center justify-center bg-white rounded-full">
                                    <svg
                                        width="17"
                                        height="19"
                                        viewBox="0 0 17 19"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M15.9004 7.71854C17.2337 8.48834 17.2337 10.4128 15.9004 11.1826L3.00039 18.6305C1.66705 19.4003 0.000388156 18.438 0.000388223 16.8984L0.000388874 2.00277C0.000388941 0.463164 1.66706 -0.499085 3.00039 0.270716L15.9004 7.71854Z"
                                            fill="#6173F4"
                                        />
                                    </svg>
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
                                    <span className="block line-clamp-2 font-bold text-lg sm:text-xl">
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

            <section className=" mt-10 lg:mt-16 bg-[#F6F6F6] py-12 ">
                <div className="main-container">
                    <div className="border-l-3 pl-3 border-(--purple-dreams-500) flex items-center gap-4">
                        <span className="font-medium text-sm block shrink-0">
                            {"Les étoiles d'Afrique"}
                        </span>
                        <div className="h-0.5 w-full bg-(--purple-dreams-100)"></div>
                        <LinkButton
                            href={"#"}
                            variant="link-color"
                            rightIcon={<ArrowUpRightIcon />}
                        >
                            <span className="text-(--black-tekawake-500) ">{"Voir plus"}</span>
                        </LinkButton>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
                        <div className="gap-3 sm:gap-4 flex items-center sm:py-2 md:py-4">
                            <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 bg-black/5 rounded-lg"></div>
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
                        <div className="gap-3 sm:gap-4 flex items-center sm:py-2 md:py-4">
                            <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 bg-black/5 rounded-lg"></div>
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
                        <div className="gap-3 sm:gap-4 flex items-center sm:py-2 md:py-4">
                            <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 bg-black/5 rounded-lg"></div>
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

            <section className=" mt-10 lg:mt-16 pb-28">
                <div className="main-container">
                    <div className="border-l-3 pl-3 border-(--purple-dreams-500) flex items-center gap-4">
                        <span className="font-medium text-sm block shrink-0">
                            {"En tendance actuellement"}
                        </span>
                        <div className="h-0.5 w-full bg-(--purple-dreams-100)"></div>
                        <LinkButton
                            href={"#"}
                            variant="link-color"
                            rightIcon={<ArrowUpRightIcon />}
                        >
                            <span className="text-(--black-tekawake-500) ">{"Voir plus"}</span>
                        </LinkButton>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6 sm:gap-y-8 md:gap-y-12 mt-14">
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
                                        <div className="mt-4">
                                            <LikeCommentSaveBar
                                                like={123}
                                                comment={43}
                                                article_id={""}
                                                time={"Il y a 45 minutes"}
                                            />
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
