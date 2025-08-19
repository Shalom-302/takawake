"use client";

import MainLayout from "@/components/layouts/main-layout";
import { Hero, Features, HowItWorks, Stats, CTA, Testimonials } from "@/components/sections/home";
import AnalyticsExample from "@/components/examples/analytics-example";

export default function Home() {
    return (
        <MainLayout>
            <Hero />
            <Stats />
            <Features />
            <HowItWorks />
            <Testimonials />
            <Stats />
            <CTA />

            {/* Exemple d'utilisation des cookies pour l'analyse */}
            <div className="container mx-auto py-8">
                <h2 className="text-2xl font-bold mb-4">Cookie Consent Example</h2>
                <div className="max-w-2xl mx-auto">
                    <AnalyticsExample />
                </div>
            </div>
        </MainLayout>
    );
}
