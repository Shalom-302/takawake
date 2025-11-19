"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Article() {
    return (
        <>
            <section className=" relative before:content-[''] before:absolute before:h-[430px] before:w-full before:bg-black/5 ">
                <div className="main-container">
                    <div className="grid grid-cols-2">
                        <div className="pr-10">
                            <div className="min-h-[430px] pt-[100px] w-full">
                                <div className="border-t-3 border-black inline-block pt-1 ">
                                    <span className="font-semibold text-sm">{"CYBERSÉCURITÉ"}</span>
                                </div>
                                <div className="space-y-4 mb-8 mt-4">
                                    <h1 className="text-2xl leading-[140%] font-bold line-clamp-3 ">
                                        {
                                            "Que retenir des panels organisés lors du Cyber Africa Forum édition 2025 qui s’est tenu à Cotonou au Bénin ?"
                                        }
                                    </h1>
                                    <p className=" line-clamp-2 text-sm mt-2">
                                        {
                                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur imperdiet tellus odio, non ullamcorper nibh accumsan a. Cras ligula nibh, molestie tempor dolor eget, aliquet auctor augue"
                                        }
                                    </p>
                                    <div className="flex items-center gap-4">
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
                        <div className="min-h-[430px] pt-[100px] ">
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
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-1">
                                        <div className="h-6 w-6 shrink-0 flex items-center justify-center bg-black/5"></div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="h-6 w-6 shrink-0 flex items-center justify-center bg-black/5"></div>
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
