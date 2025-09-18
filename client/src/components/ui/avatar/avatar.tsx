"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { User01 } from "@untitled-ui/icons-react";
import { AvatarOnlineIndicator, AvatarOnlineIndicatorProps, VerifiedTick } from "./base-components";

// Styles de l'élément racine (le conteneur)
const avatarRootVariants = cva(
    "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full",
    {
        variants: {
            size: {
                xxs: "size-4",
                xs: "size-6",
                sm: "size-8",
                md: "size-10",
                lg: "size-12",
                xl: "size-14",
                "2xl": "size-16",
                // Profile variants (revised)
                "profile-sm": "size-12",
                "profile-md": "size-16",
                "profile-lg": "size-24",
            },
            variant: {
                default: "bg-avatar-bg outline-transparent",
                profile: "bg-primary ring-1 ring-secondary_alt",
            },
            withPlaceholder: {
                true: "",
                false: "",
            },
            focusable: {
                true: "group-outline-focus-ring group-focus-visible:outline-2 group-focus-visible:outline-offset-2",
                false: "",
            },
        },
        compoundVariants: [
            // Styles de placeholder pour les variantes de profil
            { variant: "profile", withPlaceholder: false, className: "p-0.75" },
            { variant: "profile", size: "profile-sm", withPlaceholder: false, className: "p-0.75" },
            { variant: "profile", size: "profile-md", withPlaceholder: false, className: "p-1" },
            { variant: "profile", size: "profile-lg", withPlaceholder: false, className: "p-1.5" },
            { variant: "profile", withPlaceholder: true, className: "p-1" },
            { variant: "profile", size: "profile-sm", withPlaceholder: true, className: "p-1" },
            { variant: "profile", size: "profile-md", withPlaceholder: true, className: "p-1.25" },
            { variant: "profile", size: "profile-lg", withPlaceholder: true, className: "p-1.75" },
        ],
        defaultVariants: {
            size: "md",
            variant: "default",
            focusable: false,
        },
    }
);

// Styles de l'image (l'image elle-même)
const avatarImageVariants = cva("size-full rounded-full object-cover", {
    variants: {
        shadow: {
            "profile-sm": "shadow-sm",
            "profile-md": "shadow-xl",
            "profile-lg": "shadow-2xl",
        },
        contrastBorder: {
            true: "outline-1 -outline-offset-1 outline-avatar-contrast-border",
            false: "",
        },
    },
    defaultVariants: {
        contrastBorder: true,
    },
});

// Styles du fallback (initiales ou icône)
const avatarFallbackVariants = cva(
    "flex size-full items-center justify-center rounded-full font-semibold text-quaternary bg-tertiary ring-1 ring-secondary_alt",
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
                // Profile variants (revised)
                "profile-sm": "text-lg",
                "profile-md": "text-xl",
                "profile-lg": "text-2xl",
            },
            shadow: {
                "profile-sm": "shadow-sm",
                "profile-md": "shadow-xl",
                "profile-lg": "shadow-2xl",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
);

// Styles des icônes de fallback
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
            // Profile variants (revised)
            "profile-sm": "size-7",
            "profile-md": "size-8",
            "profile-lg": "size-10",
        },
    },
    defaultVariants: {
        size: "md",
    },
});

export interface AvatarProps
    extends React.ComponentProps<typeof AvatarPrimitive.Root>,
        VariantProps<typeof avatarRootVariants> {
    src?: string | null;
    alt?: string;
    initials?: string;
    placeholderIcon?: React.ComponentType<{ className?: string }>;
    status?: AvatarOnlineIndicatorProps["status"];
    verified?: boolean;
    customBadge?: React.ReactNode;
    contrastBorder?: boolean;
    size?:
        | "xxs"
        | "xs"
        | "sm"
        | "md"
        | "lg"
        | "xl"
        | "2xl"
        | "profile-sm"
        | "profile-md"
        | "profile-lg";
    variant?: "default" | "profile";
}

function Avatar({
    className,
    src,
    alt,
    size = "md",
    variant = "default",
    focusable = false,
    initials,
    placeholderIcon: PlaceholderIcon,
    status,
    verified,
    customBadge,
    contrastBorder = true,
    ...props
}: AvatarProps) {
    const hasImage = !!src;
    const isProfileVariant = variant === "profile";
    const shadowSize = isProfileVariant ? size : undefined;

    const tickSizeMap = {
        xxs: "xs",
        xs: "xs",
        sm: "md",
        md: "lg",
        lg: "xl",
        xl: "2xl",
        "2xl": "2xl",
        "profile-sm": "xl",
        "profile-md": "2xl",
        "profile-lg": "3xl",
    } as const;
    const badgeSize = tickSizeMap[size] || "md";

    return (
        <div className="relative w-fit">
            <AvatarPrimitive.Root
                className={cn(
                    avatarRootVariants({ size, variant, focusable, withPlaceholder: !hasImage }),
                    isProfileVariant && !hasImage && "bg-tertiary",
                    className
                )}
                {...props}
            >
                <AvatarPrimitive.Image
                    src={src!}
                    alt={alt ?? "user-image"}
                    className={cn(
                        avatarImageVariants({
                            shadow: isProfileVariant
                                ? (shadowSize as "profile-sm" | "profile-md" | "profile-lg")
                                : undefined,
                            contrastBorder: isProfileVariant ? contrastBorder : undefined,
                        })
                    )}
                />
                <AvatarFallback
                    size={size}
                    initials={initials}
                    placeholderIcon={PlaceholderIcon}
                    shadow={
                        isProfileVariant
                            ? (shadowSize as "profile-sm" | "profile-md" | "profile-lg")
                            : undefined
                    }
                />
            </AvatarPrimitive.Root>
            {/* Rendu des badges et indicateurs */}
            {status && (
                <AvatarOnlineIndicator
                    status={status}
                    size={badgeSize}
                    className={cn(
                        "z-10 absolute",
                        // Adjusted positioning for profile variant
                        isProfileVariant ? "bottom-0.5 right-0.5" : "bottom-0 right-0",
                        (size === "xxs" || size === "xs") && "-right-px -bottom-px"
                    )}
                />
            )}
            {verified && (
                <VerifiedTick
                    size={badgeSize}
                    className={cn(
                        "z-10 absolute",
                        // Adjusted positioning for profile variant
                        isProfileVariant ? "bottom-0.5 right-0.5" : "bottom-0 right-0",
                        (size === "xxs" || size === "xs") && "-right-px -bottom-px"
                    )}
                />
            )}
            {customBadge && !status && !verified && customBadge}
        </div>
    );
}

const AvatarFallback = ({
    className,
    size,
    initials,
    placeholderIcon: PlaceholderIcon,
    shadow,
    ...props
}: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> &
    VariantProps<typeof avatarFallbackVariants> &
    VariantProps<typeof avatarIconVariants> & {
        initials?: string;
        placeholderIcon?: React.ComponentType<{ className?: string }>;
    }) => {
    const renderContent = () => {
        if (initials) return initials;
        if (PlaceholderIcon) return <PlaceholderIcon className={avatarIconVariants({ size })} />;
        return <User01 className={avatarIconVariants({ size })} />;
    };

    return (
        <AvatarPrimitive.Fallback
            className={cn(avatarFallbackVariants({ size, shadow }), className)}
            {...props}
        >
            {renderContent()}
        </AvatarPrimitive.Fallback>
    );
};
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

const AvatarImage = ({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>) => (
    <AvatarPrimitive.Image className={cn("size-full object-cover", className)} {...props} />
);
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

export { Avatar, AvatarFallback, AvatarImage };
