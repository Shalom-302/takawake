import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function DesignSystemPage() {
    // Définition des types pour les composants
    interface ComponentItem {
        name: string;
        description: string;
        count: string;
        href: string;
        isNew: boolean;
        icon: string;
    }

    // Base components - fundamental building blocks
    const baseComponents: ComponentItem[] = [
        {
            name: "Accordion",
            description: "Expandable panels for organizing content in limited space.",
            count: "20 Components",
            href: "/ds/accordion",
            isNew: false,
            icon: "M3 12h18M3 6h18M3 18h18",
        },
        {
            name: "Alert",
            description: "Displays important messages to the user.",
            count: "12 Components",
            href: "/ds/alert",
            isNew: false,
            icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        },
        {
            name: "Avatar",
            description: "User profile images with different shapes and indicators.",
            count: "23 Components",
            href: "/ds/avatar",
            isNew: false,
            icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        },
        {
            name: "Badge",
            description: "Small status descriptors for UI elements.",
            count: "13 Components",
            href: "/ds/badge",
            isNew: false,
            icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
        },
        {
            name: "Breadcrumb",
            description: "Displays the path to the current resource using a hierarchy of links.",
            count: "3 Components",
            href: "/ds/badge",
            isNew: false,
            icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
        },
        {
            name: "Button",
            description: "Interactive buttons with different styles and states.",
            count: "10 Components",
            href: "/ds/button",
            isNew: false,
            icon: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122",
        },
        {
            name: "Button Group",
            description: "Interactive buttons with different styles and states.",
            count: "10 Components",
            href: "/ds/button-group",
            isNew: false,
            icon: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122",
        },
        {
            name: "Card",
            description: "Containers for displaying content in a clear layout.",
            count: "6 Components",
            href: "/ds/card",
            isNew: false,
            icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
        },
        {
            name: "Checkbox",
            description: "Selection controls for multiple options.",
            count: "8 Components",
            href: "/ds/checkbox",
            isNew: false,
            icon: "M5 13l4 4L19 7",
        },
        {
            name: "Date Pickers",
            description: "Date selection components with various input methods.",
            count: "8 Components",
            href: "/ds/date-pickers",
            isNew: false,
            icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
        },
        {
            name: "Dialog",
            description: "Modal windows for focused interactions.",
            count: "8 Components",
            href: "/ds/dialog",
            isNew: false,
            icon: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
        },
        {
            name: "Dropdown",
            description: "Toggleable menus for navigation and actions.",
            count: "6 Components",
            href: "/ds/dropdown",
            isNew: false,
            icon: "M19 9l-7 7-7-7",
        },
        {
            name: "File Upload",
            description: "Components for uploading and managing files.",
            count: "4 Components",
            href: "/ds/file-upload",
            isNew: false,
            icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12",
        },
        {
            name: "Input",
            description: "Text fields for user data entry.",
            count: "5 Components",
            href: "/ds/input",
            isNew: false,
            icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
        },
        {
            name: "Loading Indicator",
            description: "Visual indicators for loading states.",
            count: "5 Components",
            href: "/ds/loading-indicator",
            isNew: true,
            icon: "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z",
        },
        {
            name: "Mobile App Store",
            description: "App store badges for mobile applications.",
            count: "2 Components",
            href: "/ds/mobile-app-store",
            isNew: true,
            icon: "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z",
        },
        {
            name: "Pagination",
            description: "Navigation for multi-page content.",
            count: "3 Components",
            href: "/ds/pagination",
            isNew: false,
            icon: "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z",
        },
        {
            name: "Popover",
            description: "Navigation for multi-page content.",
            count: "2 Components",
            href: "/ds/popover",
            isNew: false,
            icon: "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z",
        },
        {
            name: "Progress",
            description: "Visual indicators for operations status.",
            count: "6 Components",
            href: "/ds/progress",
            isNew: false,
            icon: "M13 10V3L4 14h7v7l9-11h-7z",
        },
        {
            name: "Progress Steps",
            description: "Visual indicators for operations steps status.",
            count: "6 Components",
            href: "/ds/progress-steps",
            isNew: false,
            icon: "M13 10V3L4 14h7v7l9-11h-7z",
        },
        {
            name: "Radio Group",
            description: "Selection controls for single options.",
            count: "6 Components",
            href: "/ds/radio-group",
            isNew: false,
            icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
        },
        {
            name: "Select",
            description: "Dropdown selection controls for forms.",
            count: "5 Components",
            href: "/ds/select",
            isNew: false,
            icon: "M8 9l4-4 4 4m0 6l-4 4-4-4",
        },
        {
            name: "Slider",
            description: "Controls for selecting values from a range.",
            count: "6 Components",
            href: "/ds/slider",
            isNew: false,
            icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9",
        },
        {
            name: "Socials Buttons",
            description: "Pre-styled buttons for social media authentication.",
            count: "6 Components",
            href: "/ds/social-button",
            isNew: true,
            icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
        },
        {
            name: "Switch",
            description: "Toggle controls for binary options.",
            count: "8 Components",
            href: "/ds/switch",
            isNew: false,
            icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
        },
        {
            name: "Table",
            description: "Structured data presentation with various features.",
            count: "8 Components",
            href: "/ds/table",
            isNew: false,
            icon: "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
        },
        {
            name: "Tabs",
            description: "Organize content into selectable sections.",
            count: "5 Components",
            href: "/ds/tabs",
            isNew: false,
            icon: "M9 4h6v16H9V4zm-4 4h2v8H5V8zm12 0h2v8h-2V8z",
        },
        {
            name: "Tags",
            description: "",
            count: "5 Components",
            href: "/ds/tags",
            isNew: false,
            icon: "M9 4h6v16H9V4zm-4 4h2v8H5V8zm12 0h2v8h-2V8z",
        },
        {
            name: "Textarea",
            description: "Multi-line text input fields.",
            count: "5 Components",
            href: "/ds/textarea",
            isNew: false,
            icon: "M4 6h16M4 12h16M4 18h7",
        },
        {
            name: "Tooltip",
            description: "Contextual information on hover.",
            count: "8 Components",
            href: "/ds/tooltip",
            isNew: false,
            icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        },
    ];

    // Composite components - higher-level combinations of base components
    const compositeComponents = [
        {
            name: "Header Navigation Base",
            href: "/ds/header-navigation-base",
            description:
                "A foundational header navigation component combining logo, links, and user actions.",
            count: "2 Component",
            isNew: true,
            icon: "M3 12h18M3 6h18M3 18h18",
        },
        {
            name: "Sidebar Navigation",
            href: "/ds/sidebar-navigation",
            description:
                "A versatile sidebar navigation component with support for multi-level menus and collapsible sections.",
            count: "4 Components",
            isNew: true,
            icon: "M3 12h18M3 6h18M3 18h18",
        },
    ];

    // Component card renderer to avoid code duplication
    const renderComponentCard = (component: ComponentItem) => (
        <Link
            key={component.name}
            href={component.href}
            className="group flex flex-col p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-md bg-primary/10">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-primary"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d={component.icon} />
                        </svg>
                    </div>
                    <h2 className="text-lg font-medium group-hover:text-primary transition-colors">
                        {component.name}
                    </h2>
                </div>
                {component.isNew && (
                    <span className="bg-success-100 text-success-700 text-xs px-2 py-0.5 rounded-full">
                        New
                    </span>
                )}
            </div>
            <p className="text-muted-foreground mb-4 flex-grow">{component.description}</p>
            <div className="text-xs text-muted-foreground">{component.count}</div>
        </Link>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Kaapi UI</h1>
                    <p className="text-muted-foreground mt-2">
                        Config-driven UI components built to customize to fit the design system of
                        the application.
                    </p>
                </div>
                <ThemeToggle />
            </div>

            {/* Base Components Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Base Components</h2>
                <p className="text-muted-foreground mb-6">
                    Fundamental building blocks with simplified APIs and enhanced variants for
                    creating UI elements.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {baseComponents.map(component => renderComponentCard(component))}
                </div>
            </div>

            {/* Composite Components Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Composite Components</h2>
                <p className="text-muted-foreground mb-6">
                    Higher-level components that combine multiple base components for specific use
                    cases in the application.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {compositeComponents.map(component => renderComponentCard(component))}
                </div>
            </div>
        </div>
    );
}
