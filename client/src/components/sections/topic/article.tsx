"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge";
import { Carousel } from "@/components/ui/carousel";
import { ArrowUpRightIcon } from "@/components/icons";
import veilleService from "@/lib/api/veille.service";
import { formatLongDate } from "@/lib/format-date";

export default function Article() {
    const params = useParams<{ article_id?: string | string[] }>();
    const articleParam = params?.article_id;
    const clusterId = Array.isArray(articleParam) ? articleParam[0] : articleParam;

    const { cluster, isLoading, error } = veilleService.useClusterDetail(clusterId);
    const { imageUrls } = veilleService.useClusterImage(clusterId);
    const heroImage = imageUrls?.[0];

    const slides = cluster?.slides ?? [];
    const articles = cluster?.articles ?? [];

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
            : [];

    if (isLoading) {
        return (
            <div className="main-container py-24 text-center text-sm text-black/60">
                {"Chargement du sujet..."}
            </div>
        );
    }

    if (error || !cluster) {
        return (
            <div className="main-container py-24 text-center text-sm text-red-600">
                {"Sujet introuvable."}
            </div>
        );
    }

    return (
        <>
            <section className=" relative before:content-[''] before:absolute before:h-[500px] lg:before:h-[430px] before:w-full before:bg-(--blue-tekawake-50) ">
                <div className="main-container relative">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="lg:pr-10">
                            <div className="lg:min-h-[430px] pt-[70px] md:pt-[100px] w-full">
                                <div className="border-t-3 border-black inline-block pt-1 ">
                                    <span className="font-semibold text-sm">
                                        {(cluster.category?.name ?? "Tekawake").toUpperCase()}
                                    </span>
                                </div>
                                <div className="space-y-4 lg:mb-8 mt-4">
                                    <h1 className="text-lg sm:text-xl md:text-2xl leading-[140%] font-bold sm:line-clamp-3 ">
                                        {cluster.title}
                                    </h1>
                                    <div className="flex items-center gap-2 text-sm font-medium text-(--black-tekawake-300)">
                                        <span>{formatLongDate(cluster.created_at)}</span>
                                        <span>&bull;</span>
                                        <span>{`${articles.length} source${articles.length > 1 ? "s" : ""}`}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:min-h-[430px] pt-10 lg:pt-[100px] ">
                            <div className="w-full">
                                <div
                                    className="h-[400px] bg-black rounded-lg relative overflow-hidden bg-cover bg-center"
                                    style={
                                        heroImage
                                            ? { backgroundImage: `url(${heroImage})` }
                                            : undefined
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-24 pb-28">
                <div className="main-container">
                    <div className="max-w-4xl mx-auto space-y-10">
                        {cluster.summary_article ? (
                            <div className="prose-tekawake">
                                {renderRichText(cluster.summary_article)}
                            </div>
                        ) : (
                            <p className="text-sm text-black/60">
                                {"Le résumé de ce sujet n'a pas encore été généré."}
                            </p>
                        )}

                        {carouselItems.length > 0 && (
                            <div>
                                <Carousel items={carouselItems} opts={{ loop: true }} />
                            </div>
                        )}

                        {cluster.category && (
                            <div className="mt-12 flex flex-wrap gap-3">
                                <Link href={`/topic/one/${cluster.category.id}`}>
                                    <Badge variant="pill-color" size={"lg"}>
                                        {cluster.category.name}
                                    </Badge>
                                </Link>
                            </div>
                        )}

                        {articles.length > 0 && (
                            <div className="mt-12">
                                <h2 className="text-lg font-semibold mb-4">
                                    {`${articles.length} source${articles.length > 1 ? "s" : ""}`}
                                </h2>
                                <ul className="space-y-2">
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
                                                                    {formatLongDate(
                                                                        article.publication_date,
                                                                    )}
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
                        )}

                        <div className="mt-12">
                            <Button className="w-full" size={"xl"} variant="primary" asChild>
                                <Link href={"/"}>{"Retour à l'accueil"}</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

function renderRichText(raw: string) {
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
