"use client";

import type {
    AnchorHTMLAttributes,
    ButtonHTMLAttributes,
    DetailedHTMLProps,
    FC,
    ReactNode,
} from "react";
import React, { isValidElement } from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
    [
        "group relative inline-flex h-max cursor-pointer items-center justify-center whitespace-nowrap outline-brand transition duration-100 ease-linear before:absolute focus-visible:outline-2 focus-visible:outline-offset-2",
        // When button is used within `InputGroup`
        "in-data-input-wrapper:shadow-xs in-data-input-wrapper:focus:!z-50 in-data-input-wrapper:in-data-left:-mr-px in-data-input-wrapper:in-data-left:rounded-r-none in-data-input-wrapper:in-data-left:before:rounded-r-none in-data-input-wrapper:in-data-right:-ml-px in-data-input-wrapper:in-data-right:rounded-l-none in-data-input-wrapper:in-data-right:before:rounded-l-none",
        // Disabled styles
        "disabled:text-fg-disabled disabled:pointer-events-none",
        // Icon styles
        "disabled:[&_svg]:text-fg-disabled_subtle",
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 [&_svg]:shrink-0 [&_svg]:transition-inherit-all",
    ],
    {
        variants: {
            variant: {
                primary: [
                    "bg-brand-solid text-white shadow-xs-skeumorphic ring-1 ring-transparent ring-inset hover:bg-brand-solid_hover data-loading:bg-brand-solid_hover",
                    // Inner border gradient
                    "before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0%",
                    "disabled:bg-disabled disabled:shadow-xs disabled:ring-disabled_subtle",
                    "[&_svg]:text-button-primary-icon hover:[&_svg]:text-button-primary-icon_hover",
                ],
                secondary: [
                    "bg-primary text-secondary shadow-xs-skeumorphic ring-1 ring-primary ring-inset hover:bg-primary_hover hover:text-secondary_hover data-loading:bg-primary_hover",
                    "disabled:shadow-xs disabled:ring-disabled_subtle",
                    "[&_svg]:text-fg-quaternary hover:[&_svg]:text-fg-quaternary_hover",
                ],
                tertiary: [
                    "text-tertiary hover:bg-primary_hover hover:text-tertiary_hover data-loading:bg-primary_hover",
                    "[&_svg]:text-fg-quaternary hover:[&_svg]:text-fg-quaternary_hover",
                ],
                "link-gray": [
                    "justify-normal rounded p-0! text-tertiary hover:text-tertiary_hover",
                    "[&_svg]:text-fg-quaternary hover:[&_svg]:text-fg-quaternary_hover",
                ],
                "link-color": [
                    "justify-normal rounded p-0! text-brand-secondary hover:text-brand-secondary_hover",
                    "[&_svg]:text-fg-brand-secondary_alt hover:[&_svg]:text-fg-brand-secondary_hover",
                ],
                "primary-destructive": [
                    "bg-error-solid text-white shadow-xs-skeumorphic ring-1 ring-transparent outline-error ring-inset",
                    "before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0%",
                    "disabled:bg-disabled disabled:shadow-xs disabled:ring-disabled_subtle",
                    "[&_svg]:text-button-destructive-primary-icon hover:[&_svg]:text-button-destructive-primary-icon_hover",
                ],
                "secondary-destructive": [
                    "bg-primary text-error-primary shadow-xs-skeumorphic ring-1 ring-error_subtle outline-error ring-inset hover:bg-error-primary hover:text-error-primary_hover data-loading:bg-error-primary",
                    "disabled:bg-primary disabled:shadow-xs disabled:ring-disabled_subtle",
                    "[&_svg]:text-fg-error-secondary hover:[&_svg]:text-fg-error-primary",
                ],
                "tertiary-destructive": [
                    "text-error-primary outline-error hover:bg-error-primary hover:text-error-primary_hover data-loading:bg-error-primary",
                    "[&_svg]:text-fg-error-secondary hover:[&_svg]:text-fg-error-primary",
                ],
                "link-destructive": [
                    "justify-normal rounded p-0! text-error-primary outline-error hover:text-error-primary_hover",
                    "[&_svg]:text-fg-error-secondary hover:[&_svg]:text-fg-error-primary",
                ],
            },
            size: {
                sm: "gap-1 rounded-lg px-3 py-2 text-sm font-semibold before:rounded-[7px] data-icon-only:p-2",
                md: "gap-1 rounded-lg px-3.5 py-2.5 text-sm font-semibold before:rounded-[7px] data-icon-only:p-2.5",
                lg: "gap-1.5 rounded-lg px-4 py-2.5 text-md font-semibold before:rounded-[7px] data-icon-only:p-3",
                xl: "gap-1.5 rounded-lg px-4.5 py-3 text-md font-semibold before:rounded-[7px] data-icon-only:p-3.5",
            },
            effect: {
                outlineHover:
                    "transition-all duration-300 hover:outline-2 hover:outline-brand hover:outline-offset-2",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "sm",
        },
    }
);

