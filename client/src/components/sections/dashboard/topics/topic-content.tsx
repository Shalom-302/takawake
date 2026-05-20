"use client";

import { useParams } from "next/navigation";
import { ArrowUpRightIcon } from "@/components/icons";
import { Carousel } from "@/components/ui/carousel";
import veilleService from "@/lib/api/veille.service";

export default function TopicContent() {
    const params = useParams<{ topic_id?: string | string[] }>();
    const topicParam = params?.topic_id;
    const clusterId = Array.isArray(topicParam) ? topicParam[0] : topicParam;

    const { cluster, error, isLoading } = veilleService.useClusterDetail(clusterId);
    const { imageUrls } = veilleService.useClusterImage(clusterId);

    const slides = cluster?.slides ?? [];
    const articles = cluster?.articles ?? [];
    const heroImage = imageUrls?.[0];

    const carouselItems =
        slides.length > 0
            ? slides.map((item, idx) => (
                  <div
                      key={`${item.slide}-${idx}`}
                      className="pt-8 pb-3 px-16 text-center bg-black text-white rounded-lg min-h-[200px]"
                  >
                      <span className="text-sm opacity-60">
                          {`Slide ${idx + 1} sur ${slides.length}`}
                      </span>
                      <p className="text-md mt-3 pb-5">{item.texte}</p>
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
        <div className="w-full mx-auto max-w-3xl py-16 px-10 space-y-10">
            <div className="text-center space-y-2">
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

            <div
                className="h-[400px] rounded-lg relative bg-black bg-cover bg-center"
                style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
            />

            {cluster.summary_article && <div>{FormatText(cluster.summary_article)}</div>}

            <div>
                <Carousel items={carouselItems} opts={{ loop: true }} />
            </div>

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

function FormatText(raw?: string | null) {
    if (!raw) return null;

    const blocks = raw.trim().split(/\n{2,}/);

    return blocks.map((block, i) => {
        const trimmed = block.trim();

        if (/^[-]{3,}$/.test(trimmed)) {
            return <hr key={`hr-${i}`} className="my-4 border-black/10" />;
        }

        const h2Match = trimmed.match(/^\*\*(.+?)\*\*$/);
        if (h2Match) {
            return (
                <h2 key={`h2-${i}`} className="text-xl font-bold mt-6 mb-2 leading-snug">
                    {h2Match[1]}
                </h2>
            );
        }

        const h3Match = trimmed.match(/^\*\*(.+?)\*\*\s*:?\s*(.+)$/);
        if (h3Match) {
            return (
                <div key={`sub-${i}`}>
                    <h3 className="text-base font-semibold mt-4 mb-1">{h3Match[1]}</h3>
                    <p className="text-sm leading-relaxed">{h3Match[2]}</p>
                </div>
            );
        }

        return (
            <p key={`p-${i}`} className="leading-relaxed mb-4">
                {trimmed.split(/\n/).map((line, idx, arr) => (
                    <span key={idx}>
                        {line}
                        {idx < arr.length - 1 && <br />}
                    </span>
                ))}
            </p>
        );
    });
}
