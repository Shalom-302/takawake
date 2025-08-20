import React from "react";
import Link from "next/link";

interface DesignSystemLayoutProps {
    children: React.ReactNode;
}

export default function DesignSystemLayout({ children }: DesignSystemLayoutProps) {
    // List of all components in the design system
    const components = [
        { name: "Accordion", href: "/ds/accordion" },
        { name: "Alert", href: "/ds/alert" },
        { name: "Avatar", href: "/ds/avatar" },
        { name: "Badge", href: "/ds/badge" },
        { name: "Button", href: "/ds/button" },
        { name: "Card", href: "/ds/card" },
        { name: "Checkbox", href: "/ds/checkbox" },
        { name: "Composite", href: "/ds/composite" },
        { name: "Dialog", href: "/ds/dialog" },
        { name: "Dropdown", href: "/ds/dropdown" },
        { name: "Input", href: "/ds/input" },
        { name: "Pagination", href: "/ds/pagination" },
        { name: "Progress", href: "/ds/progress" },
        { name: "Select", href: "/ds/select" },
        { name: "Slider", href: "/ds/slider" },
        { name: "Switch", href: "/ds/switch" },
        { name: "Table", href: "/ds/table" },
        { name: "Tabs", href: "/ds/tabs" },
        { name: "Textarea", href: "/ds/textarea" },
        { name: "Tooltip", href: "/ds/tooltip" },
    ].sort((a, b) => a.name.localeCompare(b.name));

    const compositeComponents = [
        { name: "Group card", href: "/ds/group-card" },
        { name: "Member list", href: "/ds/member-list" },
    ].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
                <div className="p-4 border-b border-border">
                    <Link href="/ds" className="flex items-center space-x-2">
                        <span className="font-bold text-xl">Kaapi UI</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto py-2">
                    <div className="px-3 py-2">
                        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                            Components
                        </h2>
                        <div className="space-y-1">
                            {components.map(component => (
                                <Link
                                    key={component.name}
                                    href={component.href}
                                    className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
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
                                    className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
                                >
                                    {component.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile header */}
            <div className="flex flex-col flex-1">
                <header className="sticky top-0 z-10 flex items-center h-16 px-4 border-b bg-background md:hidden">
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
