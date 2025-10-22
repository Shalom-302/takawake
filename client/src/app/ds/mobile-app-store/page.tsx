"use client";

import React from "react";
import Link from "next/link";
import {
    AppStoreButtonVariants,
    MobileAppStore,
    SizeType,
    StoreType,
} from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";

export default function MobileAppStorePage() {
    const variants = [
        { name: "filled", description: "Dark background with subtle border" },
        { name: "outlined", description: "Transparent background with border" },
    ];

    const stores = [
        { name: "google-play", label: "Google Play" },
        { name: "app-store", label: "App Store" },
        { name: "galaxy-store", label: "Galaxy Store" },
        { name: "app-gallery", label: "AppGallery" },
        { name: "google-play-white", label: "Google Play (White)" },
    ];

    const sizes = ["md", "lg"];

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="mb-8">
                <Link href="/ds" className="hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Mobile App Store Button</h1>
                <p className="text-gray-600 mt-2">
                    Pre-styled buttons for linking to mobile app stores.
                </p>
            </div>

            {/* Variants */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Variants</h2>
                <div className="grid grid-cols-1 gap-6">
                    {variants.map(variant => (
                        <div key={variant.name} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                {variant.name === "filled" &&
                                    stores.map(store => (
                                        <MobileAppStore
                                            href="#"
                                            key={store.name}
                                            store={store.name as StoreType}
                                            variant={variant.name as AppStoreButtonVariants}
                                        />
                                    ))}
                                {variant.name === "outlined" &&
                                    stores
                                        .slice(0, 4)
                                        .map(store => (
                                            <MobileAppStore
                                                href="#"
                                                key={store.name}
                                                store={store.name as StoreType}
                                                variant={variant.name as AppStoreButtonVariants}
                                            />
                                        ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-3">{variant.description}</p>
                            <CodeBlock
                                className="mt-2"
                                code={`<MobileAppStore store="google-play | app-store | galaxy-store | app-gallery | google-play-white" variant="${variant.name}" href="#"/>`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Sizes */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sizes</h2>
                <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        {sizes.map(size => (
                            <MobileAppStore
                                href={"#"}
                                key={size}
                                store="google-play"
                                variant="filled"
                                size={size as SizeType}
                            />
                        ))}
                    </div>
                </div>
                <CodeBlock
                    className="mt-2"
                    code={`<MobileAppStore store="google-play" size="md|lg" variant="filled" className="" href="#"/>`}
                />
            </div>

            {/* API Reference */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-2 px-4 text-left">Props</th>
                                <th className="py-2 px-4 text-left">Type</th>
                                <th className="py-2 px-4 text-left">Default</th>
                                <th className="py-2 px-4 text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-sm">store</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {` "google-play" | "google-play-white" | "app-store" | "galaxy-store" | "app-gallery"`}
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">The app store platform to display.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-sm">variant</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {`'filled' | 'outlined'`}
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">{`'filled'`}</td>
                                <td className="py-2 px-4">The visual style of the badge.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-sm">size?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`'md' | 'lg'`}</td>
                                <td className="py-2 px-4 font-mono text-sm">{`'md'`}</td>
                                <td className="py-2 px-4">The size of the badge.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-sm">href?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">{`'#'`}</td>
                                <td className="py-2 px-4">The URL to link to when clicked.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-sm">className</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Additional CSS classes to apply to the badge.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-sm">...props</td>
                                <td className="py-2 px-4 font-mono text-sm">LinkProps</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">All Next.js Link props are supported.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
