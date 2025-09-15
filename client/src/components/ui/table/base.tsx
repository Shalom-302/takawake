"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

function BaseTable({ className, ...props }: React.ComponentProps<"table">) {
    return (
        <div data-slot="table-container" className="relative w-full overflow-x-auto">
            <table
                data-slot="table"
                className={cn("w-full overflow-x-hidden", className)}
                {...props}
            />
        </div>
    );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
    return (
        <thead
            data-slot="table-header"
            className={cn(
                "relative bg-secondary",
                //"[&_tr]:border-b"
                className
            )}
            {...props}
        />
    );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
    return (
        <tbody
            data-slot="table-body"
            className={cn(
                //"[&_tr:last-child]:border-0"
                className
            )}
            {...props}
        />
    );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
    return (
        <tfoot
            data-slot="table-footer"
            className={cn("bg-secondary border-t font-medium [&>tr]:last:border-b-0", className)}
            {...props}
        />
    );
}

function TableRow({
    className,
    highlightSelectedRow = true,
    size = "md",
    ...props
}: React.ComponentProps<"tr"> & {
    highlightSelectedRow?: boolean;
    size?: "sm" | "md";
}) {
    return (
        <tr
            data-slot="table-row"
            className={cn(
                "relative outline-focus-ring transition-colors after:pointer-events-none hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2",
                size === "sm" ? "h-14" : "h-18",
                highlightSelectedRow && "selected:bg-secondary",
                "[&>td]:after:absolute [&>td]:after:inset-x-0 [&>td]:after:bottom-0 [&>td]:after:h-px [&>td]:after:w-full [&>td]:after:bg-border-secondary last:[&>td]:after:hidden [&>td]:focus-visible:after:opacity-0 focus-visible:[&>td]:after:opacity-0",

                className
            )}
            {...props}
        />
    );
}

function TableHead({
    className,
    size = "md",
    bordered = true,
    ...props
}: React.ComponentProps<"th"> & {
    size?: "sm" | "md";
    bordered?: boolean;
}) {
    return (
        <th
            data-slot="table-head"
            className={cn(
                "relative p-0 px-6 py-2 outline-hidden focus-visible:z-1 focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-bg-primary focus-visible:ring-inset",
                size === "sm" ? "h-9" : "h-11",
                bordered &&
                    "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border-secondary focus-visible:after:bg-transparent",
                // "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"

                className
            )}
            {...props}
        />
    );
}

function TableCell({
    className,
    size = "md",
    ...props
}: React.ComponentProps<"td"> & {
    size?: "sm" | "md";
}) {
    return (
        <td
            data-slot="table-cell"
            className={cn(
                "relative text-sm text-tertiary outline-focus-ring focus-visible:z-1 focus-visible:outline-2 focus-visible:-outline-offset-2",
                size === "sm" && "px-5 py-3",
                size === "md" && "px-6 py-4",
                // "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                className
            )}
            {...props}
        />
    );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
    return (
        <caption
            data-slot="table-caption"
            className={cn("text-tertiary mt-4 text-sm", className)}
            {...props}
        />
    );
}

export {
    BaseTable,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
};
