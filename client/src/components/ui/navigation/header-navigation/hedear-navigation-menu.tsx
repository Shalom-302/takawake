"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown } from "@untitled-ui/icons-react";
import { Button } from "@/components/ui/button/button";
import { UntitledLogo } from "@/components/icons/logo/untitledui-logo";
import { UntitledLogoMinimal } from "@/components/icons/logo/untitledui-logo-minimal";
import { cn } from "@/lib/utils/cn";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
} from "./navigation-menu";
import { DialogCustom as Dialog } from "@/components/ui/dialog";
import Link from "next/link";

export type HeaderNavItem = {
    label: string;
    href: string;
    menu?: ReactNode;
};

const MobileNavItem = (props: {
    className?: string;
    label: string;
    href?: string;
    children?: ReactNode;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    if (props.href) {
        return (
            <li>
                <a
                    href={props.href}
                    className="flex items-center justify-between px-4 py-3 text-md font-semibold text-primary hover:bg-primary_hover"
                >
                    {props.label}
                </a>
            </li>
        );
    }

    return (
        <li className="flex flex-col gap-0.5">
            <button
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between px-4 py-3 text-md font-semibold text-primary hover:bg-primary_hover"
            >
                {props.label}
                <ChevronDown
                    className={cn(
                        "size-4 stroke-[2.625px] text-fg-quaternary transition duration-100 ease-linear",
                        isOpen ? "-rotate-180" : "rotate-0"
                    )}
                />
            </button>
            {isOpen && <div>{props.children}</div>}
        </li>
    );
};

const MobileFooter = ({ items }: { items: HeaderNavItem[] }) => {
    return (
        <div className="flex flex-col gap-8 border-t border-secondary px-4 py-6">
            <div>
                <ul className="grid grid-flow-col grid-cols-2 grid-rows-4 gap-x-6 gap-y-3">
                    {items.map(navItem => (
                        <li key={navItem.label}>
                            <Button variant="link-gray" size="lg" href={navItem.href}>
                                {navItem.label}
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col gap-3">
                <Button size="lg">Sign up</Button>
                <Button variant="secondary" size="lg">
                    Log in
                </Button>
            </div>
        </div>
    );
};

interface HeaderNavigationMenuProps {
    items?: HeaderNavItem[];
    footerItems?: HeaderNavItem[];
    viewport?: boolean;
    isFloating?: boolean;
    className?: string;
}

export const HeaderNavigationMenu = ({
    items,
    footerItems,
    viewport,
    isFloating,
    className,
}: HeaderNavigationMenuProps) => {
    return (
        <header
            className={cn(
                "relative flex h-18 w-full items-center justify-center md:h-20",
                isFloating && "h-16 md:h-19 md:pt-3",
                className
            )}
        >
            <div className="flex size-full max-w-container flex-1 items-center pr-3 pl-4 md:px-8">
                <div
                    className={cn(
                        "flex w-full justify-between gap-4",
                        isFloating &&
                            "ring-secondary_alt md:rounded-2xl md:bg-primary md:py-3 md:pr-3 md:pl-4 md:shadow-xs md:ring-1"
                    )}
                >
                    <div className="flex flex-1 items-center gap-5">
                        <UntitledLogo className="h-8 md:max-lg:hidden" />
                        <UntitledLogoMinimal className="hidden h-8 md:inline-block lg:hidden" />

                        {/* Desktop navigation avec NavigationMenu */}
                        <NavigationMenu className="max-md:hidden" viewport={viewport}>
                            <NavigationMenuList>
                                {items?.map(navItem => (
                                    <NavigationMenuItem key={navItem.label}>
                                        {navItem.menu ? (
                                            <>
                                                <NavigationMenuTrigger>
                                                    <span className="px-0.5">{navItem.label}</span>
                                                </NavigationMenuTrigger>
                                                <NavigationMenuContent
                                                    className={cn(
                                                        isFloating && "max-w-7xl px-8 pt-3"
                                                    )}
                                                >
                                                    {navItem.menu}
                                                </NavigationMenuContent>
                                            </>
                                        ) : (
                                            <NavigationMenuLink asChild>
                                                <Link href={navItem.href}>{navItem.label}</Link>
                                            </NavigationMenuLink>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="hidden items-center gap-3 md:flex">
                        <Button variant="secondary" size={isFloating ? "md" : "lg"}>
                            Log in
                        </Button>
                        <Button variant="primary" size={isFloating ? "md" : "lg"}>
                            Sign up
                        </Button>
                    </div>

                    {/* Mobile menu avec Dialog */}
                    <Dialog.Root>
                        <Dialog.Trigger asChild>
                            <button
                                aria-label="Toggle navigation menu"
                                className="group ml-auto cursor-pointer rounded-lg p-2 hover:bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring md:hidden"
                            >
                                <svg
                                    aria-hidden="true"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <path
                                        className="hidden text-secondary group-data-[state=open]:block"
                                        d="M18 6L6 18M6 6L18 18"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        className="text-secondary group-data-[state=open]:hidden"
                                        d="M3 12H21M3 6H21M3 18H21"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </Dialog.Trigger>

                        <Dialog.Portal>
                            <Dialog.Content
                                showCloseButton={false}
                                className="fixed inset-x-0 top-[72px] z-50 h-[calc(100vh-72px)] max-w-none translate-x-0 translate-y-0 border-0 bg-transparent p-0 shadow-none md:hidden"
                            >
                                <nav className="h-full w-full overflow-y-auto bg-primary shadow-lg">
                                    <ul className="flex flex-col gap-0.5 py-5">
                                        {items?.map(navItem =>
                                            navItem.menu ? (
                                                <MobileNavItem
                                                    key={navItem.label}
                                                    label={navItem.label}
                                                >
                                                    {navItem.menu}
                                                </MobileNavItem>
                                            ) : (
                                                <MobileNavItem
                                                    key={navItem.label}
                                                    label={navItem.label}
                                                    href={navItem.href}
                                                />
                                            )
                                        )}
                                    </ul>

                                    {footerItems && <MobileFooter items={footerItems} />}
                                </nav>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>
                </div>
            </div>
        </header>
    );
};
