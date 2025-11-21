"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LikeCommentSaveBar from "@/components/composites/like-comment-save-bar";
import { HeartIcon, MessageCircleTwoIcon, ShareSixIcon } from "@/components/icons";
import { BookmarkIcon } from "lucide-react";

export default function Article() {
    return (
        <>
            <section className=" relative before:content-[''] before:absolute before:h-[500px] lg:before:h-[430px] before:w-full before:bg-(--blue-tekawake-50) ">
                <div className="main-container relative">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="lg:pr-10">
                            <div className="lg:min-h-[430px] pt-[70px] md:pt-[100px] w-full">
                                <div className="border-t-3 border-black inline-block pt-1 ">
                                    <span className="font-semibold text-sm">{"CYBERSÉCURITÉ"}</span>
                                </div>
                                <div className="space-y-4 lg:mb-8 mt-4">
                                    <h1 className="text-lg sm:text-xl md:text-2xl leading-[140%] font-bold sm:line-clamp-3 ">
                                        {
                                            "Que retenir des panels organisés lors du Cyber Africa Forum édition 2025 qui s’est tenu à Cotonou au Bénin ?"
                                        }
                                    </h1>
                                    <p className=" line-clamp-2 text-sm mt-2">
                                        {
                                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur imperdiet tellus odio, non ullamcorper nibh accumsan a. Cras ligula nibh, molestie tempor dolor eget, aliquet auctor augue"
                                        }
                                    </p>
                                    <LikeCommentSaveBar
                                        like={123}
                                        comment={43}
                                        article_id={""}
                                        time={"Il y a 45 minutes"}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="lg:min-h-[430px] pt-10 lg:pt-[100px] ">
                            <div className="w-full">
                                <div className="h-[400px] bg-black rounded-lg relative overflow-hidden"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-24 pb-28">
                <div className="main-container">
                    <div className="max-w-4xl mx-auto">
                        <div>content here</div>

                        <div className="mt-12 flex flex-wrap gap-3">
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

                        <div className="mt-12 border-t border-black/10 border-b py-6 px-8">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-1">
                                        <div className="h-6 w-6 shrink-0 flex items-center justify-center">
                                        <HeartIcon size={20} /></div>
                                        <span className="font-medium inline-block text-sm">
                                            {"53"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="h-6 w-6 shrink-0 flex items-center justify-center">
                                        <MessageCircleTwoIcon size={20} /></div>
                                        <span className="font-medium inline-block text-sm">
                                            {"245"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-1">
                                        <div className="h-6 w-6 shrink-0 flex items-center justify-center">
                                        <BookmarkIcon size={20} /></div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="h-6 w-6 shrink-0 flex items-center justify-center">
                                        <ShareSixIcon size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <Button className="w-full" size={"xl"} variant="primary">
                                Voir les commentaires
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
