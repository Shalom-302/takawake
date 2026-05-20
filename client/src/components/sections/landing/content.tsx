"use client";

import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { ArrowUpRightIcon } from "@/components/icons";
import veilleService, { type ClusterResponse } from "@/lib/api/veille.service";
import { formatLongDate, formatShortDate } from "@/lib/format-date";

const HERO_OFFSET = 3;

function ClusterThumb({
    id,
    className,
    style,
}: {
    id: number;
    className?: string;
    style?: React.CSSProperties;
}) {
    const { imageUrls } = veilleService.useClusterImage(id);
    const img = imageUrls?.[0];
    return (
        <div
            className={className}
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
        />
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
                                href={"/"}
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
                                                    {main.summary_article.replace(/[*#\n]/g, " ")}
                                                </p>
                                            )}
                                            <div className="mt-4 text-sm font-medium text-(--black-tekawake-300)">
                                                {formatShortDate(main.created_at)}
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
                                                            {formatLongDate(c.created_at)}
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
                                className="h-16 sm:h-24 w-16 sm:w-24 shrink-0 bg-black/5 rounded-lg"
                            />
                            <div className="w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    <CategoryBadge cluster={c} variant="inline" />
                                    <span className="font-medium inline-block text-sm">&bull;</span>
                                    <span className="font-medium inline-block text-sm">
                                        {formatShortDate(c.created_at)}
                                    </span>
                                </div>
                                <p className="block line-clamp-2 font-bold text-md">{c.title}</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
            <LinkButton href={"/"} variant="link-color" rightIcon={<ArrowUpRightIcon />}>
                <span className="text-(--black-tekawake-500) ">{"Voir plus"}</span>
            </LinkButton>
        </div>
    );
}

function VideosSection() {
    const { clusters } = veilleService.useClusters({
        is_published: true,
        skip: HERO_OFFSET + 9,
        limit: 5,
    });
    const items = clusters ?? [];
    if (items.length === 0) return null;

    const big = items.slice(0, 2);
    const small = items.slice(2, 5);

    return (
        <section className=" mt-10 lg:mt-16">
            <div className="main-container">
                <div className="border-l-3 pl-3 border-(--purple-dreams-500) flex items-center gap-4">
                    <span className="font-medium text-sm block shrink-0">
                        {"Les vidéos TEKAWAKE"}
                    </span>
                    <div className="h-0.5 w-full bg-(--purple-dreams-100)"></div>
                    <LinkButton href={"/"} variant="link-color" rightIcon={<ArrowUpRightIcon />}>
                        <span className="text-(--black-tekawake-500) ">{"Voir plus"}</span>
                    </LinkButton>
                </div>
                {big.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 md:gap-6 mt-6">
                        {big.map(c => (
                            <Link key={c.id} href={`/topic/article/${c.id}`}>
                                <div className="relative">
                                    <ClusterThumb
                                        id={c.id}
                                        className="h-[250px] sm:h-[300px] md:h-[400px] bg-black/5 rounded-lg"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="h-12 w-12 shadow-sm sm:h-16 sm:w-16 md:h-20 md:w-20 bg-white rounded-full flex items-center justify-center">
                                            <PlayLargeIcon />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <div className="w-full">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CategoryBadge cluster={c} variant="border-top" />
                                        </div>
                                        <span className="block line-clamp-2 font-bold text-lg sm:text-xl">
                                            {c.title}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                {small.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 mt-6 sm:mt-8 md:mt-12">
                        {small.map((c, idx) => (
                            <Link
                                key={c.id}
                                href={`/topic/article/${c.id}`}
                                className={idx === 2 ? "col-span-2 sm:col-span-1" : ""}
                            >
                                <div className="relative">
                                    <ClusterThumb
                                        id={c.id}
                                        className="h-[250px] sm:h-[300px] md:h-[400px] bg-black/5 rounded-lg flex flex-col justify-end p-5"
                                    />
                                    <div className="absolute bottom-5 left-5 pointer-events-none">
                                        <div className="h-10 w-10 shadow-sm flex items-center justify-center bg-white rounded-full">
                                            <PlaySmallIcon />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <div className="w-full">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CategoryBadge cluster={c} variant="border-top" />
                                        </div>
                                        <span className="block line-clamp-2 font-bold text-lg sm:text-xl">
                                            {c.title}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
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
                    <LinkButton href={"/"} variant="link-color" rightIcon={<ArrowUpRightIcon />}>
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
                                className="h-16 w-16 md:h-20 md:w-20 shrink-0 bg-black/5 rounded-lg"
                            />
                            <div className="w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    <CategoryBadge cluster={c} variant="inline" />
                                    <span className="font-medium inline-block text-sm">&bull;</span>
                                    <span className="font-medium inline-block text-sm">
                                        {formatShortDate(c.created_at)}
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
                    <LinkButton href={"/"} variant="link-color" rightIcon={<ArrowUpRightIcon />}>
                        <span className="text-(--black-tekawake-500) ">{"Voir plus"}</span>
                    </LinkButton>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6 sm:gap-y-8 md:gap-y-12 mt-14">
                    {items.map(c => (
                        <Link key={c.id} href={`/topic/article/${c.id}`}>
                            <ClusterThumb id={c.id} className="h-52 bg-black/5 rounded-lg " />
                            <div className="mt-6">
                                <div className="w-full">
                                    <span className="block line-clamp-2 font-bold text-xl">
                                        {c.title}
                                    </span>
                                    {c.summary_article && (
                                        <p className=" line-clamp-2 text-sm mt-2">
                                            {c.summary_article.replace(/[*#\n]/g, " ")}
                                        </p>
                                    )}
                                    <div className="mt-4 text-sm font-medium text-(--black-tekawake-300)">
                                        {formatShortDate(c.created_at)}
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
            <VideosSection />
            <EtoilesSection />
            <TrendingSection />
        </>
    );
}

function PlayLargeIcon() {
    return (
        <svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M30 14.3982C32.6667 15.9378 32.6667 19.7868 30 21.3264L6 35.1828C3.33333 36.7224 -1.78935e-06 34.7979 -1.65476e-06 31.7187L-4.43391e-07 4.0059C-3.08794e-07 0.926696 3.33333 -0.997805 6 0.541796L30 14.3982Z"
                fill="#6173F4"
            />
        </svg>
    );
}

function PlaySmallIcon() {
    return (
        <svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M15.9004 7.71854C17.2337 8.48834 17.2337 10.4128 15.9004 11.1826L3.00039 18.6305C1.66705 19.4003 0.000388156 18.438 0.000388223 16.8984L0.000388874 2.00277C0.000388941 0.463164 1.66706 -0.499085 3.00039 0.270716L15.9004 7.71854Z"
                fill="#6173F4"
            />
        </svg>
    );
}
