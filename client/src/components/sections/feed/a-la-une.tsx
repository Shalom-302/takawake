"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, RefreshCw, Layers, ArrowUpRight, BarChart3, ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button/button";
import { Carousel } from "@/components/ui/carousel";
import veilleService, { resolveImageUrl, type ClusterResponse } from "@/lib/api/veille.service";
import { formatRelative, formatLongDate } from "@/lib/format-date";
import { stripMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils/cn";
import FeedShell from "@/components/layouts/feed-shell";
import { type FeedView } from "./feed-sidebar";

/** Vues reconnues dans le query param `?view=` (deep-link depuis la page article). */
const FEED_VIEWS: FeedView[] = ["foryou", "today", "yesterday", "week", "trending", "live"];

const VIEW_HEADINGS: Record<FeedView, { title: string; subtitle: string }> = {
    foryou: { title: "Pour vous", subtitle: "Une sélection selon vos centres d'intérêt." },
    today: { title: "À la Une aujourd'hui", subtitle: "Actualités principales des 24 dernières heures." },
    yesterday: { title: "À la Une d'hier", subtitle: "Les sujets qui ont marqué la veille." },
    week: { title: "À la Une cette semaine", subtitle: "Les temps forts des 7 derniers jours." },
    trending: { title: "Tendances", subtitle: "Les sujets les plus suivis du moment." },
    live: { title: "En direct", subtitle: "Les dernières actualités au fil de l'eau." },
};

const DAY = 86_400_000;

function startOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Date de l'actu retenue pour le classement/filtrage : publication_date la plus
 *  récente des articles (renvoyée par l'API), avec repli sur created_at. */
function clusterTime(c: ClusterResponse): number {
    return new Date(c.published_date ?? c.created_at).getTime();
}

function filterByView(clusters: ClusterResponse[], view: FeedView): ClusterResponse[] {
    const sorted = [...clusters].sort((a, b) => clusterTime(b) - clusterTime(a));
    const todayStart = startOfDay(new Date());
    return sorted.filter(c => {
        const t = clusterTime(c);
        switch (view) {
            case "today":
                return t >= todayStart;
            case "yesterday":
                return t >= todayStart - DAY && t < todayStart;
            case "week":
                return t >= todayStart - 6 * DAY;
            default:
                return true;
        }
    });
}

function ClusterThumb({ cluster, className }: { cluster: ClusterResponse; className?: string }) {
    const { imageUrls } = veilleService.useClusterImage(cluster.cover_image_url ? null : cluster.id);
    const thumb = resolveImageUrl(cluster.cover_image_url || imageUrls?.[0]);
    return (
        <div
            className={cn("bg-cover bg-center", !thumb && "bg-black/10", className)}
            style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
        />
    );
}

function FeedItem({
    cluster,
    rank,
    active,
    onSelect,
}: {
    cluster: ClusterResponse;
    rank: number;
    active: boolean;
    onSelect: () => void;
}) {
    const count = cluster.article_count ?? 0;
    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                "group flex w-full items-start gap-4 rounded-2xl p-3 text-left transition-colors",
                active ? "bg-(--blue-tekawake-50)" : "hover:bg-black/[0.03]",
            )}
        >
            <ClusterThumb cluster={cluster} className="h-[84px] w-[104px] shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 pt-0.5">
                <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-(--black-tekawake-200)">
                    <span className={cn("font-semibold", rank === 1 ? "text-(--blue-tekawake-500)" : "text-(--purple-dreams-500)")}>
                        #{rank}
                    </span>
                    {count > 0 && (
                        <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <BarChart3 className="h-3.5 w-3.5" />
                                {count}
                            </span>
                        </>
                    )}
                    <span>•</span>
                    <span>{formatRelative(cluster.published_date ?? cluster.created_at)}</span>
                </div>
                <p className="line-clamp-3 text-[17px] font-bold leading-snug text-(--black-tekawake-500)">
                    {cluster.title}
                </p>
            </div>
        </button>
    );
}

