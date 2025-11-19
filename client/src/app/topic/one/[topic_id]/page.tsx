"use client";

import MainLayout from "@/components/layouts/main-layout";
import HeroSection from "@/components/sections/landing/hero";
import Topic from "@/components/sections/topic/topic";

export default function Home() {
    return (
        <MainLayout>
            <Topic />
        </MainLayout>
    );
}
