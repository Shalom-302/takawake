"use client";

import React from "react";
import Link from "next/link";
import { CodeBlock } from "@/components/ui/code-block";
import {
    SidebarNavigationSimple,
    SidebarNavigationDualTier,
    SidebarNavigationSlim,
    SidebarNavigationSectionsSubheadings,
    SidebarNavigationSectionDividers,
} from "@/components/ui/navigation/sidebar-navigation";
import {
    Archive,
    BarChartSquare02,
    CheckDone01,
    CurrencyDollarCircle,
    Grid03,
    HomeLine,
    LayoutAlt01,
    LifeBuoy01,
    LineChartUp03,
    MessageChatCircle,
    NotificationBox,
    Package,
    PieChart03,
    Rows01,
    Settings01,
    Star01,
    User01,
    Users01,
    UsersPlus,
    Folder,
    ClockFastForward,
    Settings03,
    UserSquare,
    Inbox01,
    Stars01,
} from "@untitled-ui/icons-react";
import { BadgeWithDot } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";

export default function SidebarNavigationPage() {
    const navItemsSimple = [
        {
            label: "Home",
            href: "/",
            icon: HomeLine,
            items: [
                { label: "Overview", href: "/overview", icon: Grid03 },
                { label: "Products", href: "/products", icon: Package },
                { label: "Orders", href: "/orders", icon: CurrencyDollarCircle },
                { label: "Customers", href: "/customers", icon: Users01 },
            ],
        },
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: BarChartSquare02,
            items: [
                { label: "Overview", href: "/dashboard/overview", icon: Grid03 },
                {
                    label: "Notifications",
                    href: "/dashboard/notifications",
                    icon: NotificationBox,
                    badge: 10,
                },
                { label: "Analytics", href: "/dashboard/analytics", icon: LineChartUp03 },
                { label: "Saved reports", href: "/dashboard/saved-reports", icon: Star01 },
            ],
        },
        {
            label: "Projects",
            href: "/projects",
            icon: Rows01,
            items: [
                { label: "View all", href: "/projects/all", icon: Rows01 },
                { label: "Personal", href: "/projects/personal", icon: User01 },
                { label: "Team", href: "/projects/team", icon: Users01 },
                { label: "Shared with me", href: "/projects/shared-with-me", icon: UsersPlus },
                { label: "Archive", href: "/projects/archive", icon: Archive },
            ],
        },
        {
            label: "Tasks",
            href: "/tasks",
            icon: CheckDone01,
            badge: 10,
        },
        {
            label: "Reporting",
            href: "/reporting",
            icon: PieChart03,
        },
        {
            label: "Users",
            href: "/users",
            icon: Users01,
        },
    ];

    const navItemsDualTier = [
        {
            label: "Home",
            href: "/",
            icon: HomeLine,
            items: [
                { label: "Overview", href: "/overview", icon: Grid03 },
                { label: "Products", href: "/products", icon: Package },
                { label: "Orders", href: "/orders", icon: CurrencyDollarCircle },
                { label: "Customers", href: "/customers", icon: Users01 },
                { label: "Inbox", href: "/inbox", icon: Inbox01, badge: 4 },
                { label: "What's new?", href: "/whats-new", icon: Stars01 },
            ],
        },
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: BarChartSquare02,
            items: [
                { label: "Overview", href: "/dashboard/overview", icon: Grid03 },
                {
                    label: "Notifications",
                    href: "/dashboard/notifications",
                    icon: NotificationBox,
                    badge: 10,
                },
                { label: "Analytics", href: "/dashboard/analytics", icon: LineChartUp03 },
                { label: "Saved reports", href: "/dashboard/saved-reports", icon: Star01 },
                {
                    label: "Scheduled reports",
                    href: "/dashboard/scheduled-reports",
                    icon: ClockFastForward,
                },
                { label: "User reports", href: "/dashboard/user-reports", icon: UserSquare },
                {
                    label: "Manage notifications",
                    href: "/dashboard/manage-notifications",
                    icon: Settings03,
                },
            ],
        },
        {
            label: "Projects",
            href: "/projects",
            icon: Rows01,
            items: [
                { label: "View all", href: "/projects/all", icon: Rows01 },
                { label: "Personal", href: "/projects/personal", icon: User01 },
                { label: "Team", href: "/projects/team", icon: Users01 },
                { label: "Shared with me", href: "/projects/shared-with-me", icon: UsersPlus },
                { label: "Archive", href: "/projects/archive", icon: Archive },
            ],
        },
        {
            label: "Tasks",
            href: "/tasks",
            icon: CheckDone01,
            badge: 10,
        },
        {
            label: "Reporting",
            href: "/reporting",
            icon: PieChart03,
        },
        {
            label: "Users",
            href: "/users",
            icon: Users01,
        },
    ];

    const navItemsWithSections = [
        {
            label: "General",
            items: [
                {
                    label: "Dashboard",
                    href: "/",
                    icon: BarChartSquare02,
                },
                {
                    label: "Projects",
                    href: "/projects",
                    icon: Rows01,
                },
                {
                    label: "Documents",
                    href: "/documents",
                    icon: Folder,
                },
            ],
        },
        {
            label: "Work",
            items: [
                {
                    label: "Reporting",
                    href: "#",
                    icon: PieChart03,
                },
                {
                    label: "Tasks",
                    href: "#",
                    icon: CheckDone01,
                    badge: (
                        <Badge size="sm" variant="modern">
                            8
                        </Badge>
                    ),
                },
                {
                    label: "Users",
                    href: "#",
                    icon: Users01,
                },
            ],
        },
    ];

    const navItemsWithDividers = [
        {
            label: "Home",
            href: "/",
            icon: HomeLine,
        },
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: BarChartSquare02,
        },
        {
            label: "Projects",
            href: "/projects",
            icon: Rows01,
        },
        { divider: true },
        {
            label: "Folders",
            icon: Folder,
            href: "/folders",
            items: [
                { label: "View all", badge: 18, href: "/folders/view-all" },
                { label: "Recent", badge: 8, href: "/folders/recent" },
                { label: "Favorites", badge: 6, href: "/folders/favorites" },
                { label: "Shared", badge: 4, href: "/folders/shared" },
            ],
        },
        { divider: true },
        {
            label: "Reporting",
            href: "/reporting",
            icon: PieChart03,
        },
        {
            label: "Settings",
            href: "/settings",
            icon: Settings01,
        },
        {
            label: "Support",
            href: "/support",
            icon: MessageChatCircle,
            badge: (
                <BadgeWithDot color="success" variant="modern" size="sm">
                    Online
                </BadgeWithDot>
            ),
        },
        {
            label: "Open in browser",
            href: "https://www.untitledui.com/",
            icon: LayoutAlt01,
        },
    ];

    const footerItems = [
        {
            label: "Settings",
            href: "/settings",
            icon: Settings01,
        },
        {
            label: "Support",
            href: "/support",
            icon: MessageChatCircle,
            badge: (
                <BadgeWithDot color="success" variant="modern" size="sm">
                    Online
                </BadgeWithDot>
            ),
        },
        {
            label: "Open in browser",
            href: "https://www.untitledui.com/",
            icon: LayoutAlt01,
        },
    ];

    const footerItemsMinimal = [
        {
            label: "Support",
            href: "/support",
            icon: LifeBuoy01,
        },
        {
            label: "Settings",
            href: "/settings",
            icon: Settings01,
        },
    ];

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <Link href="/ds" className="hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Sidebar Navigation</h1>
                <p className="text-gray-600 mt-2">
                    Flexible sidebar navigation components with multiple layout options for
                    different use cases.
                </p>
            </div>

            {/* Simple Sidebar */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Simple Sidebar</h2>
                <p className="text-sm text-gray-600 mb-6">
                    A standard vertical sidebar with collapsible sub-navigation items and footer
                    actions.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4 bg-gray-50">
                    <div className="max-w-xs relative">
                        <SidebarNavigationSimple items={navItemsSimple} footerItems={footerItems} />
                    </div>
                </div>

                <CodeBlock
                    code={`import { SidebarNavigationSimple } from "@/components/ui/navigation/sidebar-navigation";
import { HomeLine, BarChartSquare02, Users01 } from "@untitled-ui/icons-react";

const items = [
  {
    label: "Home",
    href: "/",
    icon: HomeLine,
    items: [
      { label: "Overview", href: "/overview", icon: Grid03 },
      { label: "Products", href: "/products", icon: Package },
    ],
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: BarChartSquare02,
    items: [
      { label: "Notifications", href: "/notifications", badge: 10 },
    ],
  },
  { label: "Tasks", href: "/tasks", icon: CheckDone01, badge: 10 },
];

<SidebarNavigationSimple 
  items={items}
  footerItems={[
    { label: "Settings", href: "/settings", icon: Settings01 },
    { label: "Support", href: "/support", icon: MessageChatCircle },
  ]}
/>`}
                />
            </div>

            {/* Dual-Tier Sidebar */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Dual-Tier Sidebar</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Two-level navigation with icon-only primary sidebar and expanded secondary
                    navigation panel.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4 bg-gray-50">
                    <div className="max-w-2xl relative">
                        <SidebarNavigationDualTier
                            items={navItemsDualTier}
                            footerItems={footerItemsMinimal}
                        />
                    </div>
                </div>

                <CodeBlock
                    code={`import { SidebarNavigationDualTier } from "@/components/ui/navigation/sidebar-navigation";

<SidebarNavigationDualTier 
  items={[
    {
      label: "Home",
      href: "/",
      icon: HomeLine,
      items: [
        { label: "Overview", href: "/overview", icon: Grid03 },
        { label: "Inbox", href: "/inbox", icon: Inbox01, badge: 4 },
      ],
    },
    { label: "Dashboard", href: "/dashboard", icon: BarChartSquare02 },
  ]}
  footerItems={[
    { label: "Support", href: "/support", icon: LifeBuoy01 },
    { label: "Settings", href: "/settings", icon: Settings01 },
  ]}
/>`}
                />
            </div>

            {/* Slim Sidebar */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Slim Sidebar</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Compact icon-only sidebar perfect for space-constrained layouts.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4 bg-gray-50">
                    <div className="max-w-xs relative">
                        <SidebarNavigationSlim
                            items={navItemsDualTier}
                            footerItems={footerItemsMinimal}
                        />
                    </div>
                </div>

                <CodeBlock
                    code={`import { SidebarNavigationSlim } from "@/components/ui/navigation/sidebar-navigation";

<SidebarNavigationSlim 
  items={[
    { label: "Home", href: "/", icon: HomeLine },
    { label: "Dashboard", href: "/dashboard", icon: BarChartSquare02 },
    { label: "Tasks", href: "/tasks", icon: CheckDone01, badge: 10 },
  ]}
  footerItems={[
    { label: "Support", href: "/support", icon: LifeBuoy01 },
    { label: "Settings", href: "/settings", icon: Settings01 },
  ]}
/>`}
                />
            </div>

            {/* Sections with Subheadings */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sections with Subheadings</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Organized navigation with section headers to group related items.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4 bg-gray-50">
                    <div className="max-w-xs relative">
                        <SidebarNavigationSectionsSubheadings
                            activeUrl="/"
                            items={navItemsWithSections}
                        />
                    </div>
                </div>

                <CodeBlock
                    code={`import { SidebarNavigationSectionsSubheadings } from "@/components/ui/navigation/sidebar-navigation";

const items = [
  {
    label: "General",
    items: [
      { label: "Dashboard", href: "/", icon: BarChartSquare02 },
      { label: "Projects", href: "/projects", icon: Rows01 },
    ],
  },
  {
    label: "Work",
    items: [
      { label: "Tasks", href: "/tasks", icon: CheckDone01, badge: 8 },
      { label: "Users", href: "/users", icon: Users01 },
    ],
  },
];

<SidebarNavigationSectionsSubheadings 
  activeUrl="/"
  items={items}
/>`}
                />
            </div>

            {/* Section Dividers */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Section Dividers</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Navigation with visual dividers to separate different groups of items.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4 bg-gray-50">
                    <div className="max-w-xs relative">
                        <SidebarNavigationSectionDividers
                            activeUrl="/"
                            items={navItemsWithDividers}
                        />
                    </div>
                </div>

                <CodeBlock
                    code={`import { SidebarNavigationSectionDividers } from "@/components/ui/navigation/sidebar-navigation";

const items = [
  { label: "Home", href: "/", icon: HomeLine },
  { label: "Dashboard", href: "/dashboard", icon: BarChartSquare02 },
  { divider: true },
  {
    label: "Folders",
    icon: Folder,
    href: "/folders",
    items: [
      { label: "View all", badge: 18, href: "/folders/view-all" },
      { label: "Recent", badge: 8, href: "/folders/recent" },
    ],
  },
  { divider: true },
  { label: "Settings", href: "/settings", icon: Settings01 },
];

<SidebarNavigationSectionDividers 
  activeUrl="/"
  items={items}
/>`}
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
                                <td className="py-2 px-4 font-mono text-sm">NavItem[]</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Array of navigation items. Each item can have nested subitems.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-sm">footerItems?</td>
                                <td className="py-2 px-4 font-mono text-sm">NavItem[]</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Optional footer navigation items displayed at the bottom.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono text-sm">activeUrl?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Current active URL for highlighting the active navigation item.
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 font-mono text-sm">featureCard?</td>
                                <td className="py-2 px-4 font-mono text-sm">ReactNode</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Optional feature card component (e.g., upgrade prompt, usage
                                    stats).
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">NavItem Type</h3>
                    <CodeBlock
                        code={`type NavItem = {
  label: string;
  href: string;
  current?: boolean;
  icon?: FC<{ className?: string }>;
  badge?: ReactNode | number;
  items?: NavItem[];
};

// For section-based navigation
type NavItemWithSection = {
  label: string;
  items: NavItem[];
};

// For divider-based navigation
type NavItemDivider = {
  divider: true;
};`}
                    />
                </div>
            </div>
        </div>
    );
}
