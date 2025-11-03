"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DesignSystemLayoutProps {
    children: React.ReactNode;
}

export default function DesignSystemLayout({ children }: DesignSystemLayoutProps) {
    const pathname = usePathname();
    // console.log("pathname======>", pathname);
    // List of all components in the design system
    const components = [
        { name: "Accordion", href: "/ds/accordion" },
        { name: "Alert", href: "/ds/alert" },
        { name: "Avatar", href: "/ds/avatar" },
        { name: "Badge", href: "/ds/badge" },
        { name: "Breadcrumb", href: "/ds/breadcrumb" },
        { name: "Button", href: "/ds/button" },
        { name: "Button Group", href: "/ds/button-group" },
        { name: "Card", href: "/ds/card" },
        { name: "Carousel", href: "/ds/carousel" },
        { name: "Chart", href: "/ds/chart" },
        { name: "Checkbox", href: "/ds/checkbox" },
        { name: "Credit Card", href: "/ds/credit-card" },
        { name: "Composite", href: "/ds/composite" },
        { name: "Date Pickers", href: "/ds/date-pickers" },
        { name: "Dialog", href: "/ds/dialog" },
        { name: "Dropdown", href: "/ds/dropdown" },
        { name: "File Upload", href: "/ds/file-upload" },
        { name: "Illustrations", href: "/ds/illustrations" },
        { name: "Input", href: "/ds/input" },
        { name: "Loading Indicator", href: "/ds/loading-indicator" },
        { name: "Mobile App Store", href: "/ds/mobile-app-store" },
        { name: "Pagination", href: "/ds/pagination" },
        { name: "Popover", href: "/ds/popover" },
        { name: "Progress", href: "/ds/progress" },
        { name: "Progress Steps", href: "/ds/progress-steps" },
        { name: "Qr Code", href: "/ds/qr-code" },
        { name: "Radio Group", href: "/ds/radio-group" },
        { name: "Rating", href: "/ds/rating" },
        { name: "Select", href: "/ds/select" },
        { name: "Slider", href: "/ds/slider" },
        { name: "Social Button", href: "/ds/social-button" },
        { name: "Switch", href: "/ds/switch" },
        { name: "Table", href: "/ds/table" },
        { name: "Tabs", href: "/ds/tabs" },
        { name: "Tags", href: "/ds/tags" },
        { name: "Textarea", href: "/ds/textarea" },
        { name: "Tooltip", href: "/ds/tooltip" },
    ].sort((a, b) => a.name.localeCompare(b.name));

    const compositeComponents = [
        { name: "Header Navigation Base", href: "/ds/header-navigation-base" },
        { name: "Sidebar Navigation", href: "/ds/sidebar-navigation" },
    ].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r border-tertiary">
                <div className="p-4 border-b border-tertiary">
                    <Link href="/ds" className="flex items-center space-x-2">
                        <span className="font-bold text-xl">Kaapi UI</span>
                    </Link>
                </div>
                <div className="py-2 h-[calc(100vh-10px)] overflow-x-hidden">
                    <div className="px-3 py-2">
                        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                            Components
                        </h2>
                        <div className="space-y-1">
                            {components.map(component => (
                                <Link
                                    key={component.name}
                                    href={component.href}
                                    className={`flex items-center px-4 py-2 text-sm rounded-md hover:bg-primary_hover hover:text-secondary_hover ${pathname == component.href ? "bg-primary_hover text-secondary_hover" : ""}`}
                                >
                                    {component.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="px-3 py-2">
                        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                            Composite
                        </h2>
                        <div className="space-y-1">
                            {compositeComponents.map(component => (
                                <Link
                                    key={component.name}
                                    href={component.href}
                                    className={`flex items-center px-4 py-2 text-sm rounded-md hover:bg-primary_hover hover:text-secondary_hover ${pathname === component.href ? "bg-primary_hover text-secondary_hover" : ""}`}
                                >
                                    {component.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile header */}
            <div className="flex flex-col flex-1 h-screen">
                <header className="sticky top-0 z-10 flex items-center h-16 px-4 border-b border-tertiary bg-background md:hidden">
                    <Link href="/ds" className="flex items-center space-x-2">
                        <span className="font-bold">Kaapi UI</span>
                    </Link>
                </header>

                {/* Main content */}
                <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
            </div>
        </div>
    );
}
