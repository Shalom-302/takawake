// "use client";

// import React from "react";
// import Link from "next/link";
// import { CodeBlock } from "@/components/ui/code-block";
// import {
//     SidebarNavigationSimple,
//     SidebarNavigationDualTier,
//     SidebarNavigationSlim,
//     SidebarNavigationSectionsSubheadings,
//     SidebarNavigationSectionDividers,
// } from "@/components/ui/navigation/sidebar-navigation";
// import {
//     Archive,
//     BarChartSquare02,
//     CheckDone01,
//     CurrencyDollarCircle,
//     Grid03,
//     HomeLine,
//     LayoutAlt01,
//     LifeBuoy01,
//     LineChartUp03,
//     MessageChatCircle,
//     NotificationBox,
//     Package,
//     PieChart03,
//     Rows01,
//     Settings01,
//     Star01,
//     User01,
//     Users01,
//     UsersPlus,
//     Folder,
//     ClockFastForward,
//     Settings03,
//     UserSquare,
//     Inbox01,
//     Stars01,
// } from "@untitled-ui/icons-react";
// import { BadgeWithDot } from "@/components/ui/badge";
// import { Badge } from "@/components/ui/badge";

// // Composant pour le contrôle de largeur
// const WidthControl = ({ width, onChange }) => {
//     const presets = [
//         { label: "320px", value: 320 },
//         { label: "375px", value: 375 },
//         { label: "640px", value: 640 },
//         { label: "768px", value: 768 },
//         { label: "1024px", value: 1024 },
//         { label: "Full", value: 9999 },
//     ];

//     return (
//         <div className="flex items-center gap-2 mb-4 flex-wrap">
//             <span className="text-sm text-gray-600">Width:</span>
//             <div className="flex gap-1">
//                 {presets.map(preset => (
//                     <button
//                         key={preset.value}
//                         onClick={() => onChange(preset.value)}
//                         className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
//                             width === preset.value
//                                 ? "bg-blue-100 text-blue-700 border-blue-300"
//                                 : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
//                         }`}
//                     >
//                         {preset.label}
//                     </button>
//                 ))}
//             </div>
//             <div className="flex items-center gap-2 ml-2">
//                 <input
//                     type="range"
//                     min="280"
//                     max="1200"
//                     value={width === 9999 ? 1200 : width}
//                     onChange={e => onChange(Number(e.target.value))}
//                     className="w-32"
//                 />
//                 <span className="text-xs font-mono text-gray-500 w-16">
//                     {width === 9999 ? "100%" : `${width}px`}
//                 </span>
//             </div>
//         </div>
//     );
// };

// // Composant pour le preview responsive
// const ResponsivePreview = ({ children, defaultWidth = 768, height = "600px" }) => {
//     const [width, setWidth] = React.useState(defaultWidth);

//     return (
//         <div>
//             <WidthControl width={width} onChange={setWidth} />
//             <div className="border border-gray-200 rounded-lg p-8 bg-gray-50 relative overflow-hidden">
//                 <div
//                     className="relative"
//                     style={{
//                         width: width === 9999 ? "100%" : `${width}px`,
//                         maxWidth: "100%",
//                         height: height,
//                         transition: "width 0.2s ease",
//                     }}
//                 >
//                     {children}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default function SidebarNavigationPage() {
//     const navItemsSimple = [
//         {
//             label: "Home",
//             href: "/",
//             icon: HomeLine,
//             items: [
//                 { label: "Overview", href: "/overview", icon: Grid03 },
//                 { label: "Products", href: "/products", icon: Package },
//                 { label: "Orders", href: "/orders", icon: CurrencyDollarCircle },
//                 { label: "Customers", href: "/customers", icon: Users01 },
//             ],
//         },
//         {
//             label: "Dashboard",
//             href: "/dashboard",
//             icon: BarChartSquare02,
//             items: [
//                 { label: "Overview", href: "/dashboard/overview", icon: Grid03 },
//                 {
//                     label: "Notifications",
//                     href: "/dashboard/notifications",
//                     icon: NotificationBox,
//                     badge: 10,
//                 },
//                 { label: "Analytics", href: "/dashboard/analytics", icon: LineChartUp03 },
//                 { label: "Saved reports", href: "/dashboard/saved-reports", icon: Star01 },
//             ],
//         },
//         {
//             label: "Projects",
//             href: "/projects",
//             icon: Rows01,
//             items: [
//                 { label: "View all", href: "/projects/all", icon: Rows01 },
//                 { label: "Personal", href: "/projects/personal", icon: User01 },
//                 { label: "Team", href: "/projects/team", icon: Users01 },
//                 { label: "Shared with me", href: "/projects/shared-with-me", icon: UsersPlus },
//                 { label: "Archive", href: "/projects/archive", icon: Archive },
//             ],
//         },
//         {
//             label: "Tasks",
//             href: "/tasks",
//             icon: CheckDone01,
//             badge: 10,
//         },
//         {
//             label: "Reporting",
//             href: "/reporting",
//             icon: PieChart03,
//         },
//         {
//             label: "Users",
//             href: "/users",
//             icon: Users01,
//         },
//     ];

