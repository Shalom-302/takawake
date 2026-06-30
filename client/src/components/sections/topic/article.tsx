"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge";
import { Carousel } from "@/components/ui/carousel";
import { ArrowUpRightIcon } from "@/components/icons";
import veilleService, { resolveImageUrl } from "@/lib/api/veille.service";
import { formatLongDate } from "@/lib/format-date";
import { renderMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils/cn";

export default function Article() {
    const params = useParams<{ article_id?: string | string[] }>();
    const articleParam = params?.article_id;
    const clusterId = Array.isArray(articleParam) ? articleParam[0] : articleParam;

    const { cluster, isLoading, error } = veilleService.useClusterDetail(clusterId);
    const { imageUrls } = veilleService.useClusterImage(clusterId);
    // Couverture validée par l'éditeur en priorité, sinon image dérivée du meilleur article.
    const heroImage = resolveImageUrl(cluster?.cover_image_url || imageUrls?.[0]);

    const slides = cluster?.slides ?? [];
    const articles = cluster?.articles ?? [];

    const carouselItems =
        slides.length > 0
            ? slides.map((item, idx) => {
                  const slideImg = resolveImageUrl(item.image_url);
                  return (
                  <div
                      key={`${item.slide}-${idx}`}
                      className="relative flex min-h-[260px] flex-col items-center justify-center overflow-hidden rounded-lg bg-black bg-cover bg-center px-16 py-8 text-center text-white"
                      style={
                          slideImg ? { backgroundImage: `url(${slideImg})` } : undefined
                      }
                  >
                      {slideImg && <div className="absolute inset-0 bg-black/55" />}
                      <div className="relative z-10">
                          <span className="text-sm opacity-70">
                              {`Slide ${idx + 1} sur ${slides.length}`}
                          </span>
                          <p className="text-md mt-3 pb-5">{item.texte}</p>
                      </div>
                  </div>
                  );
              })
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
                                        <span>{formatLongDate(cluster.published_date ?? cluster.created_at)}</span>
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
                            <div
                                className={
                                    cluster.locked
                                        ? "prose-tekawake relative max-h-[280px] overflow-hidden after:absolute after:inset-x-0 after:bottom-0 after:h-32 after:bg-gradient-to-t after:from-white after:to-transparent"
                                        : "prose-tekawake"
                                }
                            >
                                {renderMarkdown(cluster.summary_article)}
                            </div>
                        ) : (
                            <p className="text-sm text-black/60">
                                {"Le résumé de ce sujet n'a pas encore été généré."}
                            </p>
                        )}

                        {cluster.locked && (
                            <div className="rounded-xl border border-(--purple-dreams-200) bg-(--blue-tekawake-50) p-8 text-center">
                                <h2 className="text-xl font-bold">
                                    {"Article réservé aux membres"}
                                </h2>
                                <p className="mt-2 text-sm text-black/70">
                                    {"Créez un compte gratuit pour lire l'article en entier, voir le carrousel et les sources."}
                                </p>
                                <div className="mt-5 flex flex-wrap justify-center gap-3">
                                    <Link
                                        href="/auth/register"
                                        className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
                                    >
                                        {"Créer un compte gratuit"}
                                    </Link>
                                    <Link
                                        href="/auth/login"
                                        className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
                                    >
                                        {"J'ai déjà un compte"}
                                    </Link>
                                </div>
                            </div>
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
                            <Link
                                href="/"
                                className={cn(buttonVariants({ variant: "primary", size: "xl" }), "w-full")}
                            >
                                {"Retour à l'accueil"}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

