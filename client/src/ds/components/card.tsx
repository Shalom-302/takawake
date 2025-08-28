import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import {
    Card as ShadcnCard,
    CardHeader as ShadcnCardHeader,
    CardFooter as ShadcnCardFooter,
    CardTitle as ShadcnCardTitle,
    CardDescription as ShadcnCardDescription,
    CardContent as ShadcnCardContent,
} from "@/components/ui/card";

const cardVariants = cva("rounded-lg border shadow-sm", {
    variants: {
        variant: {
            default:
                "border-neutral-200 bg-white text-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50",
            destructive:
                "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-50",
            success:
                "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-50",
            warning:
                "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-50",
            info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-50",
            neutral:
                "border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
            outline: "bg-transparent border-2 border-neutral-200 dark:border-neutral-800",
            ghost: "border-transparent bg-transparent shadow-none",
            glass: "bg-white/80 backdrop-blur-md border-white/20 dark:bg-black/80 dark:border-black/20",
            accent: "border-accent-200 bg-accent-50 text-accent-900 dark:border-accent-800 dark:bg-accent-950 dark:text-accent-50",
        },
        size: {
            default: "p-6",
            xs: "p-2",
            sm: "p-4",
            md: "p-6",
            lg: "p-8",
            xl: "p-10",
        },
        hover: {
            default: "",
            lift: "transition-transform duration-200 hover:-translate-y-1",
            glow: "transition-shadow duration-200 hover:shadow-md",
            scale: "transition-transform duration-200 hover:scale-[1.02]",
            border: "transition-colors duration-200 hover:border-primary",
        },
        rounded: {
            default: "rounded-lg",
            none: "rounded-none",
            sm: "rounded-md",
            md: "rounded-lg",
            lg: "rounded-xl",
            full: "rounded-2xl",
        },
        shadow: {
            default: "shadow-sm",
            none: "shadow-none",
            sm: "shadow-sm",
            md: "shadow-md",
            lg: "shadow-lg",
            xl: "shadow-xl",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
        hover: "default",
        rounded: "default",
        shadow: "default",
    },
});

export interface CardProps
    extends React.ComponentPropsWithoutRef<typeof ShadcnCard>,
        VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<React.ElementRef<typeof ShadcnCard>, CardProps>(
    ({ className, variant, size, hover, rounded, shadow, ...props }, ref) => (
        <ShadcnCard
            ref={ref}
            className={cn(cardVariants({ variant, size, hover, rounded, shadow }), className)}
            {...props}
        />
    )
);
Card.displayName = "Card";

// Re-export the other card components
export {
    Card,
    ShadcnCardHeader as CardHeader,
    ShadcnCardFooter as CardFooter,
    ShadcnCardTitle as CardTitle,
    ShadcnCardDescription as CardDescription,
    ShadcnCardContent as CardContent,
};