//     const navItemsDualTier = [
//         {
//             label: "Home",
//             href: "/",
//             icon: HomeLine,
//             items: [
//                 { label: "Overview", href: "/overview", icon: Grid03 },
//                 { label: "Products", href: "/products", icon: Package },
//                 { label: "Orders", href: "/orders", icon: CurrencyDollarCircle },
//                 { label: "Customers", href: "/customers", icon: Users01 },
//                 { label: "Inbox", href: "/inbox", icon: Inbox01, badge: 4 },
//                 { label: "What's new?", href: "/whats-new", icon: Stars01 },
//             ],
//         },
//         {
//             label: "Dashboard",
//             href: "/dashboard",
//             icon: BarChartSquare02,
//             items: [
//                 { label: "Overview", href: "/dashboard/overview", icon: Grid03 },
//                 {
//                     label: "Notifications",
//                     href: "/dashboard/notifications",
//                     icon: NotificationBox,
//                     badge: 10,
//                 },
//                 { label: "Analytics", href: "/dashboard/analytics", icon: LineChartUp03 },
//                 { label: "Saved reports", href: "/dashboard/saved-reports", icon: Star01 },
//                 {
//                     label: "Scheduled reports",
//                     href: "/dashboard/scheduled-reports",
//                     icon: ClockFastForward,
//                 },
//                 { label: "User reports", href: "/dashboard/user-reports", icon: UserSquare },
//                 {
//                     label: "Manage notifications",
//                     href: "/dashboard/manage-notifications",
//                     icon: Settings03,
//                 },
//             ],
//         },
//         {
//             label: "Projects",
//             href: "/projects",
//             icon: Rows01,
//             items: [
//                 { label: "View all", href: "/projects/all", icon: Rows01 },
//                 { label: "Personal", href: "/projects/personal", icon: User01 },
//                 { label: "Team", href: "/projects/team", icon: Users01 },
//                 { label: "Shared with me", href: "/projects/shared-with-me", icon: UsersPlus },
//                 { label: "Archive", href: "/projects/archive", icon: Archive },
//             ],
//         },
//         {
//             label: "Tasks",
//             href: "/tasks",
//             icon: CheckDone01,
//             badge: 10,
//         },
//         {
//             label: "Reporting",
//             href: "/reporting",
//             icon: PieChart03,
//         },
//         {
//             label: "Users",
//             href: "/users",
//             icon: Users01,
//         },
//     ];

//     const navItemsWithSections = [
//         {
//             label: "General",
//             items: [
//                 {
//                     label: "Dashboard",
//                     href: "/",
//                     icon: BarChartSquare02,
//                 },
//                 {
//                     label: "Projects",
//                     href: "/projects",
//                     icon: Rows01,
//                 },
//                 {
//                     label: "Documents",
//                     href: "/documents",
//                     icon: Folder,
//                 },
//             ],
//         },
//         {
//             label: "Work",
//             items: [
//                 {
//                     label: "Reporting",
//                     href: "#",
//                     icon: PieChart03,
//                 },
//                 {
//                     label: "Tasks",
//                     href: "#",
//                     icon: CheckDone01,
//                     badge: (
//                         <Badge size="sm" variant="modern">
//                             8
//                         </Badge>
//                     ),
//                 },
//                 {
//                     label: "Users",
//                     href: "#",
//                     icon: Users01,
//                 },
//             ],
//         },
//     ];

