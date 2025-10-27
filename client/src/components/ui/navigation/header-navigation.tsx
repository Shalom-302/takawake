"use client";

import type { FC, ReactNode } from "react";
import {
    MobileNavigationHeader,
    NavAccountCard,
    NavAccountMenu,
    NavItemBase,
    NavItemButton,
    NavList,
} from "./base-components";
import { UntitledLogo } from "@/components/icons/logo/untitledui-logo";
import { Input } from "@/components/ui/input";
import { Bell01, LifeBuoy01, SearchLg, Settings01 } from "@untitled-ui/icons-react";
import { BadgeWithDot } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/avatar";
import { Popover } from "@/components/ui/popover";
import Link from "next/link";

type NavItem = {
    /** Label text for the nav item. */
    label: string;
    /** URL to navigate to when the nav item is clicked. */
    href: string;
    /** Whether the nav item is currently active. */
    current?: boolean;
    /** Icon component to display. */
    icon?: FC<{ className?: string }>;
    /** Badge to display. */
    badge?: ReactNode;
    /** List of sub-items to display. */
    items?: NavItem[];
};

interface HeaderNavigationBaseProps {
    /** URL of the currently active item. */
    activeUrl?: string;
    /** List of items to display. */
    items: NavItem[];
    /** List of sub-items to display. */
    subItems?: NavItem[];
    /** Content to display in the trailing position. */
    trailingContent?: ReactNode;
    /** Whether to show the avatar dropdown. */
    showAvatarDropdown?: boolean;
    /** Whether to hide the bottom border. */
    hideBorder?: boolean;
}

export const HeaderNavigationBase = ({
    activeUrl,
    items,
    subItems,
    trailingContent,
    showAvatarDropdown = true,
    hideBorder = false,
}: HeaderNavigationBaseProps) => {
    const activeSubNavItems =
        subItems || items.find(item => item.current && item.items && item.items.length > 0)?.items;

    const showSecondaryNav = activeSubNavItems && activeSubNavItems.length > 0;

    return (
        <>
            <MobileNavigationHeader>
                <aside className="flex h-full max-w-full flex-col justify-between overflow-auto border-r border-secondary bg-primary pt-4 lg:pt-6">
                    <div className="flex flex-col gap-5 px-4 lg:px-5">
                        <Input
                            shortcut
                            size="sm"
                            aria-label="Search"
                            placeholder="Search"
                            leftIcon={SearchLg}
                        />
                    </div>

                    <NavList items={items} />

                    <div className="mt-auto flex flex-col gap-4 px-2 py-4 lg:px-4 lg:py-6">
                        <div className="flex flex-col gap-1">
                            <NavItemBase type="link" href="#" icon={LifeBuoy01}>
                                Support
                            </NavItemBase>
                            <NavItemBase
                                type="link"
                                href="#"
                                icon={Settings01}
                                badge={
                                    <BadgeWithDot color="success" variant="modern" size="sm">
                                        Online
                                    </BadgeWithDot>
                                }
                            >
                                Settings
                            </NavItemBase>
                            <NavItemBase
                                type="link"
                                href="https://www.untitledui.com/"
                                icon={Settings01}
                            >
                                Open in browser
                            </NavItemBase>
                        </div>

                        <NavAccountCard />
                    </div>
                </aside>
            </MobileNavigationHeader>

            <header className="max-lg:hidden">
                <section
                    className={cn(
                        "flex h-16 w-full items-center justify-center bg-primary md:h-18",
                        (!hideBorder || showSecondaryNav) && "border-b border-secondary"
                    )}
                >
                    <div className="flex w-full max-w-container justify-between pr-3 pl-4 md:px-8">
                        <div className="flex flex-1 items-center gap-4">
                            <Link
                                aria-label="Go to homepage"
                                href="/"
                                className="rounded-xs outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                            >
                                <UntitledLogo className="h-8" />
                            </Link>

                            <nav>
                                <ul className="flex items-center gap-0.5">
                                    {items.map(item => (
                                        <li key={item.label} className="py-0.5">
                                            <NavItemBase
                                                icon={item.icon}
                                                href={item.href}
                                                current={item.current}
                                                badge={item.badge}
                                                type="link"
                                            >
                                                {item.label}
                                            </NavItemBase>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>

                        <div className="flex items-center gap-3">
                            {trailingContent}

                            <div className="flex gap-0.5">
                                <NavItemButton
                                    current={activeUrl === "/settings-01"}
                                    size="md"
                                    icon={Settings01}
                                    label="Settings"
                                    href="/settings-01"
                                    tooltipPlacement="bottom"
                                />
                                <NavItemButton
                                    current={activeUrl === "/notifications-01"}
                                    size="md"
                                    icon={Bell01}
                                    label="Notifications"
                                    href="/notifications-01"
                                    tooltipPlacement="bottom"
                                />
                            </div>

                            {showAvatarDropdown && (
                                <Popover
                                    align="end"
                                    sideOffset={8}
                                    contentClassName="w-auto p-0"
                                    trigger={
                                        <Avatar
                                            alt="Olivia Rhye"
                                            src="https://www.untitledui.com/images/avatars/olivia-rhye?bg=%23E0E0E0"
                                            size="md"
                                            className="relative inline-flex cursor-pointer rounded-full p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                                        />
                                    }
                                    content={<NavAccountMenu />}
                                />
                            )}
                        </div>
                    </div>
                </section>

                {showSecondaryNav && (
                    <section
                        className={cn(
                            "flex h-16 w-full items-center justify-center bg-primary",
                            !hideBorder && "border-b border-secondary"
                        )}
                    >
                        <div className="flex w-full max-w-container items-center justify-between gap-8 px-8">
                            <nav>
                                <ul className="flex items-center gap-0.5">
                                    {activeSubNavItems.map(item => (
                                        <li key={item.label} className="py-0.5">
                                            <NavItemBase
                                                icon={item.icon}
                                                href={item.href}
                                                current={item.current}
                                                badge={item.badge}
                                                type="link"
                                            >
                                                {item.label}
                                            </NavItemBase>
                                        </li>
                                    ))}
                                </ul>
                            </nav>

                            <Input
                                shortcut
                                aria-label="Search"
                                placeholder="Search"
                                leftIcon={SearchLg}
                                size="sm"
                                inputClassName="max-w-xs"
                            />
                        </div>
                    </section>
                )}
            </header>
        </>
    );
};
