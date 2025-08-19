"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { useRef } from "react";
import Typography from "./typography";
import Button from "./button";
import { CardArticle } from "./card-article";
import { OneCardType } from "@/lib/types/definitions";

export default function SliderCard({ title, datas }: { title: string; datas: OneCardType[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const scrollAmount = container.offsetWidth * 0.8; // 80% de la largeur visible

        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <>
            <section className="pb-5 sm:pb-10 mt-10">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <Typography variant={"display-xs"} as={"span"} className="">
                            {title}
                        </Typography>
                        <div className="flex justify-end items-center gap-2">
                            <Button
                                size={"icon-md"}
                                onClick={() => scroll("left")}
                            >
                                <ChevronLeftIcon size={24} />
                            </Button>
                            <Button
                                size={"icon-md"}
                                onClick={() => scroll("right")}
                            >
                                <ChevronRightIcon size={24} />
                            </Button>
                        </div>
                    </div>
                </div>
                <div>
                    <div
                        ref={scrollRef}
                        className="flex pr-4 gap-4 overflow-x-auto scroll-smooth scrollbar-hide"
                    >
                        {datas?.map((item: OneCardType) => (
                            <div
                                key={item?.id}
                                className="w-[280px] sm:w-[350px] lg:min-w-0 flex-shrink-0"
                            >
                                <CardArticle
                                    title={item?.title}
                                    label={item?.label}
                                    illustration={item?.illustration}
                                    redirection={item?.redirection}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
