"use client";

import { Badge, BadgeGroup } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function OneArticle() {
    const router = useRouter();

    return (
        <>
            <section className="main-container pt-10 pb-16">
                <Breadcrumb
                    items={[
                        { href: "/dashboard/scraping-articles", label: "Articles" },
                        { label: "Informations d'un article" },
                    ]}
                    variant="text"
                    separator="icon"
                    showHomeIcon={false}
                />
                <div className="flex items-end justify-between gap-4 mb-4 mt-10">
                    <div className="w-full max-w-[450px] ">
                        <h1 className="text-lg font-semibold">
                            {
                                "Proin ultricies faucibus ante nec interdum, posuere ante nec, venenatis massa."
                            }
                        </h1>
                        <p className="text-sm mt-1 opacity-60">{"Nom du site source"}</p>
                        <div className="flex items-center gap-2 mt-4">
                            <Badge color="success">Complet</Badge>
                            <Badge color="warning">Incomplet</Badge>
                            <Badge color="blue">En ligne</Badge>
                            <Badge color="gray">Hors ligne</Badge>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-10">
                    <Card
                        className="w-full"
                        content={
                            <>
                                <h1 className="font-bold text-xl">{"13 déc 2025"}</h1>
                                <p className="text-sm">Date de récupération</p>
                            </>
                        }
                    />
                    <Card
                        className="w-full"
                        content={
                            <>
                                <h1 className="font-bold text-xl">{"20 nov 2025"}</h1>
                                <p className="text-sm">Date de publication source</p>
                            </>
                        }
                    />
                </div>
                <div className="mt-12 flex gap-4">
                    <div className="w-full"></div>
                    <div className="w-[300px] shrink-0">
                        <div className="w-full">
                            <Card
                                className="w-full"
                                content={
                                    <>
                                        <h1 className="font-bold text-xl">{"20 nov 2025"}</h1>
                                        <p className="text-sm">Date de publication source</p>
                                    </>
                                }
                            />
                        </div>
                    </div>
                </div>
                
            </section>
        </>
    );
}
