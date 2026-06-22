"use client";

import type { ReactNode } from "react";
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils/cn";

interface TooltipProps {
    /**
     * The title of the tooltip.
     */
    title: ReactNode;
    /**
     * The description of the tooltip.
     */
    description?: ReactNode;
    /**
     * The children that trigger the tooltip.
     */
    children?: ReactNode;
    /**
     * The trigger element (alternative to children).
     */
    trigger?: ReactNode;
    /**
     * Whether to show the arrow on the tooltip.
     *
     * @default false
     */
    arrow?: boolean;
    /**
     * Delay in milliseconds before the tooltip is shown.
     *
     * @default 300
     */
    delayDuration?: number;
    /**
     * Delay in milliseconds before the tooltip is closed.
     *
     * @default 0
     */
    closeDelay?: number;
    /**
     * Whether the tooltip is disabled.
     */
    isDisabled?: boolean;
    /**
     * Whether the tooltip is open (controlled).
     */
    open?: boolean;
    /**
     * Whether the tooltip is open by default (uncontrolled).
     */
    defaultOpen?: boolean;
    /**
     * Offset from the trigger element.
     *
     * @default 6
     */
    sideOffset?: number;
    /**
     * Cross offset for visual balance.
     */
    crossOffset?: number;
    /**
     * Side where the tooltip should appear.
     *
     * @default "top"
     */
    side?: "top" | "right" | "bottom" | "left";
    /**
     * Alignment of the tooltip relative to the trigger.
     *
     * @default "center"
     */
    align?: "start" | "center" | "end";
    /**
     * Callback when the tooltip open state changes.
     */
    onOpenChange?: (open: boolean) => void;
    contentClassName?: string;
    titleClassName?: string;
}

export function Tooltip({
    title,
    description,
    children,
    trigger,
    arrow = false,
    delayDuration = 300,
    closeDelay = 0,
    isDisabled,
    open,
    defaultOpen,
    sideOffset,
    crossOffset,
    side = "top",
    align = "center",
    onOpenChange,
    contentClassName,
    titleClassName,
}: TooltipProps) {
    // Déterminer l'élément trigger
    const triggerElement = trigger || children;

    // Calculer le cross offset automatique pour équilibrage visuel
    const isTopOrBottomStart = (side === "top" || side === "bottom") && align === "start";
    const isTopOrBottomEnd = (side === "top" || side === "bottom") && align === "end";
    const calculatedCrossOffset =
        crossOffset ?? (isTopOrBottomStart ? -12 : isTopOrBottomEnd ? 12 : 0);

    if (isDisabled || !triggerElement) {
        return <>{triggerElement}</>;
    }

    return (
        <TooltipProvider delayDuration={delayDuration} skipDelayDuration={closeDelay}>
            <TooltipRoot open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
                <TooltipTrigger asChild>{triggerElement}</TooltipTrigger>
                <TooltipContent
                    side={side}
                    align={align}
                    sideOffset={sideOffset}
                    alignOffset={calculatedCrossOffset}
                    arrow={arrow}
                    className={cn(description ? "py-3" : "py-2", contentClassName)}
                >
                    <span className={cn("text-xs font-semibold text-white", titleClassName)}>
                        {title}
                    </span>

                    {description && (
                        <span className="text-xs font-medium text-tooltip-supporting-text">
                            {description}
                        </span>
                    )}
                </TooltipContent>
            </TooltipRoot>
        </TooltipProvider>
    );
}

export function TooltipProvider({
    delayDuration = 300,
    skipDelayDuration = 0,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
    return (
        <TooltipPrimitive.Provider
            data-slot="tooltip-provider"
            delayDuration={delayDuration}
            skipDelayDuration={skipDelayDuration}
            {...props}
        />
    );
}

export function TooltipRoot({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
    return (
        <TooltipProvider>
            <TooltipPrimitive.Root data-slot="tooltip" {...props} />
        </TooltipProvider>
    );
}

export function TooltipTrigger({
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
    return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

export function TooltipContent({
    className,
    sideOffset = 6,
    children,
    arrow = false,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
    arrow?: boolean;
}) {
    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                data-slot="tooltip-content"
                sideOffset={sideOffset}
                className={cn(
                    "z-50 flex max-w-xs flex-col items-start gap-1 rounded-lg bg-primary-solid px-3 shadow-lg will-change-transform",
                    // Animations d'entrée
                    "animate-in fade-in zoom-in-95 duration-200",
                    "data-[side=bottom]:slide-in-from-top-0.5",
                    "data-[side=left]:slide-in-from-right-0.5",
                    "data-[side=right]:slide-in-from-left-0.5",
                    "data-[side=top]:slide-in-from-bottom-0.5",
                    // Animations de sortie
                    "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 data-[state=closed]:duration-150",
                    "data-[state=closed]:data-[side=bottom]:slide-out-to-top-0.5",
                    "data-[state=closed]:data-[side=left]:slide-out-to-right-0.5",
                    "data-[state=closed]:data-[side=right]:slide-out-to-left-0.5",
                    "data-[state=closed]:data-[side=top]:slide-out-to-bottom-0.5",
                    className
                )}
                avoidCollisions={true}
                collisionPadding={8}
                {...props}
            >
                {children}

                {arrow && (
                    <TooltipPrimitive.Arrow asChild>
                        <svg
                            viewBox="0 0 100 100"
                            className="size-2.5 fill-primary-solid data-[side=left]:-rotate-90 data-[side=right]:rotate-90 data-[side=top]:rotate-0 data-[side=bottom]:rotate-180"
                        >
                            <path d="M0,0 L35.858,35.858 Q50,50 64.142,35.858 L100,0 Z" />
                        </svg>
                    </TooltipPrimitive.Arrow>
                )}
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
    );
}
