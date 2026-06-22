"use client";

import React from "react";
import Link from "next/link";
import { CodeBlock } from "@/components/ui/code-block";
import {
    HeaderNavigationBase,
    HeaderNavigationMenu,
    HeaderNavItem,
} from "@/components/ui/navigation/header-navigation";
import { Button } from "@/components/ui/button";
import { Zap } from "@untitled-ui/icons-react";
import { DropdownMenuSimple } from "@/components/ui/navigation/base-components";

export default function HeaderNavigationPage() {
    const headerNavMenuItems: HeaderNavItem[] = [
        { label: "Products", href: "/products", menu: <DropdownMenuSimple /> },
        { label: "Services", href: "/Services", menu: <DropdownMenuSimple /> },
        { label: "Pricing", href: "/pricing" },
        { label: "Resources", href: "/resources", menu: <DropdownMenuSimple /> },
        { label: "About", href: "/about" },
    ];

    const footerNavMenuItems: HeaderNavItem[] = [
        { label: "About us", href: "/" },
        { label: "Press", href: "/products" },
        { label: "Careers", href: "/resources" },
        { label: "Legal", href: "/pricing" },
        { label: "Support", href: "/pricing" },
        { label: "Contact", href: "/pricing" },
        { label: "Sitemap", href: "/pricing" },
        { label: "Cookie settings", href: "/pricing" },
    ];
    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <Link href="/ds" className="hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Header Navigation Base</h1>
                <p className="text-gray-600 mt-2">
                    Flexible, multi-level header navigation component with support for dropdown
                    menus and custom trailing content.
                </p>
            </div>

            {/* Simple Example */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Basic Navigation</h2>
                <p className="text-sm text-gray-600 mb-6">
                    A simple header navigation with top-level items and one dropdown menu.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4 transform">
                    <HeaderNavigationBase
                        items={[
                            { label: "Home", href: "/" },
                            {
                                label: "Dashboard",
                                href: "/dashboard",
                                items: [
                                    { label: "Overview", href: "#", current: true },
                                    { label: "Notifications", href: "#" },
                                    { label: "Analytics", href: "#" },
                                    { label: "Saved reports", href: "#" },
                                    { label: "Scheduled reports", href: "#" },
                                    { label: "User reports", href: "#" },
                                ],
                            },
                            { label: "Projects", href: "/projects" },
                            { label: "Tasks", href: "/tasks" },
                            { label: "Reporting", href: "/reporting" },
                            { label: "Users", href: "/users" },
                        ]}
                    />
                </div>

                <CodeBlock
                    code={`import { HeaderNavigationBase } from "@/components/ui/navigation/header-navigation";

<HeaderNavigationBase
  items={[
    { label: "Home", href: "/" },
    {
      label: "Dashboard",
      href: "/dashboard",
      items: [
        { label: "Overview", href: "#", current: true },
        { label: "Notifications", href: "#" },
        { label: "Analytics", href: "#" },
        { label: "Saved reports", href: "#" },
        { label: "Scheduled reports", href: "#" },
        { label: "User reports", href: "#" },
      ],
    },
    { label: "Projects", href: "/projects" },
    { label: "Tasks", href: "/tasks" },
    { label: "Reporting", href: "/reporting" },
    { label: "Users", href: "/users" },
  ]}
/>`}
                />
            </div>

            {/* Dual-Tier Example */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Dual-Tier Navigation with Actions</h2>
                <p className="text-sm text-gray-600 mb-6">
                    The navigation can include an action button or any custom trailing element.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4 transform">
                    <HeaderNavigationBase
                        items={[
                            { label: "Home", href: "/" },
                            {
                                label: "Dashboard",
                                href: "/dashboard",
                                current: true,
                                items: [
                                    { label: "Overview", href: "#", current: true },
                                    { label: "Notifications", href: "#" },
                                    { label: "Analytics", href: "#" },
                                    { label: "Saved reports", href: "#" },
                                    { label: "Scheduled reports", href: "#" },
                                    { label: "User reports", href: "#" },
                                ],
                            },
                            { label: "Projects", href: "/projects" },
                            { label: "Tasks", href: "/tasks" },
                            { label: "Reporting", href: "/reporting" },
                            { label: "Users", href: "/users" },
                        ]}
                        trailingContent={
                            <Button leftIcon={Zap} variant="secondary" size="sm">
                                Upgrade now
                            </Button>
                        }
                    />
                </div>

                <CodeBlock
                    code={`import { Zap } from "@untitled-ui/icons-react";
import { HeaderNavigationBase } from "@/components/ui/navigation/header-navigation";
import { Button } from "@/components/ui/button";

<HeaderNavigationBase
  items={[
    { label: "Home", href: "/" },
    {
      label: "Dashboard",
      href: "/dashboard",
      current: true,
      items: [
        { label: "Overview", href: "#", current: true },
        { label: "Notifications", href: "#" },
        { label: "Analytics", href: "#" },
        { label: "Saved reports", href: "#" },
        { label: "Scheduled reports", href: "#" },
        { label: "User reports", href: "#" },
      ],
    },
    { label: "Projects", href: "/projects" },
    { label: "Tasks", href: "/tasks" },
    { label: "Reporting", href: "/reporting" },
    { label: "Users", href: "/users" },
  ]}
  trailingContent={
    <Button leftIcon={Zap} variant="secondary" size="sm">
      Upgrade now
    </Button>
  }
/>`}
                />
            </div>

            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 pb-2">
                    Dropdown Navigation Header
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    A comprehensive header component featuring multi-level dropdowns for desktop and
                    a full-screen drawer for mobile, using custom `NavigationMenu` and `Dialog`
                    patterns.
                </p>

                <div className="border border-gray-200 h-screen rounded-lg p-0 mb-4 transform">
                    <HeaderNavigationMenu
                        items={headerNavMenuItems}
                        footerItems={footerNavMenuItems}
                        viewport={false}
                    />
                </div>

                <CodeBlock
                    code={`import { HeaderNavigationMenu } from "@/components/ui/navigation/header-navigation;
const headerNavMenuItems: HeaderNavItem[] = [
        { label: "Products", href: "/products", menu: <DropdownMenuSimple /> },
        { label: "Services", href: "/Services", menu: <DropdownMenuSimple /> },
        { label: "Pricing", href: "/pricing" },
        { label: "Resources", href: "/resources", menu: <DropdownMenuSimple /> },
        { label: "About", href: "/about" },
];
const footerNavMenuItems: HeaderNavItem[] = [
        { label: "About us", href: "/" },
        { label: "Press", href: "/products" },
        { label: "Careers", href: "/resources" },
        { label: "Legal", href: "/pricing" },
        { label: "Support", href: "/pricing" },
        { label: "Contact", href: "/pricing" },
        { label: "Sitemap", href: "/pricing" },
        { label: "Cookie settings", href: "/pricing" },
];

<HeaderNavigationMenu items={headerNavMenuItems} footerItems={footerNavMenuItems} viewport={false} />`}
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
                                <td className="py-2 px-4 font-mono text-sm">items</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {`{ label: string; href?: string; current?: boolean; items?: Item[] }[]`}
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Defines the main navigation structure. Each item can have nested
                                    subitems.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-sm">trailingContent?</td>
                                <td className="py-2 px-4 font-mono text-sm">ReactNode</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Optional element displayed at the end of the header (e.g.,
                                    button or avatar).
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 font-mono text-sm">className?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Additional classes for custom styling.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
