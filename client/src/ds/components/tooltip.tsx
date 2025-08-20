"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
    Tooltip as ShadcnTooltip,
    TooltipContent as ShadcnTooltipContent,
    TooltipProvider as ShadcnTooltipProvider,
    TooltipTrigger as ShadcnTooltipTrigger,
} from "@/components/ui/tooltip";

// Variants pour TooltipContent
const tooltipContentVariants = cva(
    "z-50 overflow-hidden rounded-md border bg-popover text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
    {
        variants: {
            variant: {
                default: "px-3 py-1.5",
                wide: "px-4 py-2",
                narrow: "px-2 py-1",
            },
            size: {
                default: "text-sm",
                sm: "text-xs",
                lg: "text-base",
            },
            rounded: {
                default: "rounded-md",
                full: "rounded-full",
                none: "rounded-none",
                sm: "rounded-sm",
                lg: "rounded-lg",
                xl: "rounded-xl",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            rounded: "default",
        },
    }
);

// Interface pour les props du TooltipContent
export interface TooltipContentProps
    extends React.ComponentPropsWithoutRef<typeof ShadcnTooltipContent>,
        VariantProps<typeof tooltipContentVariants> {}

// Composant TooltipContent avec variants
const TooltipContent = React.forwardRef<
    React.ElementRef<typeof ShadcnTooltipContent>,
    TooltipContentProps
>(({ className, variant, size, rounded, ...props }, ref) => (
    <ShadcnTooltipContent
        ref={ref}
        className={cn(tooltipContentVariants({ variant, size, rounded }), className)}
        {...props}
    />
));
TooltipContent.displayName = "TooltipContent";

// Interface pour le composant SimplifiedTooltip
export interface SimplifiedTooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    // Props pour le style
    variant?: VariantProps<typeof tooltipContentVariants>["variant"];
    size?: VariantProps<typeof tooltipContentVariants>["size"];
    rounded?: VariantProps<typeof tooltipContentVariants>["rounded"];
    // Props pour le comportement
    delayDuration?: number;
    skipDelayDuration?: number;
    disableHoverableContent?: boolean;
    side?: "top" | "right" | "bottom" | "left";
    sideOffset?: number;
    align?: "start" | "center" | "end";
    alignOffset?: number;
    avoidCollisions?: boolean;
    // Classes personnalisées
    className?: string;
    contentClassName?: string;
    triggerClassName?: string;
}

// Composant SimplifiedTooltip avec API simplifiée
export function SimplifiedTooltip({
    content,
    children,
    variant,
    size,
    rounded,
    delayDuration,
    skipDelayDuration,
    disableHoverableContent,
    side,
    sideOffset = 4,
    align,
    alignOffset,
    avoidCollisions,
    className,
    contentClassName,
    triggerClassName,
}: SimplifiedTooltipProps) {
    return (
        <ShadcnTooltipProvider
            delayDuration={delayDuration}
            skipDelayDuration={skipDelayDuration}
            disableHoverableContent={disableHoverableContent}
        >
            <ShadcnTooltip>
                <ShadcnTooltipTrigger asChild className={cn(triggerClassName)}>
                    <span className={cn("inline-block", className)}>{children}</span>
                </ShadcnTooltipTrigger>
                <TooltipContent
                    variant={variant}
                    size={size}
                    rounded={rounded}
                    side={side}
                    sideOffset={sideOffset}
                    align={align}
                    alignOffset={alignOffset}
                    avoidCollisions={avoidCollisions}
                    className={contentClassName}
                >
                    {content}
                </TooltipContent>
            </ShadcnTooltip>
        </ShadcnTooltipProvider>
    );
}

// Réexporter SimplifiedTooltip comme alias pour une meilleure lisibilité dans les imports
export { SimplifiedTooltip as Tooltip };
