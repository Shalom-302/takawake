"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { ButtonUtility, LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LikeCommentSaveBar from "@/components/composites/like-comment-save-bar";
import {
    ArrowUpRightIcon,
    ChevronRightIcon,
    HeartIcon,
    MessageCircleTwoIcon,
    ShareSixIcon,
} from "@/components/icons";
export default function AllScapingArticles() {
    return (
        <>
            <section className="main-container pt-10 pb-16">
                <div className="flex items-end justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-lg font-semibold">{"Articles scrapés"}</h1>
                        <p className="text-sm mt-1">
                            {
                                "Cette liste rassemble les articles issus de votre activité de veille."
                            }
                        </p>
                    </div>
                    {/* <div>
                        <Button size={"md"} variant="primary">
                            Nouvelle veille
                        </Button>
                    </div> */}
                </div>

                <div className="mt-12 border-t border-black/10">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className=" border-black/10 border-b py-4 px-4">
                            <div className="flex items-center justify-between gap-10">
                                <div className="w-full flex items-center gap-4">
                                    <div className="w-[100px] h-[72px] bg-black/10 rounded-lg shrink-0  "></div>
                                    <div className=" space-y-0.5">
                                        <span className="font-semibold block text-sm">
                                            {
                                                "In eget enim non nisl hendrerit ornare. Suspendisse turpis turpis, fringilla ut dolor non, accumsan rutrum neque. Sed ultrices, sapien vel tempus gravida, risus turpis sodales ex, ac sollicitudin ante erat id urna"
                                            }
                                        </span>
                                        <span className="font-base block text-sm opacity-60">
                                            {"Source de l'article ici"}
                                        </span>
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center gap-6">
                                    
                                    <div>
                                        <Badge color="blue">En ligne</Badge>
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                        <div className="h-6 w-6 shrink-0 flex cursor-pointer items-center justify-center">
                                            <ChevronRightIcon size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
