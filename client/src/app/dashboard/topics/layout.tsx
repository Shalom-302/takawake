"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import veilleService from "@/lib/api/veille.service";

export default function TopicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { clusters, error, isLoading } = veilleService.useClusters({ limit: 200 });
    const clusterList = clusters ?? [];
    const params = useParams<{ topic_id?: string | string[] }>();
    const topicParam = params?.topic_id;
    const currentTopic = Array.isArray(topicParam) ? topicParam[0] : topicParam;
    const currentId = currentTopic ? Number(currentTopic) : null;

    return (
        <section className="flex">
            <aside className="border-r border-black/10 w-[380px] shrink-0 sticky top-0 h-screen overflow-auto">
                <div className="flex flex-col">
                    <div className="px-4 py-6 border-b border-black/5 sticky top-0 bg-white mb-2">
                        <h1 className="text-lg font-semibold">{"Sujets générés"}</h1>
                        <p className="text-sm mt-1 opacity-60">
                            {"Clusters issus de l'analyse des veilles."}
                        </p>
                    </div>
                    <ul className="space-y-1 px-2 pb-4">
                        {isLoading && (
                            <li className="text-sm text-black/60 px-2 py-3">
                                {"Chargement..."}
                            </li>
                        )}
                        {error && (
                            <li className="text-sm text-red-600 px-2 py-3">
                                {"Impossible de charger les sujets."}
                            </li>
                        )}
                        {!isLoading && !error && clusterList.length === 0 && (
                            <li className="text-sm text-black/60 px-2 py-3">
                                {"Aucun cluster pour le moment."}
                            </li>
                        )}
                        {clusterList.map(cluster => (
                            <li key={cluster.id}>
                                <Link
                                    href={`/dashboard/topics/${cluster.id}`}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg p-3 cursor-pointer",
                                        currentId === cluster.id ? "bg-black/10" : "hover:bg-black/5",
                                    )}
                                >
                                    <div className="h-14 w-14 shrink-0 bg-black/5 rounded-lg" />
                                    <div className="w-full min-w-0">
                                        <p className="line-clamp-2 font-semibold text-sm">
                                            {cluster.title}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-xs opacity-60">
                                            <span>
                                                {new Date(cluster.created_at).toLocaleDateString("fr-FR")}
                                            </span>
                                            {!cluster.is_published && (
                                                <>
                                                    <span>&bull;</span>
                                                    <span>{"Brouillon"}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
            <section className="w-full h-screen overflow-scroll">{children}</section>
        </section>
    );
}
