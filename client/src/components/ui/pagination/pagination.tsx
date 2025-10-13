"use client";

import { ArrowLeft, ArrowRight } from "@untitled-ui/icons-react";
import * as React from "react";
import type { PaginationRootProps } from "./pagination-base";
import { PaginationBase } from "./pagination-base";
import { cn } from "@/lib/utils/cn";
import { Button, ButtonToggleGroupCustom } from "../button";
import { useBreakpoint } from "@/lib/hooks/use-breakpoint";

interface PaginationProps extends Partial<Omit<PaginationRootProps, "children">> {
    /** Whether the pagination buttons are rounded (for page variants) */
    rounded?: boolean;
    align?: "left" | "center" | "right";
    variant?: "default" | "minimal" | "card" | "card-minimal" | "button-group";
}

export const Pagination = ({
    variant = "default",
    align,
    rounded = false,
    className,
    ...props
}: PaginationProps) => {
    if (variant === "default")
        return <PaginationPageDefault className={className} rounded={rounded} {...props} />;
    if (variant === "minimal") return <PaginationPageMinimal className={className} {...props} />;
    if (variant === "card")
        return <PaginationCardDefault className={className} rounded={rounded} {...props} />;
    if (variant === "card-minimal")
        return <PaginationCardMinimal className={className} align={align} {...props} />;
    if (variant === "button-group")
        return <PaginationButtonGroup className={className} align={align} {...props} />;
};

function PaginationPageDefault({
    rounded,
    page = 1,
    total = 10,
    className,
    ...props
}: PaginationProps) {
    const isDesktop = useBreakpoint("md");

    return (
        <PaginationBase.Root
            {...props}
            page={page}
            total={total}
            className={cn(
                "flex w-full items-center justify-between gap-3 border-t border-secondary pt-4 md:pt-5",
                className
            )}
        >
            <div className="hidden flex-1 justify-start md:flex">
                <PaginationBase.PrevTrigger asChild>
                    <Button leftIcon={ArrowLeft} variant="link-gray" size="sm">
                        {isDesktop ? "Previous" : undefined}{" "}
                    </Button>
                </PaginationBase.PrevTrigger>
            </div>

            <PaginationBase.PrevTrigger asChild className="md:hidden">
                <Button leftIcon={ArrowLeft} variant="secondary" size="sm">
                    {isDesktop ? "Previous" : undefined}
                </Button>
            </PaginationBase.PrevTrigger>

            <PaginationBase.Context>
                {({ pages, currentPage, total }) => (
                    <>
                        <div className="hidden justify-center gap-0.5 md:flex">
                            {pages.map((page, index) =>
                                page.type === "page" ? (
                                    <PaginationItem key={index} rounded={rounded} {...page} />
                                ) : (
                                    <PaginationBase.Ellipsis
                                        key={index}
                                        className="flex size-10 shrink-0 items-center justify-center text-tertiary"
                                    >
                                        &#8230;
                                    </PaginationBase.Ellipsis>
                                )
                            )}
                        </div>

                        <div className="flex justify-center text-sm whitespace-pre text-fg-secondary md:hidden">
                            Page <span className="font-medium">{currentPage}</span> of{" "}
                            <span className="font-medium">{total}</span>
                        </div>
                    </>
                )}
            </PaginationBase.Context>

            <div className="hidden flex-1 justify-end md:flex">
                <PaginationBase.NextTrigger asChild>
                    <Button rightIcon={ArrowRight} variant="link-gray" size="sm">
                        {isDesktop ? "Next" : undefined}
                    </Button>
                </PaginationBase.NextTrigger>
            </div>
            <PaginationBase.NextTrigger asChild className="md:hidden">
                <Button rightIcon={ArrowRight} variant="secondary" size="sm">
                    {isDesktop ? "Next" : undefined}
                </Button>
            </PaginationBase.NextTrigger>
        </PaginationBase.Root>
    );
}

