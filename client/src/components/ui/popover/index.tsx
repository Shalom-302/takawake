"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils/cn";

interface PopoverProps extends PopoverRootProps {
    trigger: React.ReactNode;
    content: React.ReactNode;
    align?: "center" | "start" | "end";
    sideOffset?: number;
    triggerClassName?: string;
    contentClassName?: string;
}

function Popover({
    trigger,
    content,
    align,
    sideOffset,
    triggerClassName,
    contentClassName,
    ...props
}: PopoverProps) {
    return (
        <PopoverRoot {...props}>
            <PopoverTrigger asChild className={triggerClassName}>
                {trigger}
            </PopoverTrigger>
            <PopoverContent align={align} sideOffset={sideOffset} className={contentClassName}>
                {content}
            </PopoverContent>
        </PopoverRoot>
    );
}

type PopoverRootProps = React.ComponentProps<typeof PopoverPrimitive.Root>;

function PopoverRoot({ ...props }: PopoverRootProps) {
    return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
    return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

type PopoverContentProps = React.ComponentProps<typeof PopoverPrimitive.Content>;

function PopoverContent({
    className,
    align = "center",
    sideOffset = 4,
    ...props
}: PopoverContentProps) {
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
                data-slot="popover-content"
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    "z-50 w-72 rounded-lg bg-primary p-0 shadow-lg ring-1 ring-secondary_alt outline-none",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
                    "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                    className
                )}
                {...props}
            />
        </PopoverPrimitive.Portal>
    );
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
    return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverRoot, PopoverTrigger, PopoverContent, PopoverAnchor };
