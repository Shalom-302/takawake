"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import veilleService, { type ClusterResponse } from "@/lib/api/veille.service";
import { formatRelative } from "@/lib/format-date";
import { stripMarkdown } from "@/lib/markdown";

function PremiumBadge() {
    return (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-(--purple-dreams-500) px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            {"Premium"}
        </span>
    );
}

function ArticleCard({ cluster }: { cluster: ClusterResponse }) {
    const cover = cluster.cover_image_url;
    return (
        <Link href={`/topic/article/${cluster.id}`} className="group block">
            <div className="relative">
                {cluster.is_premium && <PremiumBadge />}
                <div
                    className="h-52 rounded-lg bg-black/5 bg-cover bg-center"
                    style={cover ? { backgroundImage: `url(${cover})` } : undefined}
                />
            </div>
            <div className="mt-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span>{(cluster.category?.name ?? "Tekawake").toUpperCase()}</span>
                    <span>&bull;</span>
                    {/* « Publié il y a … » : le lecteur voit tout de suite si c'est récent. */}
                    <span className="text-(--black-tekawake-300)">
                        {formatRelative(cluster.created_at)}
                    </span>
                </div>
                <h2 className="mt-1 line-clamp-2 text-lg font-bold group-hover:underline">
                    {cluster.title}
                </h2>
                {cluster.summary_article && (
                    <p className="mt-2 line-clamp-2 text-sm">
                        {stripMarkdown(cluster.summary_article)}
                    </p>
                )}
            </div>
        </Link>
    );
}

/** Libellé de regroupement temporel d'un article (façon Entropie). */
function periodLabel(iso: string): string {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const c = new Date(iso);
    const startCreated = new Date(c.getFullYear(), c.getMonth(), c.getDate()).getTime();
    const daysAgo = Math.round((startToday - startCreated) / 86400000);

    if (daysAgo <= 0) return "Aujourd'hui";
    if (daysAgo === 1) return "Hier";
    if (daysAgo <= 6) return "Cette semaine";
    if (daysAgo <= 30) return "Ce mois-ci";
    // Au-delà : regroupé par mois (ex. « Mai 2026 »).
    const label = c.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Page publique « Tous les articles » : sujets publiés regroupés par période
 * (Aujourd'hui, Hier, Cette semaine, Ce mois-ci, puis par mois), avec recherche
 * par titre/résumé (param `q`) et badge Premium sur les articles réservés.
 * Les clusters arrivent déjà triés du plus récent au plus ancien (backend) → les
 * groupes apparaissent donc dans le bon ordre.
 */
export default function AllArticles() {
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") ?? "");

    const { clusters, isLoading } = veilleService.useClusters({
        is_published: true,
        limit: 200,
    });

    const all = clusters ?? [];
    const term = query.trim().toLowerCase();
    const filtered = term
        ? all.filter(
              c =>
                  c.title.toLowerCase().includes(term) ||
                  (c.summary_article ?? "").toLowerCase().includes(term),
          )
        : all;

    // Regroupement par période en préservant l'ordre (clusters déjà triés desc).
    const groups: { label: string; items: ClusterResponse[] }[] = [];
    for (const c of filtered) {
        const label = periodLabel(c.created_at);
        const last = groups[groups.length - 1];
        if (last && last.label === label) last.items.push(c);
        else groups.push({ label, items: [c] });
    }

    return (
        <section className="main-container py-10 lg:py-16">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold md:text-4xl">{"Tous les articles"}</h1>
                    <p className="mt-2 font-medium text-(--black-tekawake-300)">
                        {isLoading
                            ? "Chargement..."
                            : `${filtered.length} article${filtered.length > 1 ? "s" : ""} publié${filtered.length > 1 ? "s" : ""}`}
                    </p>
                </div>
                <div className="w-full max-w-sm">
                    <Input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Rechercher un article..."
                    />
                </div>
            </div>

            {!isLoading && filtered.length === 0 && (
                <p className="py-16 text-center text-sm text-black/60">
                    {term
                        ? "Aucun article ne correspond à votre recherche."
                        : "Aucun article publié pour le moment."}
                </p>
            )}

            <div className="mt-10 space-y-12">
                {groups.map(group => (
                    <div key={group.label}>
                        <div className="mb-6 flex items-center gap-4 border-l-3 border-(--purple-dreams-500) pl-3">
                            <span className="shrink-0 text-sm font-semibold">{group.label}</span>
                            <div className="h-0.5 w-full bg-(--purple-dreams-100)" />
                        </div>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                            {group.items.map(c => (
                                <ArticleCard key={c.id} cluster={c} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
