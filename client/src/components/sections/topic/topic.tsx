"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge";
import veilleService, { type ClusterResponse } from "@/lib/api/veille.service";
import { formatShortDate } from "@/lib/format-date";

function ClusterThumb({
    id,
    className,
}: {
    id: number;
    className?: string;
}) {
    const { imageUrls } = veilleService.useClusterImage(id);
    const img = imageUrls?.[0];
    return (
        <div
            className={className}
            style={
                img
                    ? {
                          backgroundImage: `url(${img})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                      }
                    : undefined
            }
        />
    );
}

export default function Topic() {
    const params = useParams<{ topic_id?: string | string[] }>();
    const topicParam = params?.topic_id;
    const categoryId = Array.isArray(topicParam) ? topicParam[0] : topicParam;
    const categoryIdNum = categoryId ? Number(categoryId) : undefined;

    const { category } = veilleService.useCategory(categoryIdNum);
    const { clusters, isLoading, error } = veilleService.useClusters({
        is_published: true,
        category_id: categoryIdNum,
        limit: 50,
    });

    const { clusters: othersClusters } = veilleService.useClusters({
        is_published: true,
        limit: 6,
    });
    const { categories } = veilleService.useCategories({ limit: 20 });

    const items = clusters ?? [];
    const hero = items.slice(0, 2);
    const rest = items.slice(2);
    const recommended = (othersClusters ?? [])
        .filter(c => c.category_id !== categoryIdNum)
        .slice(0, 4);

    if (error) {
        return (
            <div className="main-container py-24 text-center text-sm text-red-600">
                {"Catégorie introuvable."}
            </div>
        );
    }

    return (
        <>
            <section className=" relative before:content-[''] before:absolute before:h-[480px] before:w-full before:bg-(--blue-tekawake-50) ">
                <div className="main-container relative">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-[70px] md:pt-[100px]">
                        <div className=" w-full max-w-[400px] ">
                            <h1 className="text-3xl md:text-4xl leading-[140%] font-bold ">
                                {category?.name ?? (isLoading ? "Chargement..." : "Sujet")}
                            </h1>
                            <div className="mt-3">
                                <Button size={"lg"} variant="secondary" asChild>
                                    <Link href={"/"}>{"Retour à l'accueil"}</Link>
                                </Button>
                            </div>
                        </div>
                        <div>
                            <p className="font-medium ">
                                {items.length > 0
                                    ? `${items.length} sujet${items.length > 1 ? "s" : ""} publié${items.length > 1 ? "s" : ""} dans cette catégorie.`
                                    : isLoading
                                      ? "Chargement des sujets..."
                                      : "Aucun sujet publié dans cette catégorie pour le moment."}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 lg:pt-[100px] relative z-10">
                        {hero.map(c => (
                            <Link key={c.id} href={`/topic/article/${c.id}`}>
                                <div>
                                    <ClusterThumb
                                        id={c.id}
                                        className="h-[300px] md:h-[400px] bg-black rounded-lg "
                                    />
                                    <div className="mt-6">
                                        <div className="w-full">
                                            <span className="block line-clamp-2 font-bold text-lg sm:text-xl">
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
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mt-10 lg:mt-16 pb-28">
                <div className="main-container">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 py-6 ">
                            <div className="border-l-3 pl-3 border-(--purple-dreams-500) flex items-center gap-4">
                                <span className="font-medium text-sm block shrink-0">
                                    {"Les articles récents"}
                                </span>
                                <div className="h-0.5 w-full bg-(--purple-dreams-100)"></div>
                            </div>
                            <div className="mt-6">
                                {rest.length === 0 ? (
                                    <p className="text-sm text-black/60 py-8">
                                        {hero.length > 0
                                            ? "Tous les sujets de cette catégorie sont affichés ci-dessus."
                                            : "Aucun article à afficher."}
                                    </p>
                                ) : (
                                    <ul className="space-y-6">
                                        {rest.map(c => (
                                            <li
                                                key={c.id}
                                                className="sm:not-last:border-b border-(--purple-dreams-100)"
                                            >
                                                <Link
                                                    href={`/topic/article/${c.id}`}
                                                    className="gap-4 flex flex-col sm:flex-row sm:items-center sm:py-4"
                                                >
                                                    <ClusterThumb
                                                        id={c.id}
                                                        className="h-52 sm:h-40 w-full sm:w-[190px] md:w-3xs shrink-0 bg-black/5 rounded-lg"
                                                    />
                                                    <div className="w-full">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium inline-block text-sm">
                                                                {(c.category?.name ?? "Tekawake").toUpperCase()}
                                                            </span>
                                                            <span className="font-medium inline-block text-sm">
                                                                &bull;
                                                            </span>
                                                            <span className="font-medium inline-block text-sm">
                                                                {formatShortDate(c.created_at)}
                                                            </span>
                                                        </div>
                                                        <h2 className="block line-clamp-2 font-bold text-lg sm:text-xl">
                                                            {c.title}
                                                        </h2>
                                                        {c.summary_article && (
                                                            <p className=" line-clamp-2 text-sm mt-2">
                                                                {c.summary_article.replace(/[*#\n]/g, " ")}
                                                            </p>
                                                        )}
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        <div className="lg:col-span-1 space-y-4 ">
                            {recommended.length > 0 && (
                                <div className="bg-[#F6F6F6] rounded-lg px-6 pt-6 pb-2">
                                    <div className="border-l-3 pl-3 border-(--purple-dreams-500) flex items-center gap-4">
                                        <span className="font-medium text-sm block shrink-0">
                                            {"Recommandé"}
                                        </span>
                                        <div className="h-0.5 w-full bg-(--purple-dreams-100)"></div>
                                    </div>
                                    <ul className=" mt-6">
                                        {recommended.map(c => (
                                            <li
                                                key={c.id}
                                                className="not-last:border-b border-(--purple-dreams-100)"
                                            >
                                                <Link
                                                    href={`/topic/article/${c.id}`}
                                                    className="gap-3 sm:gap-4 flex items-center py-4"
                                                >
                                                    <ClusterThumb
                                                        id={c.id}
                                                        className="h-16 sm:h-24 w-16 sm:w-24 shrink-0 bg-black/5 rounded-lg"
                                                    />
                                                    <div className="w-full">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium inline-block text-sm">
                                                                {(c.category?.name ?? "Tekawake").toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <p className="block line-clamp-2 font-bold text-md">
                                                            {c.title}
                                                        </p>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {(categories?.length ?? 0) > 0 && (
                                <div className="bg-[#F6F6F6] rounded-lg p-6">
                                    <span className="font-medium block">
                                        {"Ces sujets pourraient vous intéresser"}
                                    </span>
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {(categories ?? [])
                                            .filter(cat => cat.id !== categoryIdNum)
                                            .slice(0, 8)
                                            .map(cat => (
                                                <Link key={cat.id} href={`/topic/one/${cat.id}`}>
                                                    <Badge variant="pill-color" size={"lg"}>
                                                        {cat.name}
                                                    </Badge>
                                                </Link>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
