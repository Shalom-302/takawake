"use client";

import { useRouter } from "next/navigation";
import FeedShell from "@/components/layouts/feed-shell";
import Article from "@/components/sections/topic/article";
import { type FeedView } from "@/components/sections/feed/feed-sidebar";

export default function Home() {
    const router = useRouter();
    // La page article réutilise le shell du feed : cliquer une vue dans la sidebar
    // ramène à l'accueil sur la vue choisie (deep-link `?view=`).
    return (
        <FeedShell view={null} onViewChange={(v: FeedView) => router.push(`/?view=${v}`)}>
            <div className="min-h-0 flex-1 overflow-y-auto">
                <Article />
            </div>
        </FeedShell>
    );
}
