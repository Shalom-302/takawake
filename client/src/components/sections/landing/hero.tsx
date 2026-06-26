"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { LinkButton } from "@/components/ui/button";
import { ArrowUpRightIcon } from "@/components/icons";
import veilleService, { type ClusterResponse } from "@/lib/api/veille.service";
import { formatRelative } from "@/lib/format-date";

function HeroCard({ cluster }: { cluster: ClusterResponse }) {
    // Couverture validée par l'éditeur en priorité ; sinon image du meilleur article.
    const { imageUrls } = veilleService.useClusterImage(cluster.cover_image_url ? null : cluster.id);
    const heroImage = cluster.cover_image_url || imageUrls?.[0];

    return (
        <div className="w-full">
            <div className="border-t-3 border-black inline-block pt-1 ">
                <span className="font-semibold text-sm">
                    {(cluster.category?.name ?? "Tekawake").toUpperCase()}
                </span>
            </div>
            <div className="space-y-2 sm:space-y-4 mb-4 sm:mb-8 mt-4">
                <div>
                    <Link href={`/topic/article/${cluster.id}`}>
                        <h1 className="text-lg sm:text-xl md:text-2xl leading-[140%] font-bold cursor-pointer ">
                            {cluster.title}
                        </h1>
                    </Link>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-(--black-tekawake-300)">
                    <span>{formatRelative(cluster.created_at)}</span>
                </div>
            </div>
            <Link href={`/topic/article/${cluster.id}`}>
                <div
                    className="h-[400px] bg-black rounded-lg relative overflow-hidden bg-cover bg-center"
                    style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
                >
                    {cluster.is_premium && (
                        <span className="absolute left-3 top-3 z-10 rounded-full bg-(--purple-dreams-500) px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                            {"Premium"}
                        </span>
                    )}
                </div>
            </Link>
        </div>
    );
}

function MiniRecentCard({ cluster }: { cluster: ClusterResponse }) {
    const { imageUrls } = veilleService.useClusterImage(cluster.cover_image_url ? null : cluster.id);
    const thumb = cluster.cover_image_url || imageUrls?.[0];

    return (
        <Link
            href={`/topic/article/${cluster.id}`}
            className="gap-3 sm:gap-4 flex items-center border-b border-black/0 lg:border-(--purple-dreams-100) py-4"
        >
            <div
                className="h-16 sm:h-20 w-16 sm:w-20 shrink-0 bg-black/5 rounded-lg bg-cover bg-center"
                style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
            />
            <div className="w-full">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium inline-block text-sm">
                        {(cluster.category?.name ?? "Tekawake").toUpperCase()}
                    </span>
                    <span className="font-medium inline-block text-sm">&bull;</span>
                    <span className="font-medium inline-block text-sm">
                        {formatRelative(cluster.created_at)}
                    </span>
                </div>
                <p className="block line-clamp-2 w-full font-bold text-md">{cluster.title}</p>
            </div>
        </Link>
    );
}

export default function HeroSection() {
    const { clusters, isLoading } = veilleService.useClusters({
        is_published: true,
        limit: 3,
    });

    const hero = clusters?.[0];
    const recents = clusters?.slice(1, 3) ?? [];

    return (
        <section className=" relative before:content-[''] before:absolute before:h-80 md:before:h-[400px] lg:before:h-[480px] before:w-full before:bg-(--blue-tekawake-50) ">
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
                                    <Link href={hero ? `/topic/article/${hero.id}` : "#"}>
                                        {"S'éveiller sur un sujet"}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="pt-10 lg:pr-20">
                            <div className="border-l-3 pl-3 border-(--purple-dreams-500) flex items-center gap-4">
                                <span className="font-medium text-sm block shrink-0">
                                    {"Les récents sujets"}
                                </span>
                                <div className="h-0.5 w-full bg-(--purple-dreams-100)"></div>
                                <LinkButton
                                    href={"/articles"}
                                    variant="link-color"
                                    rightIcon={<ArrowUpRightIcon />}
                                >
                                    <span className="text-(--black-tekawake-500) ">
                                        {"Voir plus"}
                                    </span>
                                </LinkButton>
                            </div>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:gap-10 lg:gap-0">
                                {isLoading && recents.length === 0 && (
                                    <>
                                        <div className="py-4 h-20 animate-pulse bg-black/5 rounded-lg" />
                                        <div className="py-4 h-20 animate-pulse bg-black/5 rounded-lg mt-2" />
                                    </>
                                )}
                                {recents.map(c => (
                                    <MiniRecentCard key={c.id} cluster={c} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="min-h-80 md:min-h-[400px] lg:min-h-[480px] pt-10 lg:pt-[100px] ">
                        {hero ? (
                            <HeroCard cluster={hero} />
                        ) : (
                            <div className="h-[400px] bg-black/5 rounded-lg animate-pulse" />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
