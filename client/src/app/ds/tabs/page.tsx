"use client";

import React from "react";
import Link from "next/link";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Input } from "@/components/ui/input";

// Basic tab items
const tabItems = [
    {
        value: "tab1",
        label: "First tab",
        badge: 5,
        content: <div className="p-4">Content of the first tab</div>,
    },
    {
        value: "tab2",
        label: "Second tab",
        badge: "New",
        content: <div className="p-4">Content of the second tab</div>,
    },
    {
        value: "tab3",
        label: "Third tab",
        content: <div className="p-4">Content of the third tab</div>,
    },
];

// Rich content tab items
const richTabItems = [
    {
        value: "dashboard",
        label: (
            <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                </svg>
                Dashboard
            </div>
        ),
        badge: 12,
        content: (
            <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Dashboard</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-tertiary rounded-lg">
                        <h4 className="font-medium">Statistics</h4>
                        <p className="text-sm text-gray-600">Your data in real time</p>
                    </div>
                    <div className="p-4 border border-tertiary rounded-lg">
                        <h4 className="font-medium">Charts</h4>
                        <p className="text-sm text-gray-600">Data visualization</p>
                    </div>
                </div>
            </div>
        ),
    },
    {
        value: "analytics",
        label: "Analytics",
        badge: "Pro",
        content: (
            <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Analytics</h3>
                <div className="space-y-4">
                    <div className="p-4 bg-utility-blue-50 rounded-lg">
                        <h4 className="font-medium text-utility-blue-900">Visitors</h4>
                        <p className="text-2xl font-bold text-utility-blue-600">1,234</p>
                    </div>
                    <div className="p-4 bg-utility-green-50 rounded-lg">
                        <h4 className="font-medium text-utility-green-900">Conversions</h4>
                        <p className="text-2xl font-bold text-utility-green-600">89</p>
                    </div>
                </div>
            </div>
        ),
    },
    {
        value: "settings",
        label: "Settings",
        content: (
            <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Settings</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <Input type="text" placeholder="Enter your name" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input type="email" placeholder="you@example.com" />
                    </div>
                    <Button>Save</Button>
                </div>
            </div>
        ),
    },
];

