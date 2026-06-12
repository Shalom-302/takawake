"use client";

import React from "react";
import Link from "next/link";
import { LoadingIndicator, LoadingIndicatorProps } from "@/components/ui/loading-indicator";
import { CodeBlock } from "@/components/ui/code-block";

export default function LoadingIndicatorPage() {
    const types = [
        { name: "line-simple", description: "Simple circular line with partial fill" },
        { name: "line-spinner", description: "Single line circular spinner" },
        { name: "dot-circle", description: "Dotted circle with gradient effect" },
    ];

    const sizes = [
        { name: "sm", description: "Small - 32px spinner" },
        { name: "md", description: "Medium - 48px spinner" },
        { name: "lg", description: "Large - 56px spinner" },
        { name: "xl", description: "Extra Large - 64px spinner" },
    ];

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="mb-8">
                <Link href="/ds" className="hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Loading Indicator</h1>
                <p className="text-gray-600 mt-2">
                    Animated loading indicators with multiple styles, sizes, and optional labels.
                </p>
            </div>

            {/* Types */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Types</h2>
                <div className="grid grid-cols-1 gap-6">
                    {types.map(type => (
                        <div key={type.name} className="p-8 border border-gray-200 rounded-lg">
                            <div className="flex justify-center items-center mb-4 min-h-[100px]">
                                <LoadingIndicator
                                    type={type.name as LoadingIndicatorProps["type"]}
                                    size="lg"
                                />
                            </div>
                            <p className="text-sm text-gray-600 text-center mb-2">
                                {type.description}
                            </p>
                            <CodeBlock
                                className="mt-2"
                                code={`<LoadingIndicator type="${type.name}" size="lg" />`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Sizes */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sizes</h2>
                <div className="p-8 border border-gray-200 rounded-lg">
                    <div className="flex flex-wrap items-end justify-center gap-8 mb-6">
                        {sizes.map(size => (
                            <div key={size.name} className="flex flex-col items-center gap-2">
                                <LoadingIndicator
                                    type="line-simple"
                                    size={size.name as LoadingIndicatorProps["size"]}
                                />
                                <span className="text-xs text-gray-500">{size.name}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-600 text-center mb-3">
                        Available sizes: sm (32px), md (48px), lg (56px), xl (64px)
                    </p>
                </div>
                <CodeBlock
                    className="mt-2"
                    code={`<LoadingIndicator type="line-simple" size="sm|md|lg|xl" />`}
                />
            </div>

            {/* With Label */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">With Label</h2>
                <div className="p-8 border border-gray-200 rounded-lg">
                    <div className="flex flex-wrap justify-center gap-12">
                        <LoadingIndicator type="line-simple" size="md" label="Loading..." />
                        <LoadingIndicator type="line-spinner" size="md" label="Please wait" />
                        <LoadingIndicator type="dot-circle" size="md" label="Processing" />
                    </div>
                </div>
                <CodeBlock
                    className="mt-2"
                    code={`<LoadingIndicator 
  type="line-simple" 
  size="md" 
  label="Loading..." 
/>`}
                />
            </div>

            {/* Size Variations with Labels */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Size Variations with Labels</h2>
                <div className="p-8 border border-gray-200 rounded-lg">
                    <div className="flex flex-wrap justify-center items-end gap-8">
                        <LoadingIndicator type="line-simple" size="sm" label="Small" />
                        <LoadingIndicator type="line-simple" size="md" label="Medium" />
                        <LoadingIndicator type="line-simple" size="lg" label="Large" />
                        <LoadingIndicator type="line-simple" size="xl" label="Extra Large" />
                    </div>
                    <p className="text-sm text-gray-600 text-center mt-6">
                        Label font size adjusts automatically based on indicator size
                    </p>
                </div>
                <CodeBlock
                    className="mt-2"
                    code={`<LoadingIndicator type="line-simple" size="xl" label="Loading..." />`}
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
                                <td className="py-2 px-4 font-mono text-sm">type?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {` "line-simple" | "line-spinner" | "dot-circle"`}
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">{"line-simple"}</td>
                                <td className="py-2 px-4">
                                    The visual style of the loading indicator.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-sm">size?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {` "sm" | "md" | "lg" | "xl"`}
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">{`"sm"`}</td>
                                <td className="py-2 px-4">The size of the loading indicator.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-sm">label?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Optional text label displayed below the indicator.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
