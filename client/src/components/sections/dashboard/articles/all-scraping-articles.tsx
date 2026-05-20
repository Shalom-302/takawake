"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DropdownDotsButton, DropdownMenu } from "@/components/ui/dropdown-menu";
import veilleService, { ArticleResponse, ArticleStatus } from "@/lib/api/veille.service";

const STATUS_BADGE: Record<ArticleStatus, { label: string; color: "success" | "warning" | "gray" }> = {
    PROCESSED: { label: "Complet", color: "success" },
    PENDING: { label: "En attente", color: "warning" },
    FAILED: { label: "Échec", color: "gray" },
};

type StatusFilter = "ALL" | ArticleStatus;

export default function AllScapingArticles() {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("PROCESSED");
    const { articles, error, isLoading } = veilleService.useArticles({
        order_by_publication_date: true,
        limit: 200,
        status: statusFilter === "ALL" ? undefined : statusFilter,
    });
    const list: ArticleResponse[] = articles ?? [];

    return (
        <section className="main-container pt-10 pb-16">
            <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
                <div>
                    <h1 className="text-lg font-semibold">{"Articles scrapés"}</h1>
                    <p className="text-sm mt-1">
                        {"Articles issus de votre activité de veille."}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    {(["PROCESSED", "PENDING", "FAILED", "ALL"] as StatusFilter[]).map(s => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-full border ${
                                statusFilter === s
                                    ? "bg-black text-white border-black"
                                    : "bg-white border-black/10 hover:bg-black/5"
                            }`}
                        >
                            {s === "ALL"
                                ? "Tous"
                                : s === "PROCESSED"
                                  ? "Complets"
                                  : s === "PENDING"
                                    ? "En attente"
                                    : "Échecs"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-12 border-t border-black/10">
                {isLoading && (
                    <div className="py-6 px-4 text-sm text-black/60">
                        {"Chargement des articles..."}
                    </div>
                )}
                {error && (
                    <div className="py-6 px-4 text-sm text-red-600">
                        {"Impossible de charger les articles."}
                    </div>
                )}
                {!isLoading && !error && list.length === 0 && (
                    <div className="py-6 px-4 text-sm text-black/60">
                        {"Aucun article pour ce filtre."}
                    </div>
                )}
                {list.map(article => {
                    const statusInfo = STATUS_BADGE[article.status];
                    const thumb = article.image_urls?.[0];
                    const score = article.analysis?.score_pertinence;
                    return (
                        <div key={article.id} className="border-black/10 border-b py-4 px-4">
                            <div className="flex items-center justify-between gap-10">
                                <div className="w-full flex items-center gap-4">
                                    <div
                                        className="w-[100px] h-[72px] bg-black/10 rounded-lg shrink-0 bg-cover bg-center"
                                        style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
                                    />
                                    <div className="space-y-0.5">
                                        <span className="font-semibold block text-sm line-clamp-2">
                                            {article.title}
                                        </span>
                                        <span className="font-base block text-sm opacity-60">
                                            {article.source_name}
                                        </span>
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center gap-6">
                                    {typeof score === "number" && (
                                        <Badge color="blue">{`Score ${score}/10`}</Badge>
                                    )}
                                    <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                                    <DropdownMenu
                                        trigger={<DropdownDotsButton />}
                                        align="end"
                                        contentClassName="min-w-[180px]"
                                        items={[
                                            {
                                                id: "view",
                                                label: "Informations de l'article",
                                                onClick: () => {
                                                    router.push(
                                                        `/dashboard/scraping-articles/one/${article.id}`,
                                                    );
                                                },
                                            },
                                            {
                                                id: "external",
                                                label: "Lire l'article source",
                                                onClick: () => {
                                                    window.open(
                                                        article.source_url,
                                                        "_blank",
                                                        "noopener,noreferrer",
                                                    );
                                                },
                                            },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
