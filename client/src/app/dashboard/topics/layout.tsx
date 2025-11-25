"use client";

import veilleService from "@/lib/api/veille.service";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export default function TopicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { clusters, error, isLoading } = veilleService.useClusters();
    const clusterList = clusters ?? [];
    const params = useParams<{ topic_id?: string | string[] }>();
    const topicParam = params?.topic_id;
    const currentTopic = Array.isArray(topicParam) ? topicParam[0] : topicParam;
    const currentTopicDecoded = currentTopic ? decodeURIComponent(currentTopic) : null;

    return (
        <>
            <section className="flex">
                <div>
                    <div className="border-r border-black/10 w-[450px] shrink-0 sticky top-0 h-screen overflow-auto">
                        <div className="flex flex-col">
                            <div className="px-4 py-6 border-b border-black/5 sticky top-0 bg-white mb-4">
                                <h1 className="text-lg font-semibold">{"Sujets générés"}</h1>
                                <p className="text-sm mt-1">
                                    {
                                        "Proin ultricies faucibus ante nec interdum, posuere ante nec, venenatis massa."
                                    }
                                </p>
                            </div>
                            <ul className="space-y-1 h-full px-4">
                                {isLoading && (
                                    <li className="text-sm text-black/60 px-2 py-3">
                                        {"Chargement des sujets..."}
                                    </li>
                                )}
                                {error && (
                                    <li className="text-sm text-red-600 px-2 py-3">
                                        {"Impossible de charger les sujets."}
                                    </li>
                                )}
                                {!isLoading && !error && clusterList.length === 0 && (
                                    <li className="text-sm text-black/60 px-2 py-3">
                                        {"Aucun sujet disponible pour le moment."}
                                    </li>
                                )}
                                {clusterList.map((cluster, i) => (
                                    <li key={`${cluster.sujet_cluster}-${i}`}>
                                        <Link href={`/dashboard/topics/${encodeURIComponent(cluster.sujet_cluster)}`}>
                                            <div
                                                className={cn(
                                                    "gap-3 sm:gap-4 flex items-center rounded-lg p-4 cursor-pointer",
                                                    currentTopicDecoded === cluster.sujet_cluster
                                                        ? "bg-black/5"
                                                        : "sm:hover:bg-black/5"
                                                )}
                                            >
                                                <div className="h-16 sm:h-24 w-16 sm:w-24 shrink-0 bg-black/5 rounded-lg"></div>
                                                <div className="w-full">
                                                    <span className="text-xs font-medium text-black/60">
                                                        {"Il y a 35 minutes"}
                                                    </span>
                                                    <p className="block line-clamp-2 w-full font-semibold text-md">
                                                        {cluster.sujet_cluster ||
                                                            "Sujet de cluster"}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <section className="w-full h-screen overflow-scroll">{children}</section>
            </section>
        </>
    );
}
