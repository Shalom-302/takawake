"use client";

import { cn } from "@/lib/utils/cn";
import { cva, VariantProps } from "class-variance-authority";

const avatarOnlineVariants = cva(
    "absolute right-0 bottom-0 rounded-full ring-[1.5px] ring-bg-primary",
    {
        variants: {
            size: {
                xs: "size-1.5",
                sm: "size-2",
                md: "size-2.5",
                lg: "size-3",
                xl: "size-3.5",
                "2xl": "size-4",
                "3xl": "size-4.5",
                "4xl": "size-5",
            },
            status: {
                online: "bg-fg-success-secondary",
                offline: "bg-fg-disabled_subtle",
            },
        },
        defaultVariants: {
            size: "xs",
            status: "offline",
        },
    }
);

export type AvatarOnlineIndicatorProps = React.ComponentProps<"span"> &
    VariantProps<typeof avatarOnlineVariants>;

export const AvatarOnlineIndicator = ({
    size,
    status,
    className,
    ...props
}: AvatarOnlineIndicatorProps) => (
    <span className={cn(avatarOnlineVariants({ size, status }), className)} {...props} />
);