//     const navItemsWithDividers = [
//         {
//             label: "Home",
//             href: "/",
//             icon: HomeLine,
//         },
//         {
//             label: "Dashboard",
//             href: "/dashboard",
//             icon: BarChartSquare02,
//         },
//         {
//             label: "Projects",
//             href: "/projects",
//             icon: Rows01,
//         },
//         { divider: true },
//         {
//             label: "Folders",
//             icon: Folder,
//             href: "/folders",
//             items: [
//                 { label: "View all", badge: 18, href: "/folders/view-all" },
//                 { label: "Recent", badge: 8, href: "/folders/recent" },
//                 { label: "Favorites", badge: 6, href: "/folders/favorites" },
//                 { label: "Shared", badge: 4, href: "/folders/shared" },
//             ],
//         },
//         { divider: true },
//         {
//             label: "Reporting",
//             href: "/reporting",
//             icon: PieChart03,
//         },
//         {
//             label: "Settings",
//             href: "/settings",
//             icon: Settings01,
//         },
//         {
//             label: "Support",
//             href: "/support",
//             icon: MessageChatCircle,
//             badge: (
//                 <BadgeWithDot color="success" variant="modern" size="sm">
//                     Online
//                 </BadgeWithDot>
//             ),
//         },
//         {
//             label: "Open in browser",
//             href: "https://www.untitledui.com/",
//             icon: LayoutAlt01,
//         },
//     ];

//     const footerItems = [
//         {
//             label: "Settings",
//             href: "/settings",
//             icon: Settings01,
//         },
//         {
//             label: "Support",
//             href: "/support",
//             icon: MessageChatCircle,
//             badge: (
//                 <BadgeWithDot color="success" variant="modern" size="sm">
//                     Online
//                 </BadgeWithDot>
//             ),
//         },
//         {
//             label: "Open in browser",
//             href: "https://www.untitledui.com/",
//             icon: LayoutAlt01,
//         },
//     ];

//     const footerItemsMinimal = [
//         {
//             label: "Support",
//             href: "/support",
//             icon: LifeBuoy01,
//         },
//         {
//             label: "Settings",
//             href: "/settings",
//             icon: Settings01,
//         },
//     ];

//     return (
//         <div className="container mx-auto py-10 px-4 max-w-6xl relative">
//             {/* Header */}
//             <div className="mb-8">
//                 <Link href="/ds" className="hover:underline mb-4 inline-block">
//                     ← Back to Design System
//                 </Link>
//                 <h1 className="text-3xl font-bold mt-2">Sidebar Navigation</h1>
//                 <p className="text-gray-600 mt-2">
//                     Flexible sidebar navigation components with multiple layout options for
//                     different use cases.
//                 </p>
//             </div>

//             {/* Simple Sidebar */}
//             <div className="mb-10">
//                 <h2 className="text-xl font-semibold mb-4">Simple Sidebar</h2>
//                 <p className="text-sm text-gray-600 mb-6">
//                     A standard vertical sidebar with collapsible sub-navigation items and footer
//                     actions.
//                 </p>

//                 <ResponsivePreview defaultWidth={320} >
//                     <div className="relative h-full">
//                         <SidebarNavigationSimple items={navItemsSimple} footerItems={footerItems} />
//                     </div>
//                 </ResponsivePreview>

//                 <div className="mt-4">

//                </div>
//             </div>

//             {/* Dual-Tier Sidebar */}
//             <div className="mb-10">
//                 <h2 className="text-xl font-semibold mb-4">Dual-Tier Sidebar</h2>
//                 <p className="text-sm text-gray-600 mb-6">
//                     Two-level navigation with icon-only primary sidebar and expanded secondary
//                     navigation panel.
//                 </p>

