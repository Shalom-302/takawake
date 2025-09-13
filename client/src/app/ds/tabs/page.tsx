"use client";

import React from "react";
import Link from "next/link";
import { Tabs } from "@/components/ui/tabs";

export default function TabsPage() {
    const tabItems = [
        {
            value: "tab1",
            label: "Premier onglet",
            badge: 5,
            content: <div className="p-4">Contenu du premier onglet</div>,
        },
        {
            value: "tab2",
            label: "Deuxième onglet",
            badge: "New",
            content: <div className="p-4">Contenu du deuxième onglet</div>,
        },
        {
            value: "tab3",
            label: "Troisième onglet",
            content: <div className="p-4">Contenu du troisième onglet</div>,
        },
    ];
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Tabs</h1>
                <p className="text-muted-foreground mt-2">
                    Simplified API for the Tabs component, allowing you to define tabs and their
                    content in one go.
                </p>
            </div>
            <div className="space-y-16">
                {/* Button Brand Horizontal (défaut) */}
                <Tabs items={tabItems} defaultValue="tab1" />

                {/* Button Gray Horizontal */}
                <Tabs items={tabItems} type="button-gray" defaultValue="tab1" />

                {/* Button Border Horizontal */}
                <Tabs items={tabItems} type="button-border" defaultValue="tab1" />

                {/* Button Minimal Horizontal */}
                <Tabs items={tabItems} type="button-minimal" defaultValue="tab1" />

                {/* Underline Horizontal */}
                <Tabs items={tabItems} type="underline" defaultValue="tab1" />

                {/* Underline Full Width */}
                <Tabs items={tabItems} type="underline" fullWidth={true} defaultValue="tab1" />

                {/* Button Brand Vertical */}
                <Tabs
                    items={tabItems}
                    type="button-brand"
                    orientation="vertical"
                    defaultValue="tab1"
                />

                {/* Button Gray Vertical */}
                <Tabs
                    items={tabItems}
                    type="button-gray"
                    orientation="vertical"
                    defaultValue="tab1"
                />

                {/* Button Border Vertical */}
                <Tabs
                    items={tabItems}
                    type="button-border"
                    orientation="vertical"
                    defaultValue="tab1"
                />

                {/* Button Minimal Vertical */}
                <Tabs
                    items={tabItems}
                    type="button-minimal"
                    orientation="vertical"
                    defaultValue="tab1"
                />

                {/* Line Vertical */}
                <Tabs items={tabItems} type="line" orientation="vertical" defaultValue="tab1" />
            </div>
        </div>
    );
}
