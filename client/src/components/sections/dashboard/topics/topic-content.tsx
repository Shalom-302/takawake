"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowUpRightIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel } from "@/components/ui/carousel";
import veilleService from "@/lib/api/veille.service";
import { renderMarkdown } from "@/lib/markdown";
import ClusterEditor from "./cluster-editor";

export default function TopicContent() {
    const params = useParams<{ topic_id?: string | string[] }>();
    const topicParam = params?.topic_id;
    const clusterId = Array.isArray(topicParam) ? topicParam[0] : topicParam;

    const router = useRouter();
    const { cluster, error, isLoading, refreshCluster } =
        veilleService.useClusterDetail(clusterId);
    const { imageUrls } = veilleService.useClusterImage(clusterId);
    const [publishing, setPublishing] = useState(false);
    const [settingAccess, setSettingAccess] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [reverting, setReverting] = useState(false);
    const [editing, setEditing] = useState(false);
    const [regenImages, setRegenImages] = useState(false);
    const [imgNotice, setImgNotice] = useState<string | null>(null);
    const [genNotice, setGenNotice] = useState<string | null>(null);

    async function regenerateImages() {
        if (!cluster) return;
        setRegenImages(true);
        setImgNotice(null);
        try {
            await veilleService.generateSlideImages(cluster.id);
            setImgNotice(
                "Régénération des images lancée — elles apparaîtront dans quelques instants. Rafraîchissez pour voir le résultat.",
            );
        } catch {
            setImgNotice("Impossible de régénérer les images des slides.");
        } finally {
            setRegenImages(false);
        }
    }

    async function revertToAi() {
        if (!cluster) return;
        const ok = window.confirm(
            "Revenir à la version générée par l'IA ?\n\n" +
                "Vos modifications (synthèse, slides, couverture) seront remplacées par " +
                "l'original IA. Cette version originale n'est jamais perdue.",
        );
        if (!ok) return;
        setReverting(true);
        try {
            await veilleService.revertCluster(cluster.id);
            await refreshCluster();
        } catch {
            window.alert("Impossible de restaurer la version IA.");
        } finally {
            setReverting(false);
        }
    }

    async function togglePublish() {
        if (!cluster) return;
        setPublishing(true);
        try {
            await veilleService.updateCluster(cluster.id, {
                is_published: !cluster.is_published,
            });
            await refreshCluster();
        } catch {
            window.alert("Impossible de mettre à jour la publication du sujet.");
        } finally {
            setPublishing(false);
        }
    }

    async function toggleAccess() {
        if (!cluster) return;
        setSettingAccess(true);
        try {
            // Bascule rapide Gratuit ⇄ Premium sans passer par le mode édition.
            await veilleService.updateCluster(cluster.id, { is_premium: !cluster.is_premium });
            await refreshCluster();
        } catch {
            window.alert("Impossible de changer l'accès du sujet.");
        } finally {
            setSettingAccess(false);
        }
    }

    async function generateContent() {
        if (!cluster) return;
        setGenerating(true);
        setGenNotice(null);
        try {
            // Route combinée : génère résumé + slides (tâche asynchrone Celery).
            await veilleService.generateClusterContent(cluster.id);
            setGenNotice(
                "Génération lancée — le résumé et les slides apparaîtront dans quelques instants.",
            );
        } catch {
            setGenNotice("Impossible de lancer la génération du contenu.");
        } finally {
            setGenerating(false);
        }
    }

    async function removeCluster() {
        if (!cluster) return;
        const ok = window.confirm(
            `Supprimer le cluster « ${cluster.title.slice(0, 60)} » ?\n\n` +
                "Le résumé et les slides sont supprimés. Les articles restent (ils redeviennent " +
                "non clusterisés). Action irréversible.",
        );
        if (!ok) return;
        setDeleting(true);
        try {
            await veilleService.deleteCluster(cluster.id);
            router.push("/dashboard/topics");
        } catch {
            window.alert("Impossible de supprimer le cluster.");
            setDeleting(false);
        }
    }

    const slides = cluster?.slides ?? [];
    const articles = cluster?.articles ?? [];
    // Couverture validée par l'éditeur en priorité, sinon image dérivée du
    // meilleur article (rétro-compat clusters sans couverture).
    const heroImage = cluster?.cover_image_url || imageUrls?.[0];
    const hasContent = Boolean(cluster?.summary_article) && slides.length > 0;

    const carouselItems =
        slides.length > 0
            ? slides.map((item, idx) => (
                  <div
                      key={`${item.slide}-${idx}`}
                      className="relative flex min-h-[260px] flex-col items-center justify-center overflow-hidden rounded-lg bg-black bg-cover bg-center px-16 py-8 text-center text-white"
                      style={
                          item.image_url ? { backgroundImage: `url(${item.image_url})` } : undefined
                      }
                  >
                      {item.image_url && <div className="absolute inset-0 bg-black/55" />}
                      <div className="relative z-10">
                          <span className="text-sm opacity-70">
                              {`Slide ${idx + 1} sur ${slides.length}`}
                          </span>
                          <p className="text-md mt-3 pb-5">{item.texte}</p>
                      </div>
                  </div>
              ))
            : [
                  <div
                      key="no-slides"
                      className="py-8 px-16 text-center bg-black text-white rounded-lg"
                  >
                      <span className="text-sm opacity-60">{"Aucune slide disponible"}</span>
                      <p className="text-md mt-3 pb-5">
                          {"Le carrousel de ce cluster n'a pas encore été généré."}
                      </p>
                  </div>,
              ];

    if (isLoading) {
        return (
            <div className="w-full mx-auto max-w-3xl py-16 px-10 text-center text-sm text-black/60">
                {"Chargement du sujet..."}
            </div>
        );
    }

    if (error || !cluster) {
        return (
            <div className="w-full mx-auto max-w-3xl py-16 px-10 text-center text-sm text-red-600">
                {"Sujet introuvable."}
            </div>
        );
    }

    return (
        <div className="w-full mx-auto max-w-3xl py-8 sm:py-16 px-4 sm:px-10 space-y-8 sm:space-y-10">
            <Link
                href="/dashboard/topics"
                className="md:hidden inline-flex items-center gap-1 text-sm text-black/60 hover:text-black"
            >
                {"← Retour aux sujets"}
            </Link>
            <div className="text-center space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Badge color={cluster.is_published ? "success" : "gray"}>
                        {cluster.is_published ? "Publié" : "Brouillon"}
                    </Badge>
                    <Badge color={cluster.is_premium ? "brand" : "gray"}>
                        {cluster.is_premium ? "Premium" : "Gratuit"}
                    </Badge>
                    {cluster.is_edited && (
                        <Badge color="warning">{"Édité"}</Badge>
                    )}
                    {!editing && (
                        <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                            {"Modifier"}
                        </Button>
                    )}
                    {!editing && cluster.is_edited && (
                        <Button
                            size="sm"
                            variant="tertiary"
                            disabled={reverting}
                            onClick={revertToAi}
                        >
                            {reverting ? "..." : "Revenir à la version IA"}
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant={cluster.is_published ? "secondary" : "primary"}
                        disabled={publishing}
                        onClick={togglePublish}
                    >
                        {publishing
                            ? "..."
                            : cluster.is_published
                              ? "Dépublier"
                              : "Publier sur le site"}
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        disabled={settingAccess}
                        onClick={toggleAccess}
                        title="Premium = réservé aux comptes ; Gratuit = visible par tous"
                    >
                        {settingAccess
                            ? "..."
                            : cluster.is_premium
                              ? "Rendre gratuit"
                              : "Passer en premium"}
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary-destructive"
                        disabled={deleting}
                        onClick={removeCluster}
                    >
                        {deleting ? "..." : "Supprimer"}
                    </Button>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl leading-[140%] font-bold">
                    {cluster.title}
                </h2>
                <div className="flex items-center justify-center gap-2 mb-1 text-sm font-medium">
                    {cluster.category?.name && (
                        <>
                            <span>{cluster.category.name}</span>
                            <span>&bull;</span>
                        </>
                    )}
                    <span>{new Date(cluster.created_at).toLocaleDateString("fr-FR")}</span>
                    <span>&bull;</span>
                    <span>{`${articles.length} article${articles.length > 1 ? "s" : ""}`}</span>
                </div>
            </div>

            {editing ? (
                <ClusterEditor
                    cluster={cluster}
                    onDone={() => {
                        setEditing(false);
                        refreshCluster();
                    }}
                />
            ) : (
              <>
            {!hasContent && (
                <div className="rounded-lg border border-black/10 bg-black/[0.02] p-5 text-center space-y-3">
                    <p className="text-sm text-black/70">
                        {"Ce cluster n'a pas encore de résumé ni de slides."}
                    </p>
                    <Button
                        size="md"
                        variant="primary"
                        disabled={generating}
                        onClick={generateContent}
                    >
                        {generating ? "Génération..." : "Générer le contenu"}
                    </Button>
                    {genNotice && <p className="text-sm text-black/60">{genNotice}</p>}
                    {genNotice && (
                        <Button size="sm" variant="secondary" onClick={() => refreshCluster()}>
                            {"Rafraîchir"}
                        </Button>
                    )}
                </div>
            )}

            <div
                className="h-56 sm:h-[400px] rounded-lg relative bg-black bg-cover bg-center"
                style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
            />

            {cluster.summary_article && <div>{renderMarkdown(cluster.summary_article)}</div>}

            <div>
                {slides.length > 0 && (
                    <div className="mb-3 flex flex-wrap items-center justify-end gap-3">
                        {imgNotice && (
                            <span className="text-sm text-black/60">{imgNotice}</span>
                        )}
                        <Button
                            size="sm"
                            variant="secondary"
                            disabled={regenImages}
                            onClick={regenerateImages}
                        >
                            {regenImages ? "..." : "Régénérer les images"}
                        </Button>
                    </div>
                )}
                <Carousel items={carouselItems} opts={{ loop: true }} />
            </div>
              </>
            )}

            <div>
                <h1 className="text-lg font-semibold">{`${articles.length} source${articles.length > 1 ? "s" : ""}`}</h1>
                <ul className="space-y-2 mt-4">
                    {articles.length === 0 && (
                        <li className="text-sm text-black/60">
                            {"Aucun article rattaché à ce cluster."}
                        </li>
                    )}
                    {articles.map(article => (
                        <li key={article.id}>
                            <a
                                href={article.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="gap-3 sm:gap-4 flex items-start justify-between bg-black/5 rounded-lg p-5 hover:bg-black/10"
                            >
                                <div className="w-full truncate">
                                    <p className="block truncate w-full font-semibold text-md">
                                        {article.title}
                                    </p>
                                    <div className="flex items-center gap-2 mb-1 text-sm font-medium">
                                        <span>{article.source_name}</span>
                                        {article.publication_date && (
                                            <>
                                                <span>&bull;</span>
                                                <span>
                                                    {new Date(article.publication_date).toLocaleDateString("fr-FR")}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center justify-center">
                                    <ArrowUpRightIcon size={18} />
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

