"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LikeCommentSaveBar from "@/components/composites/like-comment-save-bar";
import {
    ArrowUpRightIcon,
    HeartIcon,
    MessageCircleTwoIcon,
    ShareSixIcon,
} from "@/components/icons";
import { Carousel } from "@/components/ui/carousel";
import veilleService from "@/lib/api/veille.service";
import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function TopicContent() {
    const params = useParams<{ topic_id?: string | string[] }>();
    const topicParam = params?.topic_id;
    const clusterId = Array.isArray(topicParam) ? topicParam[0] : topicParam;

    const { clusterSummary } = veilleService.useClusterSummary(clusterId);
    const slides = clusterSummary?.slides ?? [];

    const carouselItems =
        slides.length > 0
            ? slides.map((item, idx) => (
                  <div
                      key={`${item.slide ?? idx}-${item.texte?.slice(0, 10) ?? "slide"}`}
                      className="pt-8 pb-3 px-16 text-center bg-black text-white rounded-lg min-h-[200px] "
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
                          {"Le résumé de ce cluster n'a pas encore de slides."}
                      </p>
                  </div>,
              ];

    useEffect(() => {
        console.log("Cluster summary", clusterSummary);
    }, [clusterSummary]);

    return (
        <>
            <div className="w-full mx-auto max-w-3xl py-16 px-10 space-y-10">
                <div className="text-center space-y-2">
                    <h2 className="text-lg sm:text-xl md:text-2xl leading-[140%] font-bold">
                        {clusterSummary?.title}
                    </h2>
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="font-medium inline-block text-sm">
                            {"Il y 28 minutes"}
                        </span>
                        <span className="font-medium inline-block text-sm">&bull;</span>
                        <span className="font-medium inline-block text-sm">{"345 articles"}</span>
                    </div>
                </div>
                <div className="h-[400px] bg-black rounded-lg relative  "></div>
                <div>{FormatText(clusterSummary?.summary_article)}</div>
                <div className="">
                    <Carousel items={carouselItems} opts={{ loop: true }} />
                </div>
                <div>
                    <h1 className="text-lg font-semibold">{"345 sources"}</h1>
                    <ul className="space-y-2 mt-4">
                        {Array.from({ length: 34 }).map((_, i) => (
                            <li key={i}>
                                <div className="gap-3 sm:gap-4 flex items-start justify-between bg-black/5 rounded-lg p-5 cursor-pointer">
                                    <div className="w-full truncate">
                                        <p className="block truncate w-full font-semibold text-md">
                                            {
                                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vel tincidunt diam"
                                            }
                                        </p>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium inline-block text-sm">
                                                {"Nom de l'article ici"}
                                            </span>
                                            <span className="font-medium inline-block text-sm">
                                                &bull;
                                            </span>
                                            <span className="font-medium inline-block text-sm">
                                                {"Il y 28 minutes"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex items-center justify-center">
                                        <ArrowUpRightIcon size={18} />
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}


function FormatText(raw?: string) {
  if (!raw) return null;

  const blocks = raw.trim().split(/\n{2,}/); // paragraphes sur doubles sauts de ligne

  return blocks.map((block, i) => {
    const trimmed = block.trim();

    // Ligne de séparation
    if (/^[-]{3,}$/.test(trimmed)) {
      return <hr key={`hr-${i}`} className="my-4 border-black/10" />;
    }

    // Titre H2 (ex: **Titre ...**)
    const h2Match = trimmed.match(/^\*\*(.+?)\*\*$/);
    if (h2Match) {
      return (
        <h2 key={`h2-${i}`} className="text-xl font-bold mt-6 mb-2 leading-snug">
          {h2Match[1]}
        </h2>
      );
    }

    // Sous-titre H3 (ex: **Sous-titre :** ...)
    const h3Match = trimmed.match(/^\*\*(.+?)\*\*\s*:?\s*(.+)$/);
    if (h3Match) {
      return (
        <div key={`sub-${i}`}>
          <h3 className="text-base font-semibold mt-4 mb-1">{h3Match[1]}</h3>
          <p className="text-sm leading-relaxed">{h3Match[2]}</p>
        </div>
      );
    }

    // Paragraphe standard (garde les retours simples)
    return (
      <p key={`p-${i}`} className="leading-relaxed mb-4">
        {trimmed.split(/\n/).map((line, idx) => (
          <span key={idx}>
            {line}
            {idx < trimmed.split(/\n/).length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}
