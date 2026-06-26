"use client";

import { Suspense } from "react";
import ALaUne from "@/components/sections/feed/a-la-une";

export default function Home() {
    return (
        <Suspense fallback={<div className="h-screen w-full bg-white" />}>
            <ALaUne />
        </Suspense>
    );
}