function PaginationPageMinimal({ page = 1, total = 10, className, ...props }: PaginationProps) {
    const isDesktop = useBreakpoint("md");

    return (
        <PaginationBase.Root
            {...props}
            page={page}
            total={total}
            className={cn(
                "flex w-full items-center justify-between gap-3 border-t border-secondary pt-4 md:pt-5",
                className
            )}
        >
            <div className="hidden flex-1 justify-start md:flex">
                <PaginationBase.PrevTrigger asChild>
                    <Button leftIcon={ArrowLeft} variant="link-gray" size="sm">
                        {isDesktop ? "Previous" : undefined}{" "}
                    </Button>
                </PaginationBase.PrevTrigger>
            </div>

            <PaginationBase.PrevTrigger asChild className="md:hidden">
                <Button leftIcon={ArrowLeft} variant="secondary" size="sm">
                    {isDesktop ? "Previous" : undefined}
                </Button>
            </PaginationBase.PrevTrigger>

            <span className={cn("text-sm font-medium text-fg-secondary")}>
                Page {page} of {total}
            </span>

            <div className="hidden flex-1 justify-end md:flex">
                <PaginationBase.NextTrigger asChild>
                    <Button rightIcon={ArrowRight} variant="link-gray" size="sm">
                        {isDesktop ? "Next" : undefined}
                    </Button>
                </PaginationBase.NextTrigger>
            </div>
            <PaginationBase.NextTrigger asChild className="md:hidden">
                <Button rightIcon={ArrowRight} variant="secondary" size="sm">
                    {isDesktop ? "Next" : undefined}
                </Button>
            </PaginationBase.NextTrigger>
        </PaginationBase.Root>
    );
}

function PaginationCardDefault({ rounded, page = 1, total = 10, ...props }: PaginationProps) {
    const isDesktop = useBreakpoint("md");

    return (
        <PaginationBase.Root
            {...props}
            page={page}
            total={total}
            className="flex w-full items-center justify-between gap-3 border-t border-secondary px-4 py-3 md:px-6 md:pt-3 md:pb-4"
        >
            <div className="flex flex-1 justify-start">
                <PaginationBase.PrevTrigger asChild>
                    <Button leftIcon={ArrowLeft} variant="secondary" size="sm">
                        {isDesktop ? "Previous" : undefined}
                    </Button>
                </PaginationBase.PrevTrigger>
            </div>

            <PaginationBase.Context>
                {({ pages, currentPage, total }) => (
                    <>
                        <div className="hidden justify-center gap-0.5 md:flex">
                            {pages.map((page, index) =>
                                page.type === "page" ? (
                                    <PaginationItem key={index} rounded={rounded} {...page} />
                                ) : (
                                    <PaginationBase.Ellipsis
                                        key={index}
                                        className="flex size-10 shrink-0 items-center justify-center text-tertiary"
                                    >
                                        &#8230;
                                    </PaginationBase.Ellipsis>
                                )
                            )}
                        </div>

                        <div className="flex justify-center text-sm whitespace-pre text-fg-secondary md:hidden">
                            Page <span className="font-medium">{currentPage}</span> of{" "}
                            <span className="font-medium">{total}</span>
                        </div>
                    </>
                )}
            </PaginationBase.Context>

            <div className="flex flex-1 justify-end">
                <PaginationBase.NextTrigger asChild>
                    <Button rightIcon={ArrowRight} variant="secondary" size="sm">
                        {isDesktop ? "Next" : undefined}
                    </Button>
                </PaginationBase.NextTrigger>
            </div>
        </PaginationBase.Root>
    );
}

interface PaginationCardMinimalProps {
    /** The current page. */
    page?: number;
    /** The total number of pages. */
    total?: number;
    /** The alignment of the pagination. */
    align?: "left" | "center" | "right";
    /** The class name of the pagination component. */
    className?: string;
    /** The function to call when the page changes. */
    onPageChange?: (page: number) => void;
}

function PaginationCardMinimal({
    page = 1,
    total = 10,
    align = "left",
    onPageChange,
    className,
}: PaginationCardMinimalProps) {
    return (
        <div
            className={cn("border-t border-secondary px-4 py-3 md:px-6 md:pt-3 md:pb-4", className)}
        >
            <MobilePagination page={page} total={total} onPageChange={onPageChange} />

            <nav
                aria-label="PaginationBase"
                className={cn(
                    "hidden items-center gap-3 md:flex",
                    align === "center" && "justify-between"
                )}
            >
                <div className={cn(align === "center" && "flex flex-1 justify-start")}>
                    <Button
                        isDisabled={page === 1}
                        variant="secondary"
                        size="sm"
                        onClick={() => onPageChange?.(Math.max(0, page - 1))}
                    >
                        Previous
                    </Button>
                </div>

                <span
                    className={cn(
                        "text-sm font-medium text-fg-secondary",
                        align === "right" && "order-first mr-auto",
                        align === "left" && "order-last ml-auto"
                    )}
                >
                    Page {page} of {total}
                </span>

                <div className={cn(align === "center" && "flex flex-1 justify-end")}>
                    <Button
                        isDisabled={page === total}
                        variant="secondary"
                        size="sm"
                        onClick={() => onPageChange?.(Math.min(total, page + 1))}
                    >
                        Next
                    </Button>
                </div>
            </nav>
        </div>
    );
}