//                 <ResponsivePreview defaultWidth={640} >
//                     <div className="relative h-full">
//                         <SidebarNavigationDualTier
//                             items={navItemsDualTier}
//                             footerItems={footerItemsMinimal}
//                         />
//                     </div>
//                 </ResponsivePreview>

//                 <div className="mt-4">

//                 </div>
//             </div>

//             {/* Slim Sidebar */}
//             <div className="mb-10">
//                 <h2 className="text-xl font-semibold mb-4">Slim Sidebar</h2>
//                 <p className="text-sm text-gray-600 mb-6">
//                     Compact icon-only sidebar perfect for space-constrained layouts.
//                 </p>

//                 <ResponsivePreview defaultWidth={280} >
//                     <div className="relative h-full">
//                         <SidebarNavigationSlim
//                             items={navItemsDualTier}
//                             footerItems={footerItemsMinimal}
//                         />
//                     </div>
//                 </ResponsivePreview>

//                 <div className="mt-4">

//                 </div>
//             </div>

//             {/* Sections with Subheadings */}
//             <div className="mb-10 relative">
//                 <h2 className="text-xl font-semibold mb-4">Sections with Subheadings</h2>
//                 <p className="text-sm text-gray-600 mb-6">
//                     Organized navigation with section headers to group related items.
//                 </p>

//                 <ResponsivePreview defaultWidth={320} >
//                     <div className="relative h-full">
//                         <SidebarNavigationSectionsSubheadings
//                             activeUrl="/"
//                             items={navItemsWithSections}
//                         />
//                     </div>
//                 </ResponsivePreview>

//                 <div className="mt-4">

//                 </div>
//             </div>

//             {/* Section Dividers */}
//             <div className="mb-10 relative">
//                 <h2 className="text-xl font-semibold mb-4">Section Dividers</h2>
//                 <p className="text-sm text-gray-600 mb-6">
//                     Navigation with visual dividers to separate different groups of items.
//                 </p>

//                 <ResponsivePreview defaultWidth={320} height="600px">
//                     <div className="relative h-full overflow-hidden">
//                         <SidebarNavigationSectionDividers
//                             activeUrl="/"
//                             items={navItemsWithDividers}
//                         />
//                     </div>
//                 </ResponsivePreview>

//                 <div className="mt-4">

//                 </div>
//             </div>

//             {/* API Reference */}
//             <div className="mb-10">
//                 <h2 className="text-xl font-semibold mb-4">API Reference</h2>
//                 <div className="overflow-x-auto">
//                     <table className="w-full border-collapse">
//                         <thead>
//                             <tr className="border-b border-gray-200">
//                                 <th className="py-2 px-4 text-left">Props</th>
//                                 <th className="py-2 px-4 text-left">Type</th>
//                                 <th className="py-2 px-4 text-left">Default</th>
//                                 <th className="py-2 px-4 text-left">Description</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr className="border-b border-gray-200">
//                                 <td className="py-2 px-4 font-mono text-sm">items</td>
//                                 <td className="py-2 px-4 font-mono text-sm">NavItem[]</td>
//                                 <td className="py-2 px-4 font-mono text-sm">-</td>
//                                 <td className="py-2 px-4">
//                                     Array of navigation items. Each item can have nested subitems.
//                                 </td>
//                             </tr>
//                             <tr className="border-b border-gray-200">
//                                 <td className="py-2 px-4 font-mono text-sm">footerItems?</td>
//                                 <td className="py-2 px-4 font-mono text-sm">NavItem[]</td>
//                                 <td className="py-2 px-4 font-mono text-sm">-</td>
//                                 <td className="py-2 px-4">
//                                     Optional footer navigation items displayed at the bottom.
//                                 </td>
//                             </tr>
//                             <tr className="border-b border-gray-200">
//                                 <td className="py-2 px-4 font-mono text-sm">activeUrl?</td>
//                                 <td className="py-2 px-4 font-mono text-sm">string</td>
//                                 <td className="py-2 px-4 font-mono text-sm">-</td>
//                                 <td className="py-2 px-4">
//                                     Current active URL for highlighting the active navigation item.
//                                 </td>
//                             </tr>
//                             <tr>
//                                 <td className="py-2 px-4 font-mono text-sm">featureCard?</td>
//                                 <td className="py-2 px-4 font-mono text-sm">ReactNode</td>
//                                 <td className="py-2 px-4 font-mono text-sm">-</td>
//                                 <td className="py-2 px-4">
//                                     Optional feature card component (e.g., upgrade prompt, usage
//                                     stats).
//                                 </td>
//                             </tr>
//                         </tbody>
//                     </table>
//                 </div>

