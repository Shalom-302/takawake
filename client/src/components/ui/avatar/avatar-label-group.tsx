"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "./avatar";
import type { AvatarProps } from "./avatar";

const avatarLabelGroupVariants = cva("group flex min-w-0 flex-1 items-center", {
    variants: {
        size: {
            sm: "gap-2",
            md: "gap-2",
            lg: "gap-3",
            xl: "gap-4",
        },
    },
    defaultVariants: {
        size: "md",
    },
});

const avatarLabelGroupTitleVariants = cva("text-primary font-semibold", {
    variants: {
        size: {
            sm: "text-sm",
            md: "text-sm",
            lg: "text-md",
            xl: "text-lg",
        },
    },
    defaultVariants: {
        size: "md",
    },
});

const avatarLabelGroupSubtitleVariants = cva("truncate text-tertiary", {
    variants: {
        size: {
            sm: "text-xs",
            md: "text-sm",
            lg: "text-md",
            xl: "text-md",
        },
    },
    defaultVariants: {
        size: "md",
    },
});

interface AvatarLabelGroupProps
    extends Omit<AvatarProps, "size" | "title">,
        VariantProps<typeof avatarLabelGroupVariants> {
    size: "sm" | "md" | "lg" | "xl";
    title: string | React.ReactNode;
    subtitle: string | React.ReactNode;
}

export const AvatarLabelGroup = ({
    title,
    subtitle,
    size = "md",
    className,
    ...avatarProps
}: AvatarLabelGroupProps) => {
    const avatarSize = size === "xl" ? "2xl" : size === "lg" ? "xl" : size === "md" ? "lg" : "md";

    return (
        <figure className={cn(avatarLabelGroupVariants({ size }), className)}>
            <Avatar size={avatarSize} {...avatarProps} />
            <figcaption className="min-w-0 flex-1">
                <p className={avatarLabelGroupTitleVariants({ size })}>{title}</p>
                <p className={avatarLabelGroupSubtitleVariants({ size })}>{subtitle}</p>
            </figcaption>
        </figure>
    );
};
