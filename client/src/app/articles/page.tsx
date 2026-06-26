"use client";

import { Suspense } from "react";
import MainLayout from "@/components/layouts/main-layout";
import AllArticles from "@/components/sections/articles/all-articles";

export default function ArticlesPage() {
    return (
        <MainLayout>
            {/* Suspense requis : AllArticles lit useSearchParams (param `q`). */}
            <Suspense fallback={null}>
                <AllArticles />
            </Suspense>
        </MainLayout>
    );
}
