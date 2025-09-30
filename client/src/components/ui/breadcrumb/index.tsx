"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ChevronRight, ChevronDown, DotsHorizontal, HomeLine } from "@untitled-ui/icons-react";
import { Slot } from "@radix-ui/react-slot";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

interface BreadcrumbItemData {
    href?: string;
    label: string;
    dropdown?: {
        items: Array<{ label: string; href?: string; onClick?: () => void }>;
    };
}

type Variants = {
    variant?: "text" | "text-line" | "button";
};

interface BreadcrumbProps extends React.ComponentProps<"nav">, Variants {
    items: BreadcrumbItemData[];
    maxItems?: number;
    separator?: "icon" | "slash" | React.ReactNode;
    showHomeIcon?: boolean;
    showEllipsisDropdown?: boolean;
}

export function Breadcrumb({
    className,
    items,
    maxItems = 4,
    variant = "text",
    separator = "icon",
    showHomeIcon = true,
    showEllipsisDropdown = true,
    ...props
}: BreadcrumbProps) {
    const renderItems = () => {
        // Si on a moins d'items que maxItems, on les affiche tous
        if (items.length <= maxItems) {
            return items.map((item, idx) => (
                <React.Fragment key={idx}>
                    <BreadcrumbItem>
                        {renderItemContent(item, idx === items.length - 1)}
                    </BreadcrumbItem>
                    {idx < items.length - 1 && <BreadcrumbSeparator separator={separator} />}
                </React.Fragment>
            ));
        }

        // Logique de collapsage (maxItems - 2 pour le premier et le dernier affichés)
        const firstItem = items[0];
        // Nombre d'éléments visibles à la fin (y compris l'élément courant)
        const visibleEndCount = maxItems - 2;

        // Items cachés (entre le premier et les "visibleEndCount" derniers)
        const hiddenItems = items.slice(1, -visibleEndCount);

        // Les derniers éléments à afficher (y compris l'élément courant)
        const lastItems = items.slice(-visibleEndCount);

        return (
            <>
                <BreadcrumbItem>{renderItemContent(firstItem, false)}</BreadcrumbItem>
                <BreadcrumbSeparator separator={separator} />

                <BreadcrumbItem>
                    {showEllipsisDropdown && hiddenItems.length > 0 ? (
                        <BreadcrumbEllipsisDropdown items={hiddenItems} variant={variant} />
                    ) : (
                        <BreadcrumbEllipsis />
                    )}
                </BreadcrumbItem>
                <BreadcrumbSeparator separator={separator} />

                {lastItems.map((item, idx) => (
                    <React.Fragment key={`last-${idx}`}>
                        <BreadcrumbItem>
                            {renderItemContent(item, idx === lastItems.length - 1)}
                        </BreadcrumbItem>
                        {idx < lastItems.length - 1 && (
                            <BreadcrumbSeparator separator={separator} />
                        )}
                    </React.Fragment>
                ))}
            </>
        );
    };

    const renderItemContent = (item: BreadcrumbItemData, isLast: boolean) => {
        // Si c'est un dropdown
        if (item.dropdown) {
            return (
                <BreadcrumbDropdown
                    label={item.label}
                    items={item.dropdown.items}
                    variant={variant}
                />
            );
        }

        const isLink = item.href && !isLast;

        if (isLink) {
            return (
                <BreadcrumbLink
                    variant={variant}
                    asChild
                    className="max-w-20 truncate md:max-w-none"
                >
                    <Link href={item.href!}>{item.label}</Link>
                </BreadcrumbLink>
            );
        }

        return (
            <BreadcrumbPage variant={variant} className="max-w-20 truncate md:max-w-none">
                {item.label}
            </BreadcrumbPage>
        );
    };

    return (
        <BreadcrumbRoot className={className} {...props}>
            <BreadcrumbList variant={variant}>
                {showHomeIcon && (
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbLink variant={variant} href="/">
                                <HomeLine className="w-5 h-5" />
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator separator={separator} />
                    </>
                )}
                {renderItems()}
            </BreadcrumbList>
        </BreadcrumbRoot>
    );
}

// ============ Sub-components ============

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

