"use client";

import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import veilleService, { ArticleStatus } from "@/lib/api/veille.service";

const STATUS_BADGE: Record<ArticleStatus, { label: string; color: "success" | "warning" | "gray" }> = {
    PROCESSED: { label: "Complet", color: "success" },
    PENDING: { label: "En attente", color: "warning" },
    FAILED: { label: "Échec", color: "gray" },
};

function formatDate(iso?: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function OneArticle() {
    const params = useParams<{ article_id?: string | string[] }>();
    const raw = params?.article_id;
    const articleId = Array.isArray(raw) ? raw[0] : raw;

    const { article, error, isLoading } = veilleService.useArticle(articleId);

    if (isLoading) {
        return (
            <section className="main-container pt-10 pb-16 text-sm text-black/60">
                {"Chargement de l'article..."}
            </section>
        );
    }

    if (error || !article) {
        return (
            <section className="main-container pt-10 pb-16 text-sm text-red-600">
                {"Article introuvable."}
            </section>
        );
    }

    const statusInfo = STATUS_BADGE[article.status];
    const score = article.analysis?.score_pertinence;
    const thumb = article.image_urls?.[0];

    return (
        <section className="main-container pt-10 pb-16">
            <Breadcrumb
                items={[
                    { href: "/dashboard/scraping-articles", label: "Articles" },
                    { label: article.title },
                ]}
                variant="text"
                separator="icon"
                showHomeIcon={false}
            />
            <div className="flex items-start justify-between gap-4 mb-4 mt-10">
                <div className="w-full max-w-[600px]">
                    <h1 className="text-lg font-semibold">{article.title}</h1>
                    <p className="text-sm mt-1 opacity-60">{article.source_name}</p>
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                        <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                        {typeof score === "number" && (
                            <Badge color="blue">{`Score ${score}/10`}</Badge>
                        )}
                        <a
                            href={article.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline opacity-70 hover:opacity-100"
                        >
                            {"Voir la source ↗"}
                        </a>
                    </div>
                </div>
                {thumb && (
                    <div
                        className="w-[180px] h-[120px] rounded-lg bg-black/10 bg-cover bg-center shrink-0"
                        style={{ backgroundImage: `url(${thumb})` }}
                    />
                )}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-10">
                <Card
                    className="w-full"
                    content={
                        <>
                            <h1 className="font-bold text-xl">{formatDate(article.scraping_date)}</h1>
                            <p className="text-sm">Date de la récupération</p>
                        </>
                    }
                />
                <Card
                    className="w-full"
                    content={
                        <>
                            <h1 className="font-bold text-xl">{formatDate(article.publication_date)}</h1>
                            <p className="text-sm">Date de publication source</p>
                        </>
                    }
                />
                <Card
                    className="w-full"
                    content={
                        <>
                            <h1 className="font-bold text-xl">
                                {article.cluster_id ? `#${article.cluster_id}` : "—"}
                            </h1>
                            <p className="text-sm">Cluster rattaché</p>
                        </>
                    }
                />
            </div>

            {article.analysis && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Section title="Résumé stratégique">{article.analysis.resume_strategique}</Section>
                    <Section title="Impact Afrique">{article.analysis.impact_afrique}</Section>
                    <Section title="Problématique africaine">
                        {article.analysis.problematique_africaine}
                    </Section>
                    <Section title="Éveil de conscience">{article.analysis.eveil_de_conscience}</Section>
                    <Section title="Piste d'opportunité">{article.analysis.piste_opportunite}</Section>
                    <Section title="Leçon à retenir">{article.analysis.lecon_a_retenir}</Section>
                </div>
            )}

            {article.content && (
                <div className="mt-12">
                    <h2 className="text-lg font-semibold mb-3">{"Contenu scrapé"}</h2>
                    <div className="bg-black/5 rounded-lg p-5 whitespace-pre-wrap text-sm leading-relaxed">
                        {article.content}
                    </div>
                </div>
            )}
        </section>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-black/5 rounded-lg p-5">
            <h3 className="text-sm font-semibold mb-2 opacity-70">{title}</h3>
            <p className="text-sm leading-relaxed">{children}</p>
        </div>
    );
}
