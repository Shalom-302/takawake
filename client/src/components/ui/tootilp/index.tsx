"use client";

import type { ReactNode } from "react";
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const tooltipContentVariants = cva(
    [
        "z-50 overflow-hidden rounded-lg shadow-lg will-change-transform",
        "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
    ],
    {
        variants: {
            variant: {
                default: "bg-primary-solid text-white",
                secondary: "bg-secondary text-secondary-foreground",
                outline: "bg-background text-foreground border border-border",
            },
            size: {
                sm: "px-2 py-1 text-xs",
                md: "px-3 py-2 text-sm",
                lg: "px-4 py-3 text-base",
            },
            maxWidth: {
                xs: "max-w-xs",
                sm: "max-w-sm",
                md: "max-w-md",
                lg: "max-w-lg",
                none: "max-w-none",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "sm",
            maxWidth: "xs",
        },
    }
);

const tooltipArrowVariants = cva("", {
    variants: {
        variant: {
            default: "fill-primary-solid",
            secondary: "fill-secondary",
            outline: "fill-background [&>path]:stroke-border [&>path]:stroke-1",
        },
        size: {
            sm: "w-2 h-2",
            md: "w-2.5 h-2.5",
            lg: "w-3 h-3",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "sm",
    },
});

type TooltipProviderProps = React.ComponentProps<typeof TooltipPrimitive.Provider> & {
    closeDelay?: number;
};

function TooltipProvider({ delayDuration = 300, children, ...props }: TooltipProviderProps) {
    return (
        <TooltipPrimitive.Provider delayDuration={delayDuration} {...props}>
            {children}
        </TooltipPrimitive.Provider>
    );
}

// Interface pour le tooltip complet
interface TooltipProps
    extends Omit<React.ComponentProps<typeof TooltipPrimitive.Root>, "children">,
        VariantProps<typeof tooltipContentVariants>,
        VariantProps<typeof tooltipArrowVariants> {
    trigger: ReactNode;
    /** Content to display in the tooltip */
    content: ReactNode;
    /** Side where the tooltip should appear */
    side?: "top" | "right" | "bottom" | "left";
    /** Alignment of the tooltip relative to the trigger */
    align?: "start" | "center" | "end";
    /** Offset from the trigger element */
    sideOffset?: number;
    /** Offset along the alignment axis */
    alignOffset?: number;
    /** Whether to show the arrow */
    arrow?: boolean;
    /** Custom class for the content */
    contentClassName?: string;
    /** Custom class for the arrow */
    arrowClassName?: string;
    /** Delay before showing tooltip */
    delayDuration?: number;
    /** Delay before closing tooltip */
    closeDelay?: number;
    /** Whether tooltip should be wrapped in provider (set to false if already wrapped) */
    disableProvider?: boolean;
}

// CORRECTION: Composant interne sans provider
const TooltipInternal = ({
    trigger,
    content,
    side = "top",
    align = "center",
    sideOffset = 6,
    alignOffset,
    arrow = false,
    variant = "default",
    size = "sm",
    maxWidth = "xs",
    contentClassName,
    arrowClassName,
    open,
    defaultOpen,
    onOpenChange,
    ...props
}: Omit<TooltipProps, "delayDuration" | "disableProvider">) => {
    return (
        <TooltipPrimitive.Root
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            {...props}
        >
            <TooltipPrimitive.Trigger asChild>{trigger}</TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                    side={side}
                    align={align}
                    sideOffset={sideOffset}
                    alignOffset={alignOffset}
                    className={cn(
                        tooltipContentVariants({
                            variant,
                            size,
                            maxWidth,
                        }),
                        contentClassName
                    )}
                    avoidCollisions={true}
                    collisionPadding={8}
                >
                    {content}

                    {arrow && (
                        <TooltipPrimitive.Arrow
                            className={cn(
                                tooltipArrowVariants({
                                    variant,
                                    size,
                                }),
                                arrowClassName
                            )}
                        />
                    )}
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
    );
};

export const Tooltip = ({
    delayDuration = 300,
    closeDelay = 0,
    disableProvider = false,
    ...props
}: TooltipProps) => {
    if (disableProvider) {
        return <TooltipInternal {...props} />;
    }

    return (
        <TooltipProvider delayDuration={delayDuration} closeDelay={closeDelay}>
            <TooltipInternal {...props} />
        </TooltipProvider>
    );
};

// Composants de base exportés pour usage avancé
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipContent = TooltipPrimitive.Content;
export const TooltipArrow = TooltipPrimitive.Arrow;
export const TooltipRoot = TooltipPrimitive.Root;
export const TooltipPortal = TooltipPrimitive.Portal;

// Hook personnalisé pour usage avancé avec provider partagé
export const useTooltipProvider = (delayDuration = 300) => {
    return React.useMemo(() => ({ delayDuration }), [delayDuration]);
};
