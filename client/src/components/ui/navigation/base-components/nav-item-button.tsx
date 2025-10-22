"use client";

import type { DOMAttributes, FC, MouseEventHandler } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import { Slot } from "@radix-ui/react-slot";

const styles = {
    md: {
        root: "size-10",
        icon: "size-5",
    },
    lg: {
        root: "size-12",
        icon: "size-6",
    },
};

interface NavItemButtonProps {
    /** Whether the collapsible nav item is open. */
    open?: boolean;
    /** URL to navigate to when the button is clicked. */
    href?: string;
    /** Label text for the button. */
    label: string;
    /** Icon component to display. */
    icon: FC<{ className?: string }>;
    /** Whether the button is currently active. */
    current?: boolean;
    /** Size of the button. */
    size?: "md" | "lg";
    /** Handler for click events. */
    onClick?: MouseEventHandler;
    /** Additional CSS classes to apply to the button. */
    className?: string;
    /** Placement of the tooltip. */
    tooltipPlacement?: "top" | "right" | "bottom" | "left";
}

export const NavItemButton = ({
    current: current,
    label,
    href,
    icon: Icon,
    size = "md",
    className,
    tooltipPlacement = "right",
    onClick,
}: NavItemButtonProps) => {
    return (
        <Tooltip
            trigger={
                <Pressable>
                    <a
                        href={href}
                        aria-label={label}
                        onClick={onClick}
                        className={cn(
                            "relative flex w-full cursor-pointer items-center justify-center rounded-md bg-primary p-2 text-fg-quaternary outline-focus-ring transition duration-100 ease-linear select-none hover:bg-primary_hover hover:text-fg-quaternary_hover focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
                            current &&
                                "bg-active text-fg-quaternary_hover hover:bg-secondary_hover",
                            styles[size].root,
                            className
                        )}
                    >
                        <Icon
                            aria-hidden="true"
                            className={cn("shrink-0 transition-inherit-all", styles[size].icon)}
                        />
                    </a>
                </Pressable>
            }
            title={label}
            side={tooltipPlacement}
        />
    );
};

interface PressableProps {
    children: React.ReactElement<DOMAttributes<HTMLAnchorElement>, string>;
    isDisabled?: boolean;
    onPress?: () => void;
    className?: string;
}

export function Pressable({ children, isDisabled, onPress, className }: PressableProps) {
    const handleClick = (e: React.MouseEvent) => {
        if (isDisabled) {
            e.preventDefault();
            return;
        }
        onPress?.();
        // Propager l'événement click original de l'enfant
        children.props.onClick?.(e as React.MouseEvent<HTMLAnchorElement>);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (isDisabled) return;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPress?.();
        }
        children.props.onKeyDown?.(e as React.KeyboardEvent<HTMLAnchorElement>);
    };

    return (
        <Slot
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={cn(className, isDisabled && "pointer-events-none opacity-50")}
        >
            {children}
        </Slot>
    );
}
