"use client";

import { cn } from "@/lib/utils/cn";
import { X as CloseIcon } from "@untitled-ui/icons-react";

const sizes = {
    xs: { root: "size-7", icon: "size-4" },
    sm: { root: "size-9", icon: "size-5" },
    md: { root: "size-10", icon: "size-5" },
    lg: { root: "size-11", icon: "size-6" },
};

const themes = {
    light: "text-fg-quaternary hover:bg-primary_hover hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus-ring",
    dark: "text-fg-white/70 hover:text-fg-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus-ring",
};

interface CloseButtonProps extends React.ComponentProps<"button"> {
    theme?: "light" | "dark";
    size?: "xs" | "sm" | "md" | "lg";
    label?: string;
}

export const CloseButton = ({
    label,
    className,
    size = "sm",
    theme = "light",
    ...otherProps
}: CloseButtonProps) => {
    return (
        <button
            {...otherProps}
            aria-label={label || "Close"}
            className={cn(
                "flex cursor-pointer items-center justify-center rounded-lg p-2 transition duration-100 ease-linear focus:outline-hidden",
                sizes[size].root,
                themes[theme],
                className
            )}
        >
            <CloseIcon
                aria-hidden="true"
                className={cn("shrink-0 transition-inherit-all", sizes[size].icon)}
            />
        </button>
    );
};
