"use client";

import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { ArrowUpRightIcon } from "@/components/icons";
import veilleService, { resolveImageUrl, type ClusterResponse } from "@/lib/api/veille.service";
import { formatRelative } from "@/lib/format-date";
import { stripMarkdown } from "@/lib/markdown";

const HERO_OFFSET = 3;

function ClusterThumb({
    id,
    coverUrl,
    premium,
    className,
    style,
}: {
    id: number;
    coverUrl?: string | null;
    premium?: boolean;
    className?: string;
    style?: React.CSSProperties;
}) {
    // Couverture validée par l'éditeur en priorité ; sinon image dérivée du
    // meilleur article (et on évite alors un fetch inutile).
    const { imageUrls } = veilleService.useClusterImage(coverUrl ? null : id);
    const img = resolveImageUrl(coverUrl || imageUrls?.[0]);
    return (
        <div
            className={`relative ${className ?? ""}`}
            style={{
                ...style,
                ...(img
                    ? {
                          backgroundImage: `url(${img})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                      }
                    : undefined),
            }}
        >
            {premium && (
                <span className="absolute left-2 top-2 z-10 rounded-full bg-(--purple-dreams-500) px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                    {"Premium"}
                </span>
            )}
        </div>
    );
}

function CategoryBadge({ cluster, variant }: { cluster: ClusterResponse; variant: "inline" | "border-top" }) {
    const name = (cluster.category?.name ?? "Tekawake").toUpperCase();
    if (variant === "border-top") {
        return (
            <div className="border-t-3 border-black inline-block pt-1 ">
                <span className="font-semibold text-sm">{name}</span>
            </div>
        );
    }
    return <span className="font-medium inline-block text-sm">{name}</span>;
}

function ChroniquesSection({ clusters }: { clusters: ClusterResponse[] }) {
    if (clusters.length === 0) return null;
    const [main, ...rest] = clusters;

    return (
        <section className="mt-10 lg:mt-16">
            <div className="main-container">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className=" col-span-1 lg:col-span-2 bg-[#F6F6F6] rounded-lg p-6">
                        <div className="border-l-3 pl-3 border-(--purple-dreams-500) flex items-center gap-4">
                            <span className="font-medium text-sm block shrink-0">{"Chroniques"}</span>
                            <div className="h-0.5 w-full bg-(--purple-dreams-100)"></div>
                            <LinkButton
                                href={"/articles"}
                                variant="link-color"
                                rightIcon={
                                    <div className=" text-(--purple-dreams-500) ">
                                        <ArrowUpRightIcon />
                                    </div>
                                }
                            >
                                <span className="text-(--black-tekawake-500) ">{"Voir plus"}</span>
                            </LinkButton>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-0 w-full mt-6 ">
                            <div className="col-span-1 md:col-span-7 md:border-r-2 border-(--purple-dreams-100) md:pr-4">
                                <Link href={`/topic/article/${main.id}`}>
                                    <ClusterThumb
                                        id={main.id}
                                        coverUrl={main.cover_image_url}
                                        premium={main.is_premium}
                                        className="h-[400px] bg-black/5 rounded-lg "
                                    />
                                    <div className="mt-6">
                                        <div className="w-full">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CategoryBadge cluster={main} variant="inline" />
                                            </div>
                                            <span className="block line-clamp-2 font-bold text-lg sm:text-xl ">
                                                {main.title}
                                            </span>
                                            {main.summary_article && (
                                                <p className=" line-clamp-2 text-sm mt-2">
                                                    {stripMarkdown(main.summary_article)}
                                                </p>
                                            )}
                                            <div className="mt-4 text-sm font-medium text-(--black-tekawake-300)">
                                                {formatRelative(main.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="col-span-1 md:col-span-5 border-t-2 md:border-none pt-10 md:pt-0 md:pl-4">
                                <ul className="space-y-6">
                                    {rest.map(c => (
                                        <li key={c.id}>
                                            <Link href={`/topic/article/${c.id}`} className="gap-4">
                                                <div className="w-full">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <CategoryBadge cluster={c} variant="inline" />
                                                    </div>
                                                    <p className="block line-clamp-2 font-bold text-md">
                                                        {c.title}
                                                    </p>
                                                    <div>
                                                        <span className="font-medium inline-block text-(--black-tekawake-200) text-xs ">
                                                            {formatRelative(c.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <TribuneAside />
                </div>
            </div>
        </section>
    );
}

function TribuneAside() {
    const { clusters } = veilleService.useClusters({
        is_published: true,
        skip: HERO_OFFSET + 5,
        limit: 4,
    });
    const items = clusters ?? [];
    if (items.length === 0) return null;

    return (
        <div className="col-span-1 bg-[#F6F6F6] rounded-lg p-6">
            <div className="border-l-3 pl-3 border-(--purple-dreams-500) flex items-center gap-4">
                <span className="font-medium text-sm block shrink-0">{"Tribune"}</span>
                <div className="h-0.5 w-full bg-(--purple-dreams-100)"></div>
            </div>
            <ul className=" my-6">
                {items.map(c => (
                    <li key={c.id}>
                        <Link
                            href={`/topic/article/${c.id}`}
                            className="gap-3 sm:gap-4 flex items-center border-b border-(--purple-dreams-100) py-4"
                        >
                            <ClusterThumb
                                id={c.id}
                                coverUrl={c.cover_image_url}
                                premium={c.is_premium}
                                className="h-16 sm:h-24 w-16 sm:w-24 shrink-0 bg-black/5 rounded-lg"
                            />
                            <div className="w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    <CategoryBadge cluster={c} variant="inline" />
                                    <span className="font-medium inline-block text-sm">&bull;</span>
                                    <span className="font-medium inline-block text-sm">
                                        {formatRelative(c.created_at)}
                                    </span>
                                </div>
                                <p className="block line-clamp-2 font-bold text-md">{c.title}</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
            <LinkButton href={"/articles"} variant="link-color" rightIcon={<ArrowUpRightIcon />}>
                <span className="text-(--black-tekawake-500) ">{"Voir plus"}</span>
            </LinkButton>
        </div>
    );
}

function EtoilesSection() {
    const { clusters } = veilleService.useClusters({
        is_published: true,
        skip: HERO_OFFSET + 14,
        limit: 3,
    });
    const items = clusters ?? [];
    if (items.length === 0) return null;

    return (
        <section className=" mt-10 lg:mt-16 bg-[#F6F6F6] py-12 ">
            <div className="main-container">
                <div className="border-l-3 pl-3 border-(--purple-dreams-500) flex items-center gap-4">
                    <span className="font-medium text-sm block shrink-0">
                        {"Les étoiles d'Afrique"}
                    </span>
                    <div className="h-0.5 w-full bg-(--purple-dreams-100)"></div>
                    <LinkButton href={"/articles"} variant="link-color" rightIcon={<ArrowUpRightIcon />}>
                        <span className="text-(--black-tekawake-500) ">{"Voir plus"}</span>
                    </LinkButton>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
                    {items.map(c => (
                        <Link
                            key={c.id}
                            href={`/topic/article/${c.id}`}
                            className="gap-3 sm:gap-4 flex items-center sm:py-2 md:py-4"
                        >
                            <ClusterThumb
                                id={c.id}
                                coverUrl={c.cover_image_url}
                                premium={c.is_premium}
                                className="h-16 w-16 md:h-20 md:w-20 shrink-0 bg-black/5 rounded-lg"
                            />
                            <div className="w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    <CategoryBadge cluster={c} variant="inline" />
                                    <span className="font-medium inline-block text-sm">&bull;</span>
                                    <span className="font-medium inline-block text-sm">
                                        {formatRelative(c.created_at)}
                                    </span>
                                </div>
                                <p className="block line-clamp-2 font-bold text-md">{c.title}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

function TrendingSection() {
    const { clusters } = veilleService.useClusters({
        is_published: true,
        skip: HERO_OFFSET + 17,
        limit: 6,
    });
    const items = clusters ?? [];
    if (items.length === 0) return null;

    return (
        <section className=" mt-10 lg:mt-16 pb-28">
            <div className="main-container">
                <div className="border-l-3 pl-3 border-(--purple-dreams-500) flex items-center gap-4">
                    <span className="font-medium text-sm block shrink-0">
                        {"En tendance actuellement"}
                    </span>
                    <div className="h-0.5 w-full bg-(--purple-dreams-100)"></div>
                    <LinkButton href={"/articles"} variant="link-color" rightIcon={<ArrowUpRightIcon />}>
                        <span className="text-(--black-tekawake-500) ">{"Voir plus"}</span>
                    </LinkButton>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6 sm:gap-y-8 md:gap-y-12 mt-14">
                    {items.map(c => (
                        <Link key={c.id} href={`/topic/article/${c.id}`}>
                            <ClusterThumb
                                id={c.id}
                                coverUrl={c.cover_image_url}
                                premium={c.is_premium}
                                className="h-52 bg-black/5 rounded-lg "
                            />
                            <div className="mt-6">
                                <div className="w-full">
                                    <span className="block line-clamp-2 font-bold text-xl">
                                        {c.title}
                                    </span>
                                    {c.summary_article && (
                                        <p className=" line-clamp-2 text-sm mt-2">
                                            {stripMarkdown(c.summary_article)}
                                        </p>
                                    )}
                                    <div className="mt-4 text-sm font-medium text-(--black-tekawake-300)">
                                        {formatRelative(c.created_at)}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function ContentSection() {
    const { clusters, isLoading } = veilleService.useClusters({
        is_published: true,
        skip: HERO_OFFSET,
        limit: 5,
    });
    const chroniques = clusters ?? [];

    if (isLoading && chroniques.length === 0) {
        return (
            <div className="main-container mt-10 lg:mt-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-[500px] bg-black/5 rounded-lg animate-pulse" />
                    <div className="h-[500px] bg-black/5 rounded-lg animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <>
            <ChroniquesSection clusters={chroniques} />
            <EtoilesSection />
            <TrendingSection />
        </>
    );
}