/**
 * Common props shared between button and anchor variants
 */
export interface CommonProps extends VariantProps<typeof buttonVariants> {
    isDisabled?: boolean;
    isLoading?: boolean;
    iconLeft?: FC<{ className?: string }> | ReactNode;
    iconRight?: FC<{ className?: string }> | ReactNode;
    /** Removes horizontal padding from the text content */
    textPadding?: boolean;
    /** When true, keeps the text visible during loading state */
    showTextWhileLoading?: boolean;
    /** Use Slot for composition (Radix UI specific) */
    asChild?: boolean;
}

/**
 * Props for the button variant (non-link)
 */
export interface ButtonProps
    extends CommonProps,
        DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {}

/**
 * Props for the link variant (anchor tag)
 */
export interface LinkProps
    extends CommonProps,
        DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {}

/** Union type of button and link props */
export type Props = ButtonProps | LinkProps;

function Button({
    size = "sm",
    variant = "primary",
    effect,
    children,
    className,
    iconLeft: IconLeft,
    iconRight: IconRight,
    isDisabled: disabled,
    isLoading: loading,
    textPadding = true,
    showTextWhileLoading = true,
    asChild = false,
    ...otherProps
}: Props) {
    const href = "href" in otherProps ? otherProps.href : undefined;

    const isIcon = (IconLeft || IconRight) && !children;
    const isLinkType =
        typeof variant === "string" &&
        ["link-gray", "link-color", "link-destructive"].includes(variant);

    // textPadding = !isLinkType || textPadding;

    let props = {};
    let Component: React.ElementType = "button";

    if (href) {
        Component = "a";
        props = {
            ...otherProps,
            href: disabled ? undefined : href,
            // Since anchor elements do not support the `disabled` attribute and state,
            // we need to specify `data-rac` and `data-disabled` in order to be able
            // to use the `disabled:` selector in classes.
            ...(disabled ? { "data-rac": true, "data-disabled": true } : {}),
        };
    } else {
        Component = "button";
        props = {
            ...otherProps,
            type: (otherProps as ButtonHTMLAttributes<HTMLButtonElement>).type || "button",
            disabled: disabled,
        };
    }

    // If asChild is true, use Radix UI's Slot
    if (asChild) {
        Component = Slot;
        props = {
            ...otherProps,
            disabled: disabled,
        };
    }

    const iconStyle = "pointer-events-none size-5 shrink-0 transition-inherit-all";

    return (
        <Component
            data-loading={loading ? true : undefined}
            data-icon-only={isIcon ? true : undefined}
            {...props}
            className={cn(
                buttonVariants({ size, variant, effect }),
                (loading || (href && (disabled || loading))) && "pointer-events-none",
                // If in `loading` state, hide everything except the loading icon (and text if `showTextWhileLoading` is true).
                loading &&
                    (showTextWhileLoading
                        ? "[&>*:not([data-icon=loading]):not([data-text])]:hidden"
                        : "[&>*:not([data-icon=loading])]:invisible"),
                className
            )}
        >
            {/* left icon */}
            {isValidElement(IconLeft) && IconLeft}

            {/* Loading spinner - Treated as a normal flex item */}
            {loading && (
                <span data-icon="loading" className={cn(iconStyle, "animate-spin")}>
                    <svg
                        fill="none"
                        data-icon="loading"
                        viewBox="0 0 20 20"
                        className="pointer-events-none size-5 shrink-0 transition-inherit-all"
                    >
                        {/* Background circle */}
                        <circle
                            className="stroke-current opacity-30"
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            strokeWidth="2"
                        />
                        {/* Spinning circle */}
                        <circle
                            className="origin-center animate-spin stroke-current"
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            strokeWidth="2"
                            strokeDasharray="12.5 50"
                            strokeLinecap="round"
                        />
                    </svg>
                </span>
            )}

            {isLinkType ? (
                <Slottable>
                    {children && (
                        <span
                            data-text
                            className={`${asChild ? "underline decoration-transparent underline-offset-2 hover:decoration-current" : ""}`}
                        >
                            {children}
                        </span>
                    )}
                </Slottable>
            ) : (
                <Slottable>
                    {children && (
                        <span
                            data-text
                            className={cn("transition-inherit-all", textPadding && "px-0.5")}
                        >
                            {children}
                        </span>
                    )}
                </Slottable>
            )}

            {/* Right icon */}
            {isValidElement(IconRight) && IconRight}
        </Component>
    );
}

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export { Button, buttonVariants };
