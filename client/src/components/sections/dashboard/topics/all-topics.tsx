"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LikeCommentSaveBar from "@/components/composites/like-comment-save-bar";
import {
    ArrowUpRightIcon,
    HeartIcon,
    MessageCircleTwoIcon,
    ShareSixIcon,
} from "@/components/icons";
import { BookmarkIcon } from "lucide-react";
import { Carousel } from "@/components/ui/carousel";

export default function AllTopics() {
    return (
        <>
            <section className="flex">
                <div>
                    <div className="border-r border-black/10 w-[450px] shrink-0 sticky top-0 h-screen overflow-auto">
                        <div className="flex flex-col">
                            <div className="px-4 py-6 border-b border-black/5 sticky top-0 bg-white mb-4">
                                <h1 className="text-lg font-semibold">{"Sujets générés"}</h1>
                                <p className="text-sm mt-1">
                                    {
                                        "Proin ultricies faucibus ante nec interdum, posuere ante nec, venenatis massa."
                                    }
                                </p>
                            </div>
                            <ul className="space-y-1 h-full px-4">
                                {Array.from({ length: 34 }).map((_, i) => (
                                    <li key={i}>
                                        <div className="gap-3 sm:gap-4 flex items-center sm:hover:bg-black/5 rounded-lg p-4 cursor-pointer">
                                            <div className="h-16 sm:h-24 w-16 sm:w-24 shrink-0 bg-black/5 rounded-lg"></div>
                                            <div className="w-full">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium inline-block text-xs">
                                                        {"Il y 28 minutes"}
                                                    </span>
                                                </div>
                                                <p className="block line-clamp-2 w-full font-semibold text-md">
                                                    {
                                                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vel tincidunt diam"
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="w-full h-screen overflow-scroll py-16">
                    <div className="w-full mx-auto max-w-3xl px-10 space-y-10">
                        <div className="text-center space-y-2">
                            <h2 className="text-lg sm:text-xl md:text-2xl leading-[140%] font-bold">
                                {
                                    "In eget enim non nisl hendrerit ornare. Suspendisse turpis turpis, fringilla ut dolor non, accumsan rutrum neque"
                                }
                            </h2>
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="font-medium inline-block text-sm">
                                    {"Il y 28 minutes"}
                                </span>
                                <span className="font-medium inline-block text-sm">&bull;</span>
                                <span className="font-medium inline-block text-sm">
                                    {"345 articles"}
                                </span>
                            </div>
                        </div>
                        <div className="h-[400px] bg-black rounded-lg relative  "></div>
                        <div>contenu</div>
                        <div className="">
                            <Carousel
                                items={[
                                    <div className="py-8 px-16 text-center bg-black text-white rounded-lg">
                                        <span className="text-sm opacity-60">
                                            {"Slide 1 sur 14"}
                                        </span>
                                        <p className="text-md mt-3 pb-5">
                                            {
                                                "Microsoft, Anthropic & Nvidia créent un géant. 💰 15 milliards $ d'investissement. Valorisation : 350 MILLIARDS $. L'écosystème se consolide."
                                            }
                                        </p>
                                    </div>,
                                    <div className="py-8 px-16 text-center bg-black text-white rounded-lg">
                                        <span className="text-sm opacity-60">
                                            {"Slide 1 sur 14"}
                                        </span>
                                        <p className="text-md mt-3 pb-5">
                                            {
                                                "Microsoft, Anthropic & Nvidia créent un géant. 💰 15 milliards $ d'investissement. Valorisation : 350 MILLIARDS $. L'écosystème se consolide."
                                            }
                                        </p>
                                    </div>,
                                    // More testimonials...
                                ]}
                                opts={{ loop: true }}
                            />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold">{"345 sources"}</h1>
                            <ul className="space-y-2 mt-4">
                                {Array.from({ length: 34 }).map((_, i) => (
                                    <li key={i}>
                                        <div className="gap-3 sm:gap-4 flex items-start justify-between bg-black/5 rounded-lg p-5 cursor-pointer">
                                            <div className="w-full truncate">
                                                <p className="block truncate w-full font-semibold text-md">
                                                    {
                                                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vel tincidunt diam"
                                                    }
                                                </p>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium inline-block text-sm">
                                                        {"Nom de l'article ici"}
                                                    </span>
                                                    <span className="font-medium inline-block text-sm">
                                                        &bull;
                                                    </span>
                                                    <span className="font-medium inline-block text-sm">
                                                        {"Il y 28 minutes"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex items-center justify-center">
                                                <ArrowUpRightIcon size={18} />
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

        </>
    );
}
