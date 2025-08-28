import * as React from "react";
import {
    Badge as ShadcnBadge,
    badgeVariants as shadcnBadgeVariants,
} from "@/components/ui/badges/badge";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

// Extension des variants de badge de shadcn
export const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
                destructive:
                    "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
                outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
                // Nouveaux variants personnalisés
                success: "border-transparent bg-green-500 text-white [a&]:hover:bg-green-600",
                warning: "border-transparent bg-yellow-500 text-black [a&]:hover:bg-yellow-600",
                info: "border-transparent bg-blue-500 text-white [a&]:hover:bg-blue-600",
                ghost: "border-transparent bg-transparent text-foreground hover:bg-accent",
            },
            size: {
                default: "px-2 py-0.5 text-xs",
                sm: "px-1.5 py-0.25 text-[0.6rem]",
                lg: "px-2.5 py-0.75 text-sm",
            },
            rounded: {
                default: "rounded-md",
                full: "rounded-full",
                none: "rounded-none",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            rounded: "default",
        },
    }
);

export interface BadgeProps
    extends React.ComponentProps<typeof ShadcnBadge>,
        VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, rounded, ...props }: BadgeProps) {
    return (
        <ShadcnBadge
            className={cn(badgeVariants({ variant, size, rounded }), className)}
            {...props}
        />
    );
}