//                 <div className="mt-6">
//                     <h3 className="text-lg font-semibold mb-3">NavItem Type</h3>
//                     <CodeBlock
//                         code={`type NavItem = {
//   label: string;
//   href: string;
//   current?: boolean;
//   icon?: FC<{ className?: string }>;
//   badge?: ReactNode | number;
//   items?: NavItem[];
// };

// // For section-based navigation
// type NavItemWithSection = {
//   label: string;
//   items: NavItem[];
// };

// // For divider-based navigation
// type NavItemDivider = {
//   divider: true;
// };`}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// }

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
import { FeaturedCardProgressBar, FeaturedCardProgressCircle } from "@/components/ui/featured-card";
import { NavItemDividerType, NavItemType } from "@/components/ui/navigation/config";

// Composant pour le preview responsive
const ResponsivePreview = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <div className="border border-gray-200 rounded-lg p-8 bg-gray-50 w-full relative overflow-hidden h-[600px]">
                {children}
            </div>
        </div>
    );
};

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

    const navItemsWithDividers: (NavItemType | NavItemDividerType)[] = [
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
        <div className="container mx-auto py-10 px-4 max-w-6xl relative">
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

                <ResponsivePreview>
                    {/* Structure de simulation de page : Sidebar + Contenu */}
                    <div className="flex h-full w-full border border-gray-300 rounded-lg shadow-xl overflow-hidden bg-white">
                        {/* 296px est la largeur de votre sidebar simple */}
                        <div className="h-full flex-shrink-0 w-[296px] relative overflow-hidden transform">
                            <SidebarNavigationSimple
                                activeUrl="/dashboard"
                                items={navItemsSimple}
                                footerItems={footerItems}
                                featureCard={
                                    <FeaturedCardProgressBar
                                        title="Used space"
                                        description="Your team has used 80% of your available space. Need more?"
                                        confirmLabel="Upgrade plan"
                                        progress={80}
                                        className="hidden md:flex"
                                        onDismiss={() => {}}
                                        onConfirm={() => {}}
                                    />
                                }
                            />
                        </div>

                        {/* Contenu principal simulé */}
                        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 border-l border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800">Dashboard Overview</h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Welcome to the simulated content area.
                            </p>
                            <div className="h-[400px] mt-4 bg-white border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                                Main Page Content Area
                            </div>
                        </main>
                    </div>
                </ResponsivePreview>

                <div className="mt-4">
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
            </div>

            {/* Dual-Tier Sidebar */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Dual-Tier Sidebar</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Two-level navigation with icon-only primary sidebar and expanded secondary
                    navigation panel.
                </p>

                <ResponsivePreview>
                    {/* Structure de simulation de page : Sidebar Dual-Tier + Contenu */}
                    <div className="flex h-full w-full border border-gray-300 rounded-lg shadow-xl overflow-hidden bg-white">
                        {/* La Dual-Tier est large (environ 300px) */}
                        <div className="h-full flex-shrink-0 w-[300px] overflow-hidden transform">
                            <SidebarNavigationDualTier
                                activeUrl="/dashboard/overview"
                                items={navItemsDualTier}
                                footerItems={footerItemsMinimal}
                                featureCard={
                                    <FeaturedCardProgressCircle
                                        title="Used space"
                                        description="Your team has used 80% of your available space. Need more?"
                                        confirmLabel="Upgrade plan"
                                        progress={80}
                                        className="hidden lg:flex"
                                        onDismiss={() => {}}
                                        onConfirm={() => {}}
                                    />
                                }
                            />
                        </div>

                        {/* Contenu principal simulé */}
                        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 border-l border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800">
                                Dashboard Overview (Two-tier)
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">
                                This content sits next to the dual-tier navigation.
                            </p>
                            <div className="h-[400px] mt-4 bg-white border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                                Main Page Content Area
                            </div>
                        </main>
                    </div>
                </ResponsivePreview>

                <div className="mt-4">
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
            </div>

            {/* Slim Sidebar */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Slim Sidebar</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Compact icon-only sidebar perfect for space-constrained layouts.
                </p>

                <ResponsivePreview>
                    {/* Structure de simulation de page : Slim Sidebar + Contenu */}
                    <div className="flex h-full w-full border border-gray-300 rounded-lg shadow-xl overflow-hidden bg-white">
                        {/* La Slim Sidebar est étroite (environ 96px) */}
                        <div className="h-full flex-shrink-0 w-24 relative overflow-hidden transform">
                            <SidebarNavigationSlim
                                activeUrl="/dashboard"
                                items={navItemsDualTier}
                                footerItems={footerItemsMinimal}
                                // className="h-full"
                            />
                        </div>

                        {/* Contenu principal simulé */}
                        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 border-l border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800">
                                Dashboard Overview (Slim)
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">
                                This content sits next to the slim navigation.
                            </p>
                            <div className="h-[400px] mt-4 bg-white border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                                Main Page Content Area
                            </div>
                        </main>
                    </div>
                </ResponsivePreview>

                <div className="mt-4">
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
            </div>

            {/* Sections with Subheadings */}
            <div className="mb-10 relative">
                <h2 className="text-xl font-semibold mb-4">Sections with Subheadings</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Organized navigation with section headers to group related items.
                </p>

                <ResponsivePreview>
                    {/* Structure de simulation de page : Sidebar + Contenu */}
                    <div className="flex h-full w-full border border-gray-300 rounded-lg shadow-xl overflow-hidden bg-white">
                        {/* 296px est la largeur standard */}
                        <div className="h-full flex-shrink-0 w-[296px] relative overflow-hidden transform">
                            <SidebarNavigationSectionsSubheadings
                                activeUrl="/"
                                items={navItemsWithSections}
                                // className="h-full"
                            />
                        </div>

                        {/* Contenu principal simulé */}
                        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 border-l border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800">
                                Page Content (Sections)
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Content next to the sectioned sidebar.
                            </p>
                            <div className="h-[400px] mt-4 bg-white border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                                Main Page Content Area
                            </div>
                        </main>
                    </div>
                </ResponsivePreview>

                <div className="mt-4">
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
            </div>

            {/* Section Dividers */}
            <div className="mb-10 relative">
                <h2 className="text-xl font-semibold mb-4">Section Dividers</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Navigation with visual dividers to separate different groups of items.
                </p>

                <ResponsivePreview>
                    {/* Structure de simulation de page : Sidebar + Contenu */}
                    <div className="flex h-full w-full border border-gray-300 rounded-lg shadow-xl overflow-hidden bg-white">
                        <div className="h-full flex-shrink-0 w-[296px] relative overflow-hidden transform">
                            <SidebarNavigationSectionDividers
                                activeUrl="/"
                                items={navItemsWithDividers}
                                // className="h-full"
                            />
                        </div>

                        {/* Contenu principal simulé */}
                        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 border-l border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800">
                                Page Content (Dividers)
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Content next to the sidebar with dividers.
                            </p>
                            <div className="h-[400px] mt-4 bg-white border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                                Main Page Content Area
                            </div>
                        </main>
                    </div>
                </ResponsivePreview>

                <div className="mt-4">
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
            </div>

            {/* API Reference (Non modifié) */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>
                {/* ... (votre tableau API) ... */}
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
