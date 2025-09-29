"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ChevronRight, DotsHorizontal, HomeLine } from "@untitled-ui/icons-react";
import { Slot } from "@radix-ui/react-slot";

// ============ Types ============

interface BreadcrumbItemData {
    href?: string;
    label: string;
}

interface BreadcrumbProps extends React.ComponentProps<"nav"> {
    items: BreadcrumbItemData[];
    maxItems?: number;
    type?: "text" | "button";
    separator?: "icon" | "slash";
    onEllipsisClick?: () => React.ReactNode;
}

export function Breadcrumb({
    className,
    items,
    maxItems = 4,
    type = "text",
    separator = "icon",
    onEllipsisClick,
    ...props
}: BreadcrumbProps) {
    const shouldCollapse = items.length > maxItems;
    const firstItem = items[0];
    const lastItems = items.slice(-(maxItems - 1));

    return (
        <BreadcrumbRoot className={className} {...props}>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink type={type} href="/">
                        <HomeLine className="w-4 h-4" />
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator separator={separator} />
                <BreadcrumbItem>
                    {firstItem.href ? (
                        <BreadcrumbLink type={type} asChild>
                            <Link href={firstItem.href}>{firstItem.label}</Link>
                        </BreadcrumbLink>
                    ) : (
                        <BreadcrumbPage>{firstItem.label}</BreadcrumbPage>
                    )}
                </BreadcrumbItem>
                <BreadcrumbSeparator separator={separator} />
                {/* Ellipsis si besoin */}
                {shouldCollapse && onEllipsisClick ? (
                    <>
                        <BreadcrumbItem>{onEllipsisClick()}</BreadcrumbItem>
                        <BreadcrumbSeparator separator={separator} />
                    </>
                ) : null}
                {lastItems.map((item, idx) => {
                    // Détermine si cet élément est le dernier du tableau 'lastItems'
                    const isLast = idx === lastItems.length - 1;

                    const isLink = item.href && !isLast;

                    return (
                        <React.Fragment key={idx}>
                            <BreadcrumbItem>
                                {isLink ? (
                                    <BreadcrumbLink
                                        type={type}
                                        asChild
                                        className="max-w-20 truncate md:max-w-none"
                                    >
                                        <Link href={item.href!}>{item.label}</Link>
                                    </BreadcrumbLink>
                                ) : (
                                    <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                                        {item.label}
                                    </BreadcrumbPage>
                                )}
                            </BreadcrumbItem>

                            {/* Affiche le séparateur uniquement s'il ne s'agit pas du dernier élément */}
                            {!isLast && (
                                <BreadcrumbSeparator>
                                    {separator === "slash" && <span>/</span>}
                                </BreadcrumbSeparator>
                            )}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </BreadcrumbRoot>
    );
}

function BreadcrumbRoot({ className, ...props }: React.ComponentProps<"nav">) {
    return (
        <nav
            aria-label="breadcrumb"
            data-slot="breadcrumb"
            className={cn("flex w-full items-center space-x-1 text-sm", className)}
            {...props}
        />
    );
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
    return (
        <ol
            data-slot="list"
            className={cn("flex flex-wrap items-center gap-1.5 break-words", className)}
            {...props}
        />
    );
}

function BreadcrumbItem({
    className,

    ...props
}: React.ComponentProps<"li">) {
    return (
        <li
            data-slot="breadcrumb-item"
            className={cn(
                "inline-flex items-center gap-1.5 text-quaternary text-sm font-semibold",
                className
            )}
            {...props}
        />
    );
}

function BreadcrumbLink({
    asChild,
    type = "text",
    className,
    ...props
}: React.ComponentProps<"a"> & {
    asChild?: boolean;
    type?: "text" | "button";
}) {
    const Comp = asChild ? Slot : "a";
    return (
        <Comp
            data-slot="breadcrumb-link"
            className={cn(
                "hover:text-foreground transition-colors",
                type === "text" &&
                    "hover:text-tertiary_hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg-primary focus-visible:ring-offset-2 ",
                type === "button" && "px-2 py-1 rounded-md justify-center",
                className
            )}
            {...props}
        />
    );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
    return (
        <span
            data-slot="breadcrumb-page"
            role="link"
            aria-disabled="true"
            aria-current="page"
            className={cn("font-normal text-foreground", className)}
            {...props}
        />
    );
}

function BreadcrumbSeparator({
    className,
    separator = "icon",
    ...props
}: React.ComponentProps<"li"> & { separator?: "icon" | "slash" }) {
    return (
        <li
            data-slot="breadcrumb-separator"
            role="presentation"
            aria-hidden="true"
            className={cn("[&>svg]:size-3.5", className)}
            {...props}
        >
            {separator === "slash" ? <span>/</span> : <ChevronRight />}
        </li>
    );
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
    return (
        <span
            data-slot="breadcrumb-ellipsis"
            role="presentation"
            aria-hidden="true"
            className={cn("flex size-4 items-center justify-center", className)}
            {...props}
        >
            <DotsHorizontal className="size-4" />
            <span className="sr-only">More</span>
        </span>
    );
}

// ============ Exports ============

export const BreadcrumbComposition = {
    Root: BreadcrumbRoot,
    List: BreadcrumbList,
    Item: BreadcrumbItem,
    Link: BreadcrumbLink,
    Page: BreadcrumbPage,
    Separator: BreadcrumbSeparator,
    Ellipsis: BreadcrumbEllipsis,
};
