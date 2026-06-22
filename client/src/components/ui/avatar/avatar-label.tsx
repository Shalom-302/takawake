"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "./avatar";
import type { AvatarProps } from "./avatar";

const avatarLabelVariants = cva("group flex min-w-0 flex-1 items-center", {
    variants: {
        size: {
            md: "gap-2",
            lg: "gap-2",
            xl: "gap-3",
            "2xl": "gap-4",
            "profile-sm": "gap-4",
            "profile-md": "gap-4",
            "profile-lg": "gap-4",
        },
    },
    defaultVariants: {
        size: "md",
    },
});

const avatarLabelTitleVariants = cva("text-primary font-semibold", {
    variants: {
        size: {
            md: "text-sm",
            lg: "text-sm",
            xl: "text-md",
            "2xl": "text-lg",
            "profile-sm": "text-display-sm",
            "profile-md": "text-display-md",
            "profile-lg": "text-display-lg",
        },
    },
    defaultVariants: {
        size: "md",
    },
});

const avatarLabelSubtitleVariants = cva("truncate text-tertiary", {
    variants: {
        size: {
            md: "text-xs",
            lg: "text-sm",
            xl: "text-md",
            "2xl": "text-md",
            "profile-sm": "text-lg",
            "profile-md": "text-xl",
            "profile-lg": "text-display-xs",
        },
    },
    defaultVariants: {
        size: "md",
    },
});

interface AvatarLabelProps extends Omit<AvatarProps, "title"> {
    title: string | React.ReactNode;
    subtitle: string | React.ReactNode;
}

export const AvatarLabel = ({
    title,
    subtitle,
    size = "md",
    className,
    ...avatarProps
}: AvatarLabelProps) => {
    const adaptedSize = size === "xxs" || size === "xs" || size === "sm" ? "md" : size;
    return (
        <figure className={cn(avatarLabelVariants({ size: adaptedSize }), className)}>
            <Avatar size={adaptedSize} {...avatarProps} />
            <figcaption className="min-w-0 flex-1">
                <p className={avatarLabelTitleVariants({ size: adaptedSize })}>{title}</p>
                <p className={avatarLabelSubtitleVariants({ size: adaptedSize })}>{subtitle}</p>
            </figcaption>
        </figure>
    );
};
