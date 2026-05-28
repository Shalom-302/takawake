"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import veilleService from "@/lib/api/veille.service";

export default function AllTopics() {
    const [publishedOnly, setPublishedOnly] = useState(false);
    const { clusters, error, isLoading } = veilleService.useClusters(
        publishedOnly ? { is_published: true, limit: 200 } : { limit: 200 },
    );
    const clusterList = clusters ?? [];

    return (
        <section className="main-container pt-10 pb-16">
            <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-lg font-semibold">{"Sujets générés"}</h1>
                    <p className="text-sm mt-1">
                        {"Clusters issus de l'analyse des veilles."}
                    </p>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={publishedOnly}
                        onChange={e => setPublishedOnly(e.target.checked)}
                    />
                    {"Publiés uniquement"}
                </label>
            </div>

            <ul className="mt-12 border-t border-black/10">
                {isLoading && (
                    <li className="text-sm text-black/60 px-4 py-6">
                        {"Chargement des sujets..."}
                    </li>
                )}
                {error && (
                    <li className="text-sm text-red-600 px-4 py-6">
                        {"Impossible de charger les sujets."}
                    </li>
                )}
                {!isLoading && !error && clusterList.length === 0 && (
                    <li className="text-sm text-black/60 px-4 py-6">
                        {publishedOnly
                            ? "Aucun sujet publié."
                            : "Aucun cluster. Lance une veille pour en générer."}
                    </li>
                )}
                {clusterList.map(cluster => (
                    <li key={cluster.id} className="border-black/10 border-b">
                        <Link
                            href={`/dashboard/topics/${cluster.id}`}
                            className="flex items-center gap-4 py-4 px-4 hover:bg-black/5"
                        >
                            <div className="h-16 sm:h-20 w-16 sm:w-20 shrink-0 bg-black/5 rounded-lg" />
                            <div className="w-full">
                                <p className="block line-clamp-2 w-full font-semibold text-md">
                                    {cluster.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-sm opacity-60">
                                    {cluster.category?.name && (
                                        <span>{cluster.category.name}</span>
                                    )}
                                    {cluster.category?.name && <span>&bull;</span>}
                                    <span>{new Date(cluster.created_at).toLocaleDateString("fr-FR")}</span>
                                </div>
                            </div>
                            <Badge color={cluster.is_published ? "success" : "gray"}>
                                {cluster.is_published ? "Publié" : "Brouillon"}
                            </Badge>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
