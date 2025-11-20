"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button/button";
import { LinkButton } from "@/components/ui/button";
import LikeCommentSaveBar from "@/components/composites/like-comment-save-bar";
import { ArrowUpRightIcon, ChevronRightIcon } from "@/components/icons";

export default function HeroSection() {
    return (
        <>
            <section className=" relative before:content-[''] before:absolute before:h-80 md:before:h-[400px] lg:before:h-[480px] before:w-full before:bg-black/5 ">
                <div className="main-container relative">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="">
                            <div className="min-h-80 md:min-h-[400px] lg:min-h-[480px] pt-[70px] md:pt-[100px] w-full max-w-[400px] ">
                                <h1 className="text-3xl md:text-4xl leading-[140%] font-bold ">
                                    {"Média d’éveil sur la tech en Afrique"}
                                </h1>
                                <span className="font-medium ">
                                    {"Pour profiter de la tech, pas la subir."}
                                </span>
                                <div className="mt-6">
                                    <Button size={"lg"} variant="secondary" asChild>
                                        <Link href={"#"}>{"S'éveiller sur un sujet"}</Link>
                                    </Button>
                                </div>
                            </div>
                            <div className="pt-10 lg:pr-20">
                                <div className="border-l-3 pl-3 border-black flex items-center gap-4">
                                    <span className="font-medium text-sm block shrink-0">
                                        {"Les récents sujets"}
                                    </span>
                                    <div className="h-0.5 w-full bg-black"></div>
                                    <LinkButton href={"#"} variant="link-color" rightIcon={<><ArrowUpRightIcon/></>}>
                                        <span>{"Voir plus"}</span>
                                    </LinkButton>
                                </div>

                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:gap-10 lg:gap-0">
                                    <div className="gap-3 sm:gap-4 flex items-center border-b md:border-none lg:border-b py-4">
                                        <div className="h-16 sm:h-20 w-16 sm:w-20 shrink-0 bg-black/5 rounded-lg"></div>
                                        <div className="w-full">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium inline-block text-sm">
                                                    {"DEEP LEARNING"}
                                                </span>
                                                <span className="font-medium inline-block text-sm">
                                                    &bull;
                                                </span>
                                                <span className="font-medium inline-block text-sm">
                                                    {"Il y 28 minutes"}
                                                </span>
                                            </div>
                                            <p className="block line-clamp-2 w-full font-bold text-md">
                                                {
                                                    "Un étudiant Béninois aux États-Unis a créé une IA qui révolutionne l'apprentissage"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="gap-4 flex items-center border-b md:border-none lg:border-b py-4">
                                        <div className="h-16 sm:h-20 w-16 sm:w-20 shrink-0 bg-black/5 rounded-lg"></div>
                                        <div className="w-full">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium inline-block text-sm">
                                                    {"DEEP LEARNING"}
                                                </span>
                                                <span className="font-medium inline-block text-sm">
                                                    &bull;
                                                </span>
                                                <span className="font-medium inline-block text-sm">
                                                    {"Il y 28 minutes"}
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
                        </div>
                        <div className="min-h-80 md:min-h-[400px] lg:min-h-[480px] pt-10 lg:pt-[100px] ">
                            <div className="w-full">
                                <div className="border-t-3 border-black inline-block pt-1 ">
                                    <span className="font-semibold text-sm">{"CYBERSÉCURITÉ"}</span>
                                </div>
                                <div className="space-y-2 sm:space-y-4 mb-4 sm:mb-8 mt-4">
                                    <div>
                                        <Link href={`/topic/article/lorem-ipsum-lodor-sit-amet`}>
                                            <h1 className="text-lg sm:text-xl md:text-2xl leading-[140%] font-bold cursor-pointer ">
                                                {
                                                    "Que retenir des panels organisés lors du Cyber Africa Forum édition 2025 qui s’est tenu à Cotonou au Bénin ?"
                                                }
                                            </h1>
                                        </Link>
                                    </div>
                                    <LikeCommentSaveBar
                                        like={123}
                                        comment={43}
                                        article_id={""}
                                        time={"Il y a 45 minutes"}
                                    />
                                </div>
                                <Link href={`/topic/article/lorem-ipsum-lodor-sit-amet`}>
                                    <div className="h-[400px] bg-black rounded-lg relative overflow-hidden"></div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
