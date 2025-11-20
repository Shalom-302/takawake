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
import { isReactComponent } from "@/lib/utils/is-react-component";

const buttonVariants = cva(
    [
        " group relative inline-flex h-max cursor-pointer items-center justify-center whitespace-nowrap outline-brand transition duration-100 ease-linear before:absolute focus-visible:outline-2 focus-visible:outline-offset-2",
        // InputGroup integration
        "in-data-input-wrapper:shadow-xs in-data-input-wrapper:focus:!z-50 in-data-input-wrapper:in-data-left:-mr-px in-data-input-wrapper:in-data-left:rounded-r-none in-data-input-wrapper:in-data-left:before:rounded-r-none in-data-input-wrapper:in-data-right:-ml-px in-data-input-wrapper:in-data-right:rounded-l-none in-data-input-wrapper:in-data-right:before:rounded-l-none",
        // Disabled state
        "disabled:text-fg-disabled disabled:pointer-events-none",
        // Icon styles
        "disabled:[&_svg]:text-fg-disabled_subtle",
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 [&_svg]:shrink-0 [&_svg]:transition-inherit-all",
    ],
    {
        variants: {
            variant: {
                primary: [
                    "bg-brand-solid text-white shadow-xs-skeumorphic ring-1 ring-transparent ring-inset hover:bg-brand-solid_hover",
                    "before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0%",
                    "disabled:bg-disabled disabled:shadow-xs disabled:ring-disabled_subtle",
                    "[&_svg]:text-button-primary-icon hover:[&_svg]:text-button-primary-icon_hover",
                ],
                secondary: [
                    "bg-primary text-secondary shadow-xs-skeumorphic ring-1 ring-primary ring-inset hover:bg-primary_hover hover:text-secondary_hover",
                    "disabled:shadow-xs disabled:ring-disabled_subtle",
                    "[&_svg]:text-fg-quaternary hover:[&_svg]:text-fg-quaternary_hover",
                ],
                tertiary: [
                    "text-tertiary hover:bg-primary_hover hover:text-tertiary_hover",
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
                    "bg-primary text-error-primary shadow-xs-skeumorphic ring-1 ring-error_subtle outline-error ring-inset hover:bg-error-primary hover:text-error-primary_hover",
                    "disabled:bg-primary disabled:shadow-xs disabled:ring-disabled_subtle",
                    "[&_svg]:text-fg-error-secondary hover:[&_svg]:text-fg-error-primary",
                ],
                "tertiary-destructive": [
                    "text-error-primary outline-error hover:bg-error-primary hover:text-error-primary_hover",
                    "[&_svg]:text-fg-error-secondary hover:[&_svg]:text-fg-error-primary",
                ],
                "link-destructive": [
                    "justify-normal rounded p-0! text-error-primary outline-error hover:text-error-primary_hover",
                    "[&_svg]:text-fg-error-secondary hover:[&_svg]:text-fg-error-primary",
                ],
            },
            size: {
                sm: "gap-1 rounded-full px-3 py-2 text-sm font-semibold before:rounded-[7px] data-icon-only:p-2",
                md: "gap-1 rounded-full px-3.5 py-2.5 text-sm font-semibold before:rounded-[7px] data-icon-only:p-2.5",
                lg: "gap-1.5 rounded-full px-4 py-2.5 text-md font-semibold before:rounded-[7px] data-icon-only:p-3",
                xl: "gap-1.5 rounded-full px-4.5 py-3 text-md font-semibold before:rounded-[7px] data-icon-only:p-3.5",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "sm",
        },
    }
);

// ============================================
// TYPES
// ============================================
export interface CommonProps extends VariantProps<typeof buttonVariants> {
    isDisabled?: boolean;
    isLoading?: boolean;
    leftIcon?: FC<{ className?: string }> | ReactNode;
    rightIcon?: FC<{ className?: string }> | ReactNode;
    textPadding?: boolean;
    showTextWhileLoading?: boolean;
    asChild?: boolean;
}

export interface ButtonProps
    extends CommonProps,
        DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {}

export interface LinkProps
    extends CommonProps,
        DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {}

export type Props = ButtonProps | LinkProps;

// ============================================
// LOADING SPINNER COMPONENT
// ============================================
function LoadingSpinner({ className }: { className?: string }) {
    return (
        <svg
            fill="none"
            data-slot="loading-icon"
            viewBox="0 0 20 20"
            className={cn("animate-spin", className)}
            aria-hidden="true"
        >
            <circle
                className="stroke-current opacity-30"
                cx="10"
                cy="10"
                r="8"
                fill="none"
                strokeWidth="2"
            />
            <circle
                className="stroke-current"
                cx="10"
                cy="10"
                r="8"
                fill="none"
                strokeWidth="2"
                strokeDasharray="12.5 50"
                strokeLinecap="round"
            />
        </svg>
    );
}

// ============================================
// MAIN BUTTON COMPONENT
// ============================================
function Button({
    size,
    variant,
    children,
    className,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    isDisabled: disabled,
    isLoading: loading,
    textPadding = true,
    showTextWhileLoading = true,
    asChild = false,
    ...otherProps
}: Props) {
    const href = "href" in otherProps ? otherProps.href : undefined;
    const isIconOnly = (LeftIcon || RightIcon) && !children;
    const isLinkVariant =
        typeof variant === "string" &&
        ["link-gray", "link-color", "link-destructive"].includes(variant);

    // Déterminer le composant à utiliser
    const Component: React.ElementType = asChild ? Slot : href ? "a" : "button";

    // Props communes
    const commonProps = {
        "data-loading": loading || undefined,
        "data-icon-only": isIconOnly || undefined,
        className: cn(
            buttonVariants({ size, variant }),
            (loading || disabled) && "pointer-events-none",
            loading && !showTextWhileLoading && "[&>:not([data-slot])]:invisible",
            loading && showTextWhileLoading && "[&>:not([data-slot]):not([data-text])]:hidden",
            className
        ),
    };

    // Props spécifiques selon le type
    let specificProps = {};
    if (href && !asChild) {
        specificProps = {
            href: disabled ? undefined : href,
            ...(disabled && { "data-rac": true, "data-disabled": true }),
        };
    } else if (!asChild) {
        specificProps = {
            type: (otherProps as ButtonHTMLAttributes<HTMLButtonElement>).type || "button",
            disabled: disabled,
        };
    } else {
        specificProps = { disabled };
    }

    const iconStyle = "pointer-events-none size-5 shrink-0 transition-inherit-all";

    return (
        <Component {...commonProps} {...specificProps} {...otherProps}>
            {/* Left icon */}
            {isValidElement(LeftIcon) && LeftIcon}
            {isReactComponent(LeftIcon) && <LeftIcon className={iconStyle} />}

            {/* Loading spinner */}
            {loading && (
                <LoadingSpinner
                    className={cn(
                        iconStyle,
                        !showTextWhileLoading &&
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    )}
                />
            )}

            {/* Text content */}
            {isLinkVariant ? (
                <Slottable>
                    {children && (
                        <span
                            data-text
                            data-slot="text"
                            className="underline decoration-transparent underline-offset-2 hover:decoration-current"
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
                            data-slot="text"
                            className={cn("transition-inherit-all", textPadding && "px-0.5")}
                        >
                            {children}
                        </span>
                    )}
                </Slottable>
            )}

            {/* Right icon */}
            {isValidElement(RightIcon) && RightIcon}
            {isReactComponent(RightIcon) && <RightIcon className={iconStyle} />}
        </Component>
    );
}

export type ButtonVariants = VariantProps<typeof buttonVariants>;
export { Button, buttonVariants };