export default function TabsPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            {/* Header */}
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Tabs</h1>
                <p className="text-muted-foreground mt-2">
                    A simplified API for the Tabs component, allowing you to define tabs and their
                    content in a single configuration.
                </p>
            </div>

            {/* Examples */}
            <div className="space-y-16">
                {/* Button Brand Horizontal */}
                <div>
                    <h2 className="text-lg font-medium mb-4">Button Brand Horizontal</h2>
                    <div className="p-4 border border-tertiary rounded-lg">
                        <div className="mb-4">
                            <Tabs items={tabItems} defaultValue="tab1" />
                        </div>
                        <CodeBlock code={`<Tabs items={tabItems} defaultValue="tab1" />`} />
                    </div>
                </div>

                {/* Button Gray */}
                <div>
                    <h3 className="text-lg font-medium mb-2">Button Gray Horizontal</h3>
                    <div className="p-4 border border-tertiary rounded-lg">
                        <div className="mb-4">
                            <Tabs items={tabItems} type="button-gray" defaultValue="tab1" />
                        </div>
                        <CodeBlock
                            code={`<Tabs items={tabItems} type="button-gray" defaultValue="tab1" />`}
                        />
                    </div>
                </div>

                {/* Button Border */}
                <div>
                    <h3 className="text-lg font-medium mb-2">Button Border Horizontal</h3>
                    <div className="p-4 border border-tertiary rounded-lg">
                        <div className="mb-4">
                            <Tabs items={tabItems} type="button-border" defaultValue="tab1" />
                        </div>
                        <CodeBlock
                            code={`<Tabs items={tabItems} type="button-border" defaultValue="tab1" />`}
                        />
                    </div>
                </div>

                {/* Underline */}
                <div>
                    <h3 className="text-lg font-medium mb-2">Underline Horizontal</h3>
                    <div className="p-4 border border-tertiary rounded-lg">
                        <div className="mb-4">
                            <Tabs items={tabItems} type="underline" defaultValue="tab1" />
                        </div>
                        <CodeBlock
                            code={`<Tabs items={tabItems} type="underline" defaultValue="tab1" />`}
                        />
                    </div>
                </div>

                {/* Underline Full Width */}
                <div>
                    <h3 className="text-lg font-medium mb-2">Underline Full Width</h3>
                    <div className="p-4 border border-tertiary rounded-lg">
                        <div className="mb-4">
                            <Tabs
                                items={tabItems}
                                type="underline"
                                fullWidth={true}
                                defaultValue="tab1"
                            />
                        </div>
                        <CodeBlock
                            code={`<Tabs items={tabItems} type="underline" fullWidth={true} defaultValue="tab1" />`}
                        />
                    </div>
                </div>

                {/* Vertical */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Vertical Variants</h2>
                    <div className="p-4 border border-tertiary rounded-lg">
                        <div className="mb-4 flex flex-row gap-4">
                            <Tabs
                                items={tabItems}
                                type="button-brand"
                                orientation="vertical"
                                defaultValue="tab1"
                            />
                            <Tabs
                                items={tabItems}
                                type="button-gray"
                                orientation="vertical"
                                defaultValue="tab1"
                            />
                            <Tabs
                                items={tabItems}
                                type="line"
                                orientation="vertical"
                                defaultValue="tab1"
                            />
                        </div>
                        <CodeBlock
                            code={`
<Tabs items={tabItems} type="button-brand" orientation="vertical" defaultValue="tab1" />
<Tabs items={tabItems} type="button-gray" orientation="vertical" defaultValue="tab1" />
<Tabs items={tabItems} type="line" orientation="vertical" defaultValue="tab1" />
`}
                        />
                    </div>
                </div>

                {/* Rich content */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Rich Content Example</h2>
                    <div className="p-4 border border-tertiary rounded-lg">
                        <Tabs items={richTabItems} type="underline" defaultValue="dashboard" />
                        <CodeBlock
                            code={`
<Tabs
  items={richTabItems}
  type="underline"
  defaultValue="dashboard"
  className="w-full max-w-4xl"
/>
`}
                        />
                    </div>
                </div>

                {/* API Reference */}
                <div className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">API Reference</h2>

                    {/* Tabs Props */}
                    <div className="overflow-x-auto">
                        <h3 className="text-lg font-medium mb-2">Tabs Props</h3>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-tertiary">
                                    <th className="text-left py-2 px-4">Props</th>
                                    <th className="text-left py-2 px-4">Type</th>
                                    <th className="text-left py-2 px-4">Default</th>
                                    <th className="text-left py-2 px-4">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">items</td>
                                    <td className="py-2 px-4 text-sm">TabItem[]</td>
                                    <td className="py-2 px-4 text-sm">[]</td>
                                    <td className="py-2 px-4 text-sm">
                                        The array of objects defining each tab and its content
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">size?</td>
                                    <td className="py-2 px-4 text-sm">{`"sm" | "md"`}</td>
                                    <td className="py-2 px-4 text-sm">{"sm"}</td>
                                    <td className="py-2 px-4 text-sm">
                                        The size of the tabs and badges.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">type?</td>
                                    <td className="py-2 px-4 text-sm">
                                        {" "}
                                        {`"button-brand" | "button-gray" | "button-border" | "button-minimal" | "underline"(in horizontal only) | "line" (in vertical only)`}
                                    </td>
                                    <td className="py-2 px-4 text-sm">{`"button-brand"`}</td>
                                    <td className="py-2 px-4 text-sm">
                                        The visual style of the tabs.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">orientation?</td>
                                    <td className="py-2 px-4 text-sm">{`"horizontal" | "vertical"`}</td>
                                    <td className="py-2 px-4 text-sm">{`"horizontal"`}</td>
                                    <td className="py-2 px-4 text-sm">
                                        Layout direction of the tabs.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">fullWidth?</td>
                                    <td className="py-2 px-4 text-sm">boolean</td>
                                    <td className="py-2 px-4 text-sm">false</td>
                                    <td className="py-2 px-4 text-sm">
                                        Tabs stretch to take full width.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">defaultValue?</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        The value of the tab that should be active when initially
                                        rendered. Use when you do not need to control the state of
                                        the tabs.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">value?</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        The controlled value of the tab to activate. Should be used
                                        in conjunction with onValueChange.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">onValueChange?</td>
                                    <td className="py-2 px-4 text-sm">
                                        function[(value: string) =&gt; void]
                                    </td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        The value of the tab that should be active when initially
                                        rendered. Use when you do not need to control the state of
                                        the tabs.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">className?</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        Extra classes applied to the root component.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">listClassName?</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        Extra classes applied to the tab list container.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">contentClassName?</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">-</td>
                                    <td className="py-2 px-4 text-sm">
                                        Extra classes applied to the content container.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* TabItem Interface */}
                    <div className="overflow-x-auto mt-8">
                        <h3 className="text-lg font-medium mb-2">TabItem (Interface)</h3>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-tertiary">
                                    <th className="text-left py-2 px-4">Props</th>
                                    <th className="text-left py-2 px-4">Type</th>
                                    <th className="text-left py-2 px-4">Default</th>
                                    <th className="text-left py-2 px-4">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">value</td>
                                    <td className="py-2 px-4 text-sm">string</td>
                                    <td className="py-2 px-4 text-sm">—</td>
                                    <td className="py-2 px-4 text-sm">
                                        Unique identifier for the tab.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">label</td>
                                    <td className="py-2 px-4 text-sm">ReactNode</td>
                                    <td className="py-2 px-4 text-sm">—</td>
                                    <td className="py-2 px-4 text-sm">
                                        The visible tab label. Can include text, icons, etc.
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">badge?</td>
                                    <td className="py-2 px-4 text-sm">number | string</td>
                                    <td className="py-2 px-4 text-sm">—</td>
                                    <td className="py-2 px-4 text-sm">
                                        {`Optional badge (e.g. a count or label like "New") displayed next to the label.`}
                                    </td>
                                </tr>
                                <tr className="border-b border-tertiary">
                                    <td className="py-2 px-4 font-medium">content</td>
                                    <td className="py-2 px-4 text-sm">ReactNode</td>
                                    <td className="py-2 px-4 text-sm">—</td>
                                    <td className="py-2 px-4 text-sm">
                                        {"The content rendered when this tab is active."}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