/** Sparkline piloté par les données : volume d'articles / jour (fenêtre glissante). */
function Sparkline({ values }: { values: number[] }) {
    const W = 300;
    const H = 70;
    const PAD = 4; // marge verticale pour ne pas coller aux bords

    // Pas assez de points → on réserve la hauteur sans rien tracer.
    if (values.length < 2) {
        return <div className="h-16 w-full" />;
    }

    const max = Math.max(...values, 1);
    const stepX = W / (values.length - 1);
    const pts = values.map((v, i) => {
        const x = i * stepX;
        const y = H - PAD - (v / max) * (H - PAD * 2);
        return [x, y] as const;
    });

    const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    const area = `${line} L ${W} ${H} L 0 ${H} Z`;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} fill="none" className="h-16 w-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="spark-stroke" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#5f73f4" />
                    <stop offset="1" stopColor="#9f7aea" />
                </linearGradient>
                <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="70" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#5f73f4" stopOpacity="0.16" />
                    <stop offset="1" stopColor="#5f73f4" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill="url(#spark-fill)" />
            <path
                d={line}
                fill="none"
                stroke="url(#spark-stroke)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function StatCard() {
    const { count } = veilleService.useArticlesCount();
    const { points } = veilleService.useArticlesTimeseries(14);
    const values = points?.map(p => p.count) ?? [];
    return (
        <div className="flex h-full items-center justify-center p-8">
            <div className="w-full max-w-sm rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-(--black-tekawake-200)">
                    <BarChart3 className="h-4 w-4" />
                    Articles analysés
                </div>
                <p className="mt-2 text-4xl font-bold tracking-tight text-(--black-tekawake-500)">
                    {count != null ? count.toLocaleString("fr-FR") : "—"}
                </p>
                <div className="mt-6">
                    <Sparkline values={values} />
                </div>
                <p className="mt-2 text-xs font-medium text-(--black-tekawake-200)">
                    14 derniers jours
                </p>
            </div>
        </div>
    );
}

