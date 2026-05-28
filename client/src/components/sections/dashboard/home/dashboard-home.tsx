"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import veilleService, {
    ArticleResponse,
    ArticleStatus,
    ClusterResponse,
    VeilleResponse,
    VeilleStatus,
} from "@/lib/api/veille.service";

const VEILLE_BADGE: Record<VeilleStatus, { label: string; color: "success" | "warning" | "gray" }> = {
    SUCCESS: { label: "Effectué", color: "success" },
    PENDING: { label: "En cours", color: "warning" },
    FAILED: { label: "Échec", color: "gray" },
};

const ARTICLE_BADGE: Record<ArticleStatus, { label: string; color: "success" | "warning" | "gray" }> = {
    PROCESSED: { label: "Complet", color: "success" },
    PENDING: { label: "En attente", color: "warning" },
    FAILED: { label: "Échec", color: "gray" },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function DashboardHome() {
    const { count: veilleCount } = veilleService.useVeillesCount();
    const { count: clusterCount } = veilleService.useClustersCount();
    const { count: publishedCount } = veilleService.useClustersCount({ is_published: true });
    const { count: processedCount } = veilleService.useArticlesCount({ status: "PROCESSED" });

    const { veilles } = veilleService.useVeilles({ limit: 5 });
    const { clusters } = veilleService.useClusters({ limit: 5 });
    const { articles } = veilleService.useArticles({
        order_by_publication_date: true,
        status: "PROCESSED",
        limit: 5,
    });

    const veilleList = veilles ?? [];
    const clusterList = clusters ?? [];
    const articleList = articles ?? [];

    const fmt = (n?: number) => (typeof n === "number" ? n.toLocaleString("fr-FR") : "—");

    return (
        <section className="main-container pt-10 pb-16 space-y-10">
            <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">{"Tableau de bord"}</h1>
                    <p className="text-sm mt-1 opacity-60">
                        {"Vue d'ensemble de la plateforme de veille."}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/dashboard/tech-monitoring"
                        className="px-4 py-2 rounded-lg border border-black/10 text-sm hover:bg-black/5"
                    >
                        {"Veilles"}
                    </Link>
                    <Link
                        href="/dashboard/topics"
                        className="px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-black/90"
                    >
                        {"Voir les sujets"}
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card
                    className="w-full"
                    content={
                        <>
                            <h2 className="font-bold text-2xl">{fmt(veilleCount)}</h2>
                            <p className="text-sm">Veilles</p>
                        </>
                    }
                />
                <Card
                    className="w-full"
                    content={
                        <>
                            <h2 className="font-bold text-2xl">{fmt(clusterCount)}</h2>
                            <p className="text-sm">Clusters</p>
                        </>
                    }
                />
                <Card
                    className="w-full"
                    content={
                        <>
                            <h2 className="font-bold text-2xl">{fmt(publishedCount)}</h2>
                            <p className="text-sm">Clusters publiés</p>
                        </>
                    }
                />
                <Card
                    className="w-full"
                    content={
                        <>
                            <h2 className="font-bold text-2xl">{fmt(processedCount)}</h2>
                            <p className="text-sm">Articles complets</p>
                        </>
                    }
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RecentVeilles veilles={veilleList} />
                <RecentClusters clusters={clusterList} />
            </div>

            <RecentArticles articles={articleList} />
        </section>
    );
}

function RecentVeilles({ veilles }: { veilles: VeilleResponse[] }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{"Dernières veilles"}</h2>
                <Link href="/dashboard/tech-monitoring" className="text-sm underline opacity-60 hover:opacity-100">
                    {"Tout voir"}
                </Link>
            </div>
            <ul className="border border-black/10 rounded-lg divide-y divide-black/10">
                {veilles.length === 0 && (
                    <li className="text-sm text-black/60 px-4 py-6">
                        {"Aucune veille."}
                    </li>
                )}
                {veilles.map(v => {
                    const b = VEILLE_BADGE[v.status];
                    return (
                        <li key={v.id}>
                            <Link
                                href={`/dashboard/tech-monitoring/one/${v.id}`}
                                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-black/5"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium line-clamp-1">{v.prompt}</p>
                                    <p className="text-xs opacity-60 mt-0.5">{formatDate(v.created_at)}</p>
                                </div>
                                <Badge color={b.color}>{b.label}</Badge>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function RecentClusters({ clusters }: { clusters: ClusterResponse[] }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{"Derniers clusters"}</h2>
                <Link href="/dashboard/topics" className="text-sm underline opacity-60 hover:opacity-100">
                    {"Tout voir"}
                </Link>
            </div>
            <ul className="border border-black/10 rounded-lg divide-y divide-black/10">
                {clusters.length === 0 && (
                    <li className="text-sm text-black/60 px-4 py-6">{"Aucun cluster."}</li>
                )}
                {clusters.map(c => (
                    <li key={c.id}>
                        <Link
                            href={`/dashboard/topics/${c.id}`}
                            className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-black/5"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-medium line-clamp-1">{c.title}</p>
                                <p className="text-xs opacity-60 mt-0.5">{formatDate(c.created_at)}</p>
                            </div>
                            <Badge color={c.is_published ? "success" : "gray"}>
                                {c.is_published ? "Publié" : "Brouillon"}
                            </Badge>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function RecentArticles({ articles }: { articles: ArticleResponse[] }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{"Derniers articles complets"}</h2>
                <Link href="/dashboard/scraping-articles" className="text-sm underline opacity-60 hover:opacity-100">
                    {"Tout voir"}
                </Link>
            </div>
            <ul className="border border-black/10 rounded-lg divide-y divide-black/10">
                {articles.length === 0 && (
                    <li className="text-sm text-black/60 px-4 py-6">{"Aucun article complet."}</li>
                )}
                {articles.map(a => {
                    const b = ARTICLE_BADGE[a.status];
                    const score = a.analysis?.score_pertinence;
                    return (
                        <li key={a.id}>
                            <Link
                                href={`/dashboard/scraping-articles/one/${a.id}`}
                                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-black/5"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium line-clamp-1">{a.title}</p>
                                    <p className="text-xs opacity-60 mt-0.5">
                                        {a.source_name}
                                        {a.publication_date ? ` · ${formatDate(a.publication_date)}` : ""}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {typeof score === "number" && (
                                        <Badge color="blue">{`${score}/10`}</Badge>
                                    )}
                                    <Badge color={b.color}>{b.label}</Badge>
                                </div>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