function BreadcrumbList({ className, variant, ...props }: React.ComponentProps<"ol"> & Variants) {
    return (
        <ol
            data-slot="list"
            className={cn(
                "flex flex-wrap items-center gap-1.5 break-words",
                variant === "text-line" && "border-y border-secondary py-2",
                className
            )}
            {...props}
        />
    );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
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
    variant,
    className,
    ...props
}: React.ComponentProps<"a"> &
    Variants & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : "a";
    return (
        <Comp
            data-slot="breadcrumb-link"
            className={cn(
                "transition-colors",
                variant === "text" &&
                    "hover:text-tertiary_hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:rounded-xs",
                variant === "text-line" &&
                    "hover:text-tertiary_hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:rounded-xs",
                variant === "button" &&
                    "px-2 py-1 rounded-sm justify-center hover:bg-primary_hover hover:text-tertiary_hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:rounded-xs",
                className
            )}
            {...props}
        />
    );
}

function BreadcrumbPage({ className, variant, ...props }: React.ComponentProps<"span"> & Variants) {
    return (
        <span
            data-slot="breadcrumb-page"
            // Suppression de role="link" car ce n'est pas un élément interactif
            aria-disabled="true"
            aria-current="page"
            className={cn(
                "font-semibold",
                variant === "text" && "text-brand-secondary",
                variant === "text-line" && "text-brand-secondary",
                variant === "button" && "py-1 px-2 bg-primary_hover rounded-sm text-tertiary_hover",
                className
            )}
            {...props}
        />
    );
}

function BreadcrumbSeparator({
    className,
    separator = "icon",
    children,
    ...props
}: React.ComponentProps<"li"> & { separator?: "icon" | "slash" | React.ReactNode }) {
    const getSeparatorContent = () => {
        if (children) return children;
        if (separator === "slash") return <span>/</span>;
        // Utilisation de ChevronRight comme séparateur par défaut
        if (separator === "icon") return <ChevronRight className="size-3.5" />;
        return separator;
    };

    return (
        <li
            data-slot="breadcrumb-separator"
            role="presentation"
            aria-hidden="true"
            className={cn("[&>svg]:size-3.5", className)}
            {...props}
        >
            {getSeparatorContent()}
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

// Ellipsis avec dropdown interactif
function BreadcrumbEllipsisDropdown({
    items,
    variant,
}: {
    items: BreadcrumbItemData[];
    variant: Variants["variant"];
}) {
    const dropdownItems = items.map((item, idx) => ({
        id: `ellipsis-${idx}`,
        type: "item" as const,
        label: item.label,
        href: item.href,
        onClick: item.dropdown ? undefined : item.href ? undefined : () => {},
    }));

    return (
        <DropdownMenu
            trigger={
                <button
                    aria-label="Show hidden links"
                    className={cn(
                        "flex items-center justify-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:rounded-xs",
                        variant === "text" && "hover:text-tertiary_hover",
                        variant === "button" &&
                            "px-2 py-1 rounded-sm hover:bg-primary_hover hover:text-tertiary_hover"
                    )}
                >
                    <DotsHorizontal className="size-5" />
                    <span className="sr-only">Toggle links menu</span>
                </button>
            }
            items={dropdownItems}
            align="start"
        />
    );
}

// Composant Dropdown pour breadcrumb utilisant votre DropdownMenu
function BreadcrumbDropdown({
    label,
    items,
    variant,
}: {
    label: string;
    items: Array<{ label: string; href?: string; onClick?: () => void }>;
    variant?: "text" | "text-line" | "button";
}) {
    const dropdownItems = items.map((item, idx) => ({
        id: `breadcrumb-dropdown-${idx}`,
        type: "item" as const,
        label: item.label,
        href: item.href,
        onClick: item.onClick,
    }));

    return (
        <DropdownMenu
            trigger={
                <button
                    className={cn(
                        "inline-flex items-center gap-1 transition-colors cursor-pointer",
                        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:rounded-xs",
                        variant === "text" && "hover:text-tertiary_hover hover:underline ",
                        variant === "text-line" && "hover:text-tertiary_hover hover:underline ",
                        variant === "button" &&
                            "px-2 py-1 rounded-sm hover:bg-primary_hover hover:text-tertiary_hover"
                    )}
                >
                    {label}
                    <ChevronDown />
                </button>
            }
            items={dropdownItems}
            align="start"
        />
    );
}

// ============ Exports ============

export const BreadcrumbCustom = {
    Root: BreadcrumbRoot,
    List: BreadcrumbList,
    Item: BreadcrumbItem,
    Link: BreadcrumbLink,
    Page: BreadcrumbPage,
    Separator: BreadcrumbSeparator,
    Ellipsis: BreadcrumbEllipsis,
};
