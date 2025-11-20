"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button/button";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LikeCommentSaveBar from "@/components/composites/like-comment-save-bar";

export default function Topic() {
    return (
        <>
            <section className=" relative before:content-[''] before:absolute before:h-[480px] before:w-full before:bg-black/5 ">
                <div className="main-container">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-[70px] md:pt-[100px]">
                        <div className=" w-full max-w-[400px] ">
                            <h1 className="text-3xl md:text-4xl leading-[140%] font-bold ">
                                {"Robotique"}
                            </h1>
                            <div className="mt-3">
                                <Button size={"lg"} variant="secondary" asChild>
                                    <Link href={"#"}>{"S'éveiller sur un sujet"}</Link>
                                </Button>
                            </div>
                        </div>
                        <div>
                            <p className="font-medium ">
                                {
                                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur imperdiet tellus odio, non ullamcorper nibh accumsan a. Cras ligula nibh, molestie tempor dolor eget, aliquet auctor augue"
                                }
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 lg:pt-[100px] relative z-10">
                        <Link href={`/topic/article/lorem-ipsum-lodor-sit-amet`}>
                            <div>
                                <div className="h-[300px] md:h-[400px] bg-black rounded-lg "></div>
                                <div className="mt-6">
                                    <div className="w-full">
                                        <span className="block line-clamp-2 font-bold text-lg sm:text-xl">
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
                        </Link>
                        <Link href={`/topic/article/lorem-ipsum-lodor-sit-amet`}>
                            <div>
                                <div className="h-[300px] md:h-[400px] bg-black rounded-lg "></div>
                                <div className="mt-6">
                                    <div className="w-full">
                                        <span className="block line-clamp-2 font-bold text-lg sm:text-xl">
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
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mt-10 lg:mt-16 pb-28">
                <div className="main-container">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 py-6 ">
                            <div className="border-l-3 pl-3 border-black flex items-center gap-4">
                                <span className="font-medium text-sm block shrink-0">
                                    {"Les articles récents"}
                                </span>
                                <div className="h-0.5 w-full bg-black"></div>
                            </div>
                            <div className="mt-6">
                                <ul className="space-y-6">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <li key={i} className="sm:not-last:border-b">
                                            <div className="gap-4 flex flex-col sm:flex-row sm:items-center  sm:py-4">
                                                <div className="h-52 sm:h-40 w-full sm:w-[190px] md:w-3xs shrink-0 bg-black/5 rounded-lg"></div>
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
                                                    <h2 className="block line-clamp-2 font-bold text-lg sm:text-xl">
                                                        {
                                                            "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                                        }
                                                    </h2>
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
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-10">
                                    <Button
                                        className="w-full"
                                        size={"xl"}
                                        variant="primary"
                                    >
                                        Charger plus d'articles
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1 space-y-4 ">
                            <div className="bg-black/5 rounded-lg px-6 pt-6 pb-2">
                                <div className="border-l-3 pl-3 border-black flex items-center gap-4">
                                    <span className="font-medium text-sm block shrink-0">
                                        {"Récommandé"}
                                    </span>
                                    <div className="h-0.5 w-full bg-black"></div>
                                </div>
                                <ul className=" mt-6">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <li key={i} className="not-last:border-b">
                                            <div className="gap-3 sm:gap-4 flex items-center py-4">
                                                <div className="h-16 sm:h-24 w-16 sm:w-24 shrink-0 bg-black/5 rounded-lg"></div>
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
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-black/5 rounded-lg p-6">
                                <span className="font-medium block">
                                    {"Ces sujets pourraient vous intéresser"}
                                </span>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Badge variant="pill-color" size={"lg"}>
                                        IA
                                    </Badge>
                                    <Badge variant="pill-color" size={"lg"}>
                                        Machine Learning
                                    </Badge>
                                    <Badge variant="pill-color" size={"lg"}>
                                        Blockchain
                                    </Badge>
                                    <Badge variant="pill-color" size={"lg"}>
                                        ChatGpt
                                    </Badge>
                                    <Badge variant="pill-color" size={"lg"}>
                                        Blockchain
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
