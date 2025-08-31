"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import {
    Avatar as ShadcnAvatar,
    AvatarImage as ShadcnAvatarImage,
    AvatarFallback as ShadcnAvatarFallback,
} from "@/components/ui/avatar/avatar";

const avatarVariants = cva("relative flex shrink-0 overflow-hidden", {
    variants: {
        variant: {
            default: "rounded-full",
            rounded: "rounded-md",
            square: "rounded-none",
            soft: "rounded-xl",
        },
        size: {
            xs: "h-6 w-6 text-[10px]",
            sm: "h-8 w-8 text-xs",
            default: "h-10 w-10 text-sm",
            lg: "h-12 w-12 text-base",
            xl: "h-16 w-16 text-lg",
            "2xl": "h-20 w-20 text-xl",
        },
        border: {
            none: "",
            default: "ring-2 ring-border",
            primary: "ring-2 ring-primary",
            secondary: "ring-2 ring-secondary",
            accent: "ring-2 ring-accent",
        },
        status: {
            none: "",
            online: "after:absolute after:bottom-0 after:right-0 after:h-2 after:w-2 after:rounded-full after:bg-green-500 after:ring-1 after:ring-background",
            offline:
                "after:absolute after:bottom-0 after:right-0 after:h-2 after:w-2 after:rounded-full after:bg-gray-400 after:ring-1 after:ring-background",
            busy: "after:absolute after:bottom-0 after:right-0 after:h-2 after:w-2 after:rounded-full after:bg-red-500 after:ring-1 after:ring-background",
            away: "after:absolute after:bottom-0 after:right-0 after:h-2 after:w-2 after:rounded-full after:bg-yellow-500 after:ring-1 after:ring-background",
        },
        group: {
            true: "-ml-2 first:ml-0 border-2 border-background",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
        border: "none",
        status: "none",
    },
});

const avatarFallbackVariants = cva(
    "flex h-full w-full items-center justify-center rounded-inherit",
    {
        variants: {
            variant: {
                default: "bg-muted",
                primary: "bg-primary text-primary-foreground",
                secondary: "bg-secondary text-secondary-foreground",
                accent: "bg-accent text-accent-foreground",
                gradient: "bg-gradient-to-br from-primary to-accent text-white",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface AvatarProps
    extends React.ComponentPropsWithoutRef<typeof ShadcnAvatar>,
        VariantProps<typeof avatarVariants> {}

const Avatar = React.forwardRef<React.ElementRef<typeof ShadcnAvatar>, AvatarProps>(
    ({ className, variant, size, border, status, group, ...props }, ref) => (
        <ShadcnAvatar
            className={cn(avatarVariants({ variant, size, border, status, group }), className)}
            ref={ref}
            {...props}
        />
    )
);
Avatar.displayName = "Avatar";

export interface AvatarFallbackProps
    extends React.ComponentPropsWithoutRef<typeof ShadcnAvatarFallback>,
        VariantProps<typeof avatarFallbackVariants> {}

const AvatarFallback = React.forwardRef<
    React.ElementRef<typeof ShadcnAvatarFallback>,
    AvatarFallbackProps
>(({ className, variant, ...props }, ref) => (
    <ShadcnAvatarFallback
        className={cn(avatarFallbackVariants({ variant }), className)}
        ref={ref}
        {...props}
    />
));
AvatarFallback.displayName = "AvatarFallback";

// Re-export avec nos composants personnalisés
export { Avatar, ShadcnAvatarImage as AvatarImage, AvatarFallback };
