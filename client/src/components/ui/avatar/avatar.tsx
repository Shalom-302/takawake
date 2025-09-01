"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";
import { AvatarOnlineIndicator, AvatarOnlineIndicatorProps, VerifiedTick } from "./base-components";
import { User01 } from "@untitled-ui/icons-react";

const avatarVariants = cva("bg-avatar-bg outline-transparent", {
    variants: {
        size: {
            xxs: "size-4 outline-[0.5px] -outline-offset-[0.5px]",
            xs: "size-6 outline-[0.5px] -outline-offset-[0.5px]",
            sm: "size-8 outline-[0.75px] -outline-offset-[0.75px]",
            md: "size-10 outline-1 -outline-offset-1",
            lg: "size-12 outline-1 -outline-offset-1",
            xl: "size-14 outline-1 -outline-offset-1",
            "2xl": "size-16 outline-1 -outline-offset-1",
        },
        contrastBorder: {
            true: "outline outline-avatar-contrast-border",
            false: "",
        },
        focusable: {
            true: "group-outline-focus-ring group-focus-visible:outline-2 group-focus-visible:outline-offset-2",
            false: "",
        },
    },
    defaultVariants: {
        size: "md",
        contrastBorder: true,
        focusable: false,
    },
});

const avatarIconVariants = cva("text-fg-quaternary", {
    variants: {
        size: {
            xxs: "size-3",
            xs: "size-4",
            sm: "size-5",
            md: "size-6",
            lg: "size-7",
            xl: "size-8",
            "2xl": "size-8",
        },
    },
    defaultVariants: {
        size: "md",
    },
});

interface AvatarProps
    extends React.ComponentProps<typeof AvatarPrimitive.Root>,
        VariantProps<typeof avatarVariants> {
    src?: string | null;
    alt?: string;
    initials?: string;
    placeholderIcon?: React.ComponentType<{ className?: string }>;
    status?: AvatarOnlineIndicatorProps["status"];
    verified?: boolean;
    customBadge?: React.ReactNode;
}

function Avatar({
    className,
    src,
    alt,
    size = "md",
    contrastBorder = true,
    focusable = false,
    initials,
    placeholderIcon: PlaceholderIcon,
    status,
    verified,
    customBadge,
    ...props
}: AvatarProps) {
    return (
        <div className="relative w-fit">
            <AvatarRoot
                className={cn(avatarVariants({ size, contrastBorder, focusable }), className)}
                {...props}
            >
                {src && <AvatarImage src={src} alt={alt} />}
                <AvatarFallback size={size} initials={initials} placeholderIcon={PlaceholderIcon} />
            </AvatarRoot>
            {/* Badges et indicateurs */}
            {status && (
                <AvatarOnlineIndicator
                    status={status}
                    size={size === "xxs" ? "xs" : size}
                    className="z-10"
                />
            )}

            {verified && (
                <VerifiedTick
                    size={size === "xxs" ? "xs" : size}
                    className={cn(
                        "absolute right-0 bottom-0",
                        (size === "xxs" || size === "xs") && "-right-px -bottom-px"
                    )}
                />
            )}

            {customBadge && !status && !verified && customBadge}
        </div>
    );
}

function AvatarRoot({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
    return (
        <AvatarPrimitive.Root
            data-slot="avatar"
            className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
            {...props}
        />
    );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
    return (
        <AvatarPrimitive.Image
            className={cn("size-full rounded-full object-cover", className)}
            {...props}
        />
    );
}

const avatarFallbackVariants = cva(
    "flex size-full items-center justify-center rounded-full font-semibold text-quaternary",
    {
        variants: {
            size: {
                xxs: "text-xs",
                xs: "text-xs",
                sm: "text-sm",
                md: "text-md",
                lg: "text-lg",
                xl: "text-xl",
                "2xl": "text-display-xs",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
);

interface AvatarFallbackProps
    extends React.ComponentProps<typeof AvatarPrimitive.Fallback>,
        VariantProps<typeof avatarFallbackVariants> {
    initials?: string;
    placeholderIcon?: React.ComponentType<{ className?: string }>;
}

function AvatarFallback({
    className,
    size = "md",
    initials,
    placeholderIcon: PlaceholderIcon,
    ...props
}: AvatarFallbackProps) {
    const renderContent = () => {
        if (initials) return initials;
        if (PlaceholderIcon) {
            return <PlaceholderIcon className={avatarIconVariants({ size })} />;
        }
        return <User01 className={avatarIconVariants({ size })} />;
    };

    return (
        <AvatarPrimitive.Fallback
            className={cn(avatarFallbackVariants({ size }), className)}
            {...props}
        >
            {renderContent()}
        </AvatarPrimitive.Fallback>
    );
}

export { Avatar, AvatarRoot, AvatarImage, AvatarFallback };
