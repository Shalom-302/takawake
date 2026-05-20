"use client";

import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { DropdownDotsButton, DropdownMenu } from "@/components/ui/dropdown-menu";
import veilleService, { ArticleStatus, VeilleStatus } from "@/lib/api/veille.service";

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

export default function OneMonitoring() {
    const router = useRouter();
    const params = useParams<{ tech_id?: string | string[] }>();
    const raw = params?.tech_id;
    const veilleIdStr = Array.isArray(raw) ? raw[0] : raw;
    const veilleIdNum = veilleIdStr ? Number(veilleIdStr) : undefined;

    const { veille, error: veilleError, isLoading: veilleLoading } =
        veilleService.useVeille(veilleIdStr);
    const { articles, isLoading: articlesLoading } = veilleService.useArticles(
        veilleIdNum ? { veille_id: veilleIdNum, limit: 500 } : undefined,
    );

    if (veilleLoading) {
        return (
            <section className="main-container pt-10 pb-16 text-sm text-black/60">
                {"Chargement de la veille..."}
            </section>
        );
    }

    if (veilleError || !veille) {
        return (
            <section className="main-container pt-10 pb-16 text-sm text-red-600">
                {"Veille introuvable."}
            </section>
        );
    }

    const list = articles ?? [];
    const total = list.length;
    const processed = list.filter(a => a.status === "PROCESSED").length;
    const failed = list.filter(a => a.status === "FAILED").length;
    const statusInfo = VEILLE_BADGE[veille.status];

    return (
        <section className="main-container pt-10 pb-16">
            <Breadcrumb
                items={[
                    { href: "/dashboard/tech-monitoring", label: "Veilles" },
                    { label: veille.prompt },
                ]}
                variant="text"
                separator="icon"
                showHomeIcon={false}
            />
            <div className="flex items-end justify-between gap-4 mb-4 mt-10">
                <div className="w-full max-w-[600px]">
                    <h1 className="text-lg font-semibold">{veille.prompt}</h1>
                    <p className="text-sm mt-1 opacity-60">
                        {`Lancée le ${new Date(veille.created_at).toLocaleString("fr-FR")}`}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                        <Badge color={statusInfo.color} size="md">
                            {statusInfo.label}
                        </Badge>
                        {veille.llm_provider && (
                            <Badge color="blue" size="md">
                                {veille.llm_provider}
                            </Badge>
                        )}
                        {veille.status_message && (
                            <span className="text-sm opacity-60">{veille.status_message}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-10">
                <Card
                    className="w-full"
                    content={
                        <>
                            <h1 className="font-bold text-xl">{total}</h1>
                            <p className="text-sm">Articles récupérés</p>
                        </>
                    }
                />
                <Card
                    className="w-full"
                    content={
                        <>
                            <h1 className="font-bold text-xl">{processed}</h1>
                            <p className="text-sm">Articles complets</p>
                        </>
                    }
                />
                <Card
                    className="w-full"
                    content={
                        <>
                            <h1 className="font-bold text-xl">{failed}</h1>
                            <p className="text-sm">Articles en échec</p>
                        </>
                    }
                />
            </div>

            <div className="mt-12 border-t border-black/10">
                {articlesLoading && (
                    <div className="py-6 px-4 text-sm text-black/60">
                        {"Chargement des articles..."}
                    </div>
                )}
                {!articlesLoading && list.length === 0 && (
                    <div className="py-6 px-4 text-sm text-black/60">
                        {"Aucun article associé à cette veille."}
                    </div>
                )}
                {list.map(article => {
                    const aBadge = ARTICLE_BADGE[article.status];
                    const thumb = article.image_urls?.[0];
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
                                    <Badge color={aBadge.color}>{aBadge.label}</Badge>
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