function ArticlePanel({ clusterId, onBack }: { clusterId: number; onBack: () => void }) {
    const { cluster, isLoading } = veilleService.useClusterDetail(clusterId);
    const { imageUrls } = veilleService.useClusterImage(clusterId);
    const heroImage = resolveImageUrl(cluster?.cover_image_url || imageUrls?.[0]);

    if (isLoading && !cluster) {
        return (
            <div className="space-y-4 p-8">
                <div className="h-8 w-3/4 animate-pulse rounded-lg bg-black/5" />
                <div className="h-4 w-1/2 animate-pulse rounded-lg bg-black/5" />
                <div className="h-72 w-full animate-pulse rounded-2xl bg-black/5" />
                <div className="h-4 w-full animate-pulse rounded bg-black/5" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-black/5" />
            </div>
        );
    }

    if (!cluster) {
        return (
            <p className="p-10 text-center text-sm text-(--black-tekawake-200)">Sujet introuvable.</p>
        );
    }

    const category = (cluster.category?.name ?? "Tekawake").toUpperCase();
    const sources = cluster.articles?.length ?? 0;
    const excerpt = stripMarkdown(cluster.summary_article).slice(0, 460);

    // Carrousel de slides affiché directement dans le panneau (le clic sur un
    // cluster fait "sortir" le résumé + les slides). Vide si pas encore générées
    // ou si le contenu premium a été verrouillé pour un visiteur anonyme.
    const slides = cluster.slides ?? [];
    const slideItems = slides.map((item, idx) => {
        const slideImg = resolveImageUrl(item.image_url);
        return (
        <div
            key={`${item.slide}-${idx}`}
            className="relative flex min-h-[220px] flex-col items-center justify-center overflow-hidden rounded-xl bg-black bg-cover bg-center px-10 py-8 text-center text-white"
            style={slideImg ? { backgroundImage: `url(${slideImg})` } : undefined}
        >
            {slideImg && <div className="absolute inset-0 bg-black/55" />}
            <div className="relative z-10">
                <span className="text-xs opacity-70">{`Slide ${idx + 1} sur ${slides.length}`}</span>
                <p className="mt-2 text-sm leading-relaxed">{item.texte}</p>
            </div>
        </div>
        );
    });

    return (
        <article className="mx-auto max-w-2xl p-8 lg:p-10">
            <button
                type="button"
                onClick={onBack}
                className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-(--black-tekawake-200) transition-colors hover:text-(--black-tekawake-500)"
            >
                <ChevronLeft className="h-4 w-4" />
                {"Vue d'ensemble"}
            </button>

            <div className="mb-3 inline-flex w-fit border-t-[3px] border-(--purple-dreams-500) pt-1">
                <span className="text-xs font-semibold tracking-wide text-(--purple-dreams-500)">
                    {category}
                </span>
            </div>

            <h1 className="text-2xl font-bold leading-[1.2] text-(--black-tekawake-500) md:text-[30px]">
                {cluster.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-(--black-tekawake-200)">
                <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatLongDate(cluster.published_date ?? cluster.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                    <RefreshCw className="h-4 w-4" />
                    {formatRelative(cluster.published_date ?? cluster.created_at)}
                </span>
                {sources > 0 && (
                    <span className="flex items-center gap-1.5">
                        <Layers className="h-4 w-4" />
                        {sources} source{sources > 1 ? "s" : ""}
                    </span>
                )}
            </div>

            <div
                className="mt-6 h-72 w-full overflow-hidden rounded-2xl bg-cover bg-center md:h-96"
                style={heroImage ? { backgroundImage: `url(${heroImage})` } : { background: "rgba(0,0,0,0.06)" }}
            >
                {cluster.is_premium && (
                    <span className="m-3 inline-block rounded-full bg-(--purple-dreams-500) px-2.5 py-1 text-xs font-semibold text-white">
                        Premium
                    </span>
                )}
            </div>

            {excerpt ? (
                <p className="mt-6 text-[15px] leading-relaxed text-(--black-tekawake-500)/80">
                    {excerpt}
                    {excerpt.length >= 460 && "…"}
                </p>
            ) : (
                <p className="mt-6 text-sm text-(--black-tekawake-200)">
                    {"Le résumé de ce sujet n'a pas encore été généré."}
                </p>
            )}

            {slideItems.length > 0 && (
                <div className="mt-8">
                    <Carousel items={slideItems} opts={{ loop: true }} />
                </div>
            )}

            <div className="mt-7">
                <Link
                    href={`/topic/article/${cluster.id}`}
                    className={cn(
                        buttonVariants({ variant: "primary", size: "lg" }),
                        "inline-flex items-center gap-2",
                    )}
                >
                    {"Lire l'article complet"}
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </div>
        </article>
    );
}

export default function ALaUne() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialView = searchParams.get("view") as FeedView | null;
    const { clusters, isLoading } = veilleService.useClusters({ is_published: true, limit: 40 });
    const [view, setView] = useState<FeedView>(
        initialView && FEED_VIEWS.includes(initialView) ? initialView : "today",
    );
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const feed = useMemo(() => filterByView(clusters ?? [], view), [clusters, view]);
    const heading = VIEW_HEADINGS[view];

    function handleViewChange(v: FeedView) {
        setView(v);
        setSelectedId(null);
    }

    // ≥ xl : le panneau latéral est visible → on l'alimente. En dessous, il est
    // masqué → on navigue vers la page détail (comme Entropie sur mobile).
    function handleSelect(id: number) {
        if (typeof window !== "undefined" && window.matchMedia("(min-width: 1280px)").matches) {
            setSelectedId(id);
        } else {
            router.push(`/topic/article/${id}`);
        }
    }

    return (
        <FeedShell view={view} onViewChange={handleViewChange}>
            {/* Colonne 2 — feed classé (scroll indépendant) */}
            <div className="flex min-h-0 flex-1 flex-col border-r border-black/[0.06] xl:w-[460px] xl:flex-none">
                <div className="px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
                    <h2 className="text-xl font-bold text-(--black-tekawake-500)">{heading.title}</h2>
                    <p className="mt-1 text-sm text-(--black-tekawake-200)">{heading.subtitle}</p>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-8 sm:px-4">
                    {isLoading && feed.length === 0 ? (
                        <div className="space-y-3 px-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-[100px] w-full animate-pulse rounded-2xl bg-black/5" />
                            ))}
                        </div>
                    ) : feed.length === 0 ? (
                        <p className="py-16 text-center text-sm text-(--black-tekawake-200)">
                            Aucun sujet pour cette période.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {feed.map((cluster, i) => (
                                <FeedItem
                                    key={cluster.id}
                                    cluster={cluster}
                                    rank={i + 1}
                                    active={cluster.id === selectedId}
                                    onSelect={() => handleSelect(cluster.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Colonne 3 — panneau de droite (stat par défaut, article au clic) — xl+ */}
            <div className="hidden h-full min-w-0 flex-1 overflow-y-auto bg-(--color-gray-50) xl:block">
                {selectedId ? (
                    <ArticlePanel clusterId={selectedId} onBack={() => setSelectedId(null)} />
                ) : (
                    <StatCard />
                )}
            </div>
        </FeedShell>
    );
}
