"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronRightIcon } from "@/components/icons";
import veilleService, { VeilleResponse, VeilleStatus } from "@/lib/api/veille.service";

const VEILLES_PER_PAGE = 10;

const STATUS_BADGE: Record<VeilleStatus, { label: string; color: "success" | "warning" | "gray" }> = {
    SUCCESS: { label: "Effectué", color: "success" },
    PENDING: { label: "En cours", color: "warning" },
    FAILED: { label: "Échec", color: "gray" },
};

/**
 * Navigation des sujets, regroupés par veille (un cluster appartient à une
 * seule veille — cf. backend). Chaque veille est dépliable et charge ses
 * clusters à la demande. Une veille sans cluster peut être clusterisée.
 */
export default function TopicsSidebar() {
    const [page, setPage] = useState(0);
    const { veilles, error, isLoading } = veilleService.useVeilles({
        skip: page * VEILLES_PER_PAGE,
        limit: VEILLES_PER_PAGE,
    });
    const { count } = veilleService.useVeillesCount();

    // Un cluster est ouvert ? Sur mobile on masque alors la liste pour laisser
    // toute la place au contenu (sinon il faut scroller toute la liste).
    const params = useParams<{ topic_id?: string | string[] }>();
    const topicParam = params?.topic_id;
    const hasSelection = Boolean(Array.isArray(topicParam) ? topicParam[0] : topicParam);

    const list = veilles ?? [];
    const totalPages = count ? Math.ceil(count / VEILLES_PER_PAGE) : 1;

    return (
        <aside
            className={cn(
                "border-b md:border-b-0 md:border-r border-black/10 w-full md:w-[380px] shrink-0 md:sticky md:top-0 md:h-screen md:overflow-auto",
                hasSelection && "hidden md:block",
            )}
        >
            <div className="flex flex-col">
                <div className="px-4 py-6 border-b border-black/5 sticky top-0 bg-white z-10">
                    <h1 className="text-lg font-semibold">{"Veilles & sujets"}</h1>
                    <p className="text-sm mt-1 opacity-60">
                        {"Dépliez une veille pour voir ses clusters."}
                    </p>
                </div>

                <ul className="px-2 py-2 space-y-1">
                    {isLoading && (
                        <li className="text-sm text-black/60 px-2 py-3">{"Chargement..."}</li>
                    )}
                    {error && (
                        <li className="text-sm text-red-600 px-2 py-3">
                            {"Impossible de charger les veilles."}
                        </li>
                    )}
                    {!isLoading && !error && list.length === 0 && (
                        <li className="text-sm text-black/60 px-2 py-3">
                            {"Aucune veille pour le moment."}
                        </li>
                    )}
                    {list.map(veille => (
                        <VeilleGroup key={veille.id} veille={veille} />
                    ))}
                </ul>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-black/5">
                        <Button
                            size="sm"
                            variant="secondary"
                            disabled={page === 0}
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                        >
                            {"Précédent"}
                        </Button>
                        <span className="text-xs opacity-60">
                            {`Page ${page + 1} / ${totalPages}`}
                        </span>
                        <Button
                            size="sm"
                            variant="secondary"
                            disabled={page + 1 >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            {"Suivant"}
                        </Button>
                    </div>
                )}
            </div>
        </aside>
    );
}