interface PaginationButtonGroupProps extends Partial<Omit<PaginationRootProps, "children">> {
    /** The alignment of the pagination. */
    align?: "left" | "center" | "right";
}

function PaginationButtonGroup({
    align = "left",
    page = 1,
    total = 10,
    ...props
}: PaginationButtonGroupProps) {
    const isDesktop = useBreakpoint("md");

    return (
        <div
            className={cn(
                "flex border-t border-secondary px-4 py-3 md:px-6 md:pt-3 md:pb-4",
                align === "left" && "justify-start",
                align === "center" && "justify-center",
                align === "right" && "justify-end"
            )}
        >
            <PaginationBase.Root {...props} page={page} total={total}>
                <PaginationBase.Context>
                    {({ pages }) => (
                        <ButtonToggleGroupCustom.Root type="single" value={`${page}`} size="md">
                            <PaginationBase.PrevTrigger asChild>
                                <ButtonToggleGroupCustom.Item
                                    value="previous"
                                    leftIcon={ArrowLeft}
                                    label={isDesktop ? "Previous" : undefined}
                                />
                            </PaginationBase.PrevTrigger>

                            {pages.map((page, index) =>
                                page.type === "page" ? (
                                    <PaginationBase.Item key={index} {...page} asChild>
                                        <ButtonToggleGroupCustom.Item
                                            value={`${page.value}`}
                                            label={page.value}
                                            className="size-10 items-center justify-center"
                                        />
                                    </PaginationBase.Item>
                                ) : (
                                    <PaginationBase.Ellipsis key={index}>
                                        <ButtonToggleGroupCustom.Item
                                            value=""
                                            label="&#8230;"
                                            className="pointer-events-none size-10 items-center justify-center rounded-none!"
                                        />
                                    </PaginationBase.Ellipsis>
                                )
                            )}

                            <PaginationBase.NextTrigger asChild>
                                <ButtonToggleGroupCustom.Item
                                    value="next"
                                    rightIcon={ArrowRight}
                                    label={isDesktop ? "Next" : undefined}
                                />
                            </PaginationBase.NextTrigger>
                        </ButtonToggleGroupCustom.Root>
                    )}
                </PaginationBase.Context>
            </PaginationBase.Root>
        </div>
    );
}

interface PaginationProps extends Partial<Omit<PaginationRootProps, "children">> {
    /** Whether the pagination buttons are rounded. */
    rounded?: boolean;
}

const PaginationItem = ({
    value,
    rounded,
    isCurrent,
}: {
    value: number;
    rounded?: boolean;
    isCurrent: boolean;
}) => {
    return (
        <PaginationBase.Item
            value={value}
            isCurrent={isCurrent}
            className={({ isSelected }) =>
                cn(
                    "flex size-10 cursor-pointer items-center justify-center p-3 text-sm font-medium text-quaternary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover hover:text-secondary focus-visible:z-10 focus-visible:bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2",
                    rounded ? "rounded-full" : "rounded-lg",
                    isSelected && "bg-primary_hover text-secondary"
                )
            }
        >
            {value}
        </PaginationBase.Item>
    );
};

// Composant de pagination mobile
const MobilePagination = ({
    page = 1,
    total = 10,
    className,
    onPageChange,
}: {
    page?: number;
    total?: number;
    className?: string;
    onPageChange?: (page: number) => void;
}) => {
    return (
        <nav
            aria-label="PaginationBase"
            className={cn("flex items-center justify-between md:hidden", className)}
        >
            <Button
                aria-label="Go to previous page"
                leftIcon={ArrowLeft}
                variant="secondary"
                size="sm"
                onClick={() => onPageChange?.(Math.max(0, page - 1))}
                isDisabled={page <= 1}
            />

            <span className="text-sm text-fg-secondary">
                Page <span className="font-medium">{page}</span> of{" "}
                <span className="font-medium">{total}</span>
            </span>

            <Button
                aria-label="Go to next page"
                rightIcon={ArrowRight}
                variant="secondary"
                size="sm"
                onClick={() => onPageChange?.(Math.min(total, page + 1))}
                isDisabled={page >= total}
            />
        </nav>
    );
};