function VeilleGroup({ veille }: { veille: VeilleResponse }) {
    const [open, setOpen] = useState(false);
    const [backfilling, setBackfilling] = useState(false);
    const [reindexing, setReindexing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    const { count, isLoading, refreshCount } = veilleService.useClustersCount({
        veille_id: veille.id,
    });
    const clusterCount = count ?? 0;
    const status = STATUS_BADGE[veille.status];

    // Tâches Celery asynchrones : on revalide le compteur quelques fois pour
    // refléter le vrai résultat (le badge se met à jour automatiquement).
    function pollCount() {
        [3000, 7000, 12000].forEach(ms => setTimeout(() => refreshCount(), ms));
    }

    async function clusterize(e: React.MouseEvent) {
        e.stopPropagation();
        setBackfilling(true);
        setNotice(null);
        try {
            await veilleService.runBackfill(veille.id);
            setNotice(
                "Clustering lancé (quelques secondes). Si aucun cluster n'apparaît, ré-indexez d'abord les articles.",
            );
            pollCount();
        } catch {
            setNotice("Échec du lancement du clustering.");
        } finally {
            setBackfilling(false);
        }
    }

    async function reindex(e: React.MouseEvent) {
        e.stopPropagation();
        setReindexing(true);
        setNotice(null);
        try {
            await veilleService.reindexVeille(veille.id);
            setNotice("Ré-indexation lancée — patientez puis relancez le clustering.");
        } catch {
            setNotice("Échec du lancement de la ré-indexation.");
        } finally {
            setReindexing(false);
        }
    }

    async function removeVeille(e: React.MouseEvent) {
        e.stopPropagation();
        const ok = window.confirm(
            `Supprimer la veille « ${veille.prompt.slice(0, 60)} » ?\n\n` +
                "Cela supprime définitivement : ses articles, ses clusters (résumés + slides) " +
                "et ses vecteurs Qdrant. Action irréversible.",
        );
        if (!ok) return;
        setDeleting(true);
        try {
            // La route DELETE /veille/{id} cascade articles + clusters et purge Qdrant.
            await veilleService.deleteVeille(veille.id);
            // deleteVeille invalide déjà le cache des veilles → la ligne disparaît.
        } catch {
            setNotice("Échec de la suppression de la veille.");
            setDeleting(false);
        }
    }

    return (
        <li className="rounded-lg">
            <div
                role="button"
                tabIndex={0}
                onClick={() => clusterCount > 0 && setOpen(o => !o)}
                onKeyDown={e => {
                    if ((e.key === "Enter" || e.key === " ") && clusterCount > 0) setOpen(o => !o);
                }}
                className={cn(
                    "flex items-center gap-2 rounded-lg p-3",
                    clusterCount > 0 ? "cursor-pointer hover:bg-black/5" : "cursor-default",
                )}
            >
                <span className="shrink-0 text-black/40">
                    {clusterCount > 0 ? (
                        open ? <ChevronDownIcon size={18} /> : <ChevronRightIcon size={18} />
                    ) : (
                        <ChevronRightIcon size={18} />
                    )}
                </span>
                <div className="w-full min-w-0">
                    <p className="line-clamp-2 font-semibold text-sm">{veille.prompt}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <Badge color={status.color}>{status.label}</Badge>
                        <span className="text-xs opacity-60">
                            {isLoading
                                ? "…"
                                : `${clusterCount} cluster${clusterCount > 1 ? "s" : ""}`}
                        </span>
                    </div>
                </div>
                <Button
                    size="sm"
                    variant="secondary-destructive"
                    className="shrink-0"
                    disabled={deleting}
                    onClick={removeVeille}
                    title="Supprimer la veille (articles + clusters + vecteurs)"
                >
                    {deleting ? "..." : "Supprimer"}
                </Button>
            </div>

            {/* Veille sans cluster → clusteriser (et ré-indexer si pas de vecteurs) */}
            {!isLoading && clusterCount === 0 && (
                <div className="pl-10 pr-3 pb-3 space-y-2">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            variant="primary"
                            disabled={backfilling}
                            onClick={clusterize}
                        >
                            {backfilling ? "Lancement..." : "Clusteriser cette veille"}
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            disabled={reindexing}
                            onClick={reindex}
                        >
                            {reindexing ? "Lancement..." : "Ré-indexer"}
                        </Button>
                    </div>
                    {notice && <p className="text-xs opacity-70">{notice}</p>}
                </div>
            )}

            {/* Clusters de la veille — chargés à l'ouverture (lazy) */}
            {open && clusterCount > 0 && <VeilleClusters veilleId={veille.id} />}
        </li>
    );
}

function VeilleClusters({ veilleId }: { veilleId: number }) {
    const params = useParams<{ topic_id?: string | string[] }>();
    const topicParam = params?.topic_id;
    const currentTopic = Array.isArray(topicParam) ? topicParam[0] : topicParam;
    const currentId = currentTopic ? Number(currentTopic) : null;

    const { clusters, error, isLoading } = veilleService.useClusters({
        veille_id: veilleId,
        limit: 100,
    });
    const clusterList = clusters ?? [];

    if (isLoading) {
        return <p className="pl-10 pr-3 pb-3 text-xs text-black/50">{"Chargement des clusters..."}</p>;
    }
    if (error) {
        return <p className="pl-10 pr-3 pb-3 text-xs text-red-600">{"Erreur de chargement."}</p>;
    }

    return (
        <ul className="pl-6 pb-2 space-y-1">
            {clusterList.map(cluster => {
                const hasContent = Boolean(cluster.summary_article) && (cluster.slides?.length ?? 0) > 0;
                return (
                    <li key={cluster.id}>
                        <Link
                            href={`/dashboard/topics/${cluster.id}`}
                            className={cn(
                                "flex items-center gap-2 rounded-lg p-2.5",
                                currentId === cluster.id ? "bg-black/10" : "hover:bg-black/5",
                            )}
                        >
                            <span
                                className={cn(
                                    "h-2 w-2 shrink-0 rounded-full",
                                    hasContent ? "bg-green-500" : "bg-black/20",
                                )}
                                title={hasContent ? "Contenu généré" : "Sans contenu"}
                            />
                            <div className="w-full min-w-0">
                                <p className="line-clamp-2 text-sm">{cluster.title}</p>
                                <div className="flex items-center gap-1.5 mt-0.5 text-xs opacity-60">
                                    <span>{new Date(cluster.created_at).toLocaleDateString("fr-FR")}</span>
                                    {!cluster.is_published && (
                                        <>
                                            <span>&bull;</span>
                                            <span>{"Brouillon"}</span>
                                        </>
                                    )}
                                    {cluster.is_premium && (
                                        <>
                                            <span>&bull;</span>
                                            <span className="font-semibold text-utility-brand-700 opacity-100">
                                                {"Premium"}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
