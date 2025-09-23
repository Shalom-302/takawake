"use client";

import type {
    AnchorHTMLAttributes,
    ButtonHTMLAttributes,
    DetailedHTMLProps,
    FC,
    ReactNode,
} from "react";
import React, { isValidElement } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { isReactComponent } from "@/lib/utils/is-react-component";
import { Tooltip } from "../tootilp";

const buttonUtilityVariants = cva(
    [
        "group relative inline-flex h-max cursor-pointer items-center justify-center rounded-md outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2",
        // Disabled styles
        "disabled:cursor-not-allowed disabled:text-fg-disabled_subtle disabled:pointer-events-none",
        // Icon styles
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-current [&_svg]:transition-inherit-all",
    ],
    {
        variants: {
            variant: {
                secondary: [
                    "bg-primary text-fg-quaternary shadow-xs-skeumorphic ring-1 ring-primary ring-inset",
                    "hover:bg-primary_hover hover:text-fg-quaternary_hover",
                    "disabled:shadow-xs disabled:ring-disabled_subtle",
                ],
                tertiary: [
                    "text-fg-quaternary",
                    "hover:bg-primary_hover hover:text-fg-quaternary_hover",
                ],
            },
            size: {
                xs: "p-1.5 [&_svg]:size-4",
                sm: "p-1.5 [&_svg]:size-5",
            },
        },
        defaultVariants: {
            variant: "secondary",
            size: "sm",
        },
    }
);

/**
 * Common props shared between button and anchor variants
 */
interface CommonProps extends VariantProps<typeof buttonUtilityVariants> {
    /** Disables the button and shows a disabled state */
    isDisabled?: boolean;
    /** The icon to display in the button */
    icon?: FC<{ className?: string }> | ReactNode;
    /** The tooltip to display when hovering over the button */
    tooltip?: string;
    /** The side of the tooltip */
    tooltipSide?: "top" | "right" | "bottom" | "left";
    /** Use Slot for composition (Radix UI specific) */
    asChild?: boolean;
}

/**
 * Props for the button variant (non-link)
 */
export interface ButtonUtilityButtonProps
    extends CommonProps,
        DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {}

/**
 * Props for the link variant (anchor tag)
 */
export interface ButtonUtilityLinkProps
    extends CommonProps,
        DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {}

/** Union type of button and link props */
export type ButtonUtilityProps = ButtonUtilityButtonProps | ButtonUtilityLinkProps;

export const ButtonUtility = ({
    tooltip,
    className,
    isDisabled: disabled,
    icon: Icon,
    variant = "secondary",
    size = "sm",
    tooltipSide = "top",
    asChild = false,
    ...otherProps
}: ButtonUtilityProps) => {
    const href = "href" in otherProps ? otherProps.href : undefined;

    let props = {};
    let Component: React.ElementType = "button";

    if (href && !asChild) {
        Component = "a";
        props = {
            ...otherProps,
            href: disabled ? undefined : href,
            // Since anchor elements do not support the `disabled` attribute and state,
            // we need to specify `data-disabled` in order to be able
            // to use the `disabled:` selector in classes.
            ...(disabled ? { "data-disabled": true } : {}),
        };
    } else if (!asChild) {
        Component = "button";
        props = {
            ...otherProps,
            type: (otherProps as ButtonHTMLAttributes<HTMLButtonElement>).type || "button",
            disabled: disabled,
        };
    } else {
        Component = Slot;
        props = {
            ...otherProps,
            disabled: disabled,
        };
    }

    const content = (
        <Component
            aria-label={tooltip}
            {...props}
            className={cn(
                buttonUtilityVariants({ variant, size }),
                href && disabled && "pointer-events-none",
                className
            )}
        >
            {isReactComponent(Icon) && <Icon />}
            {isValidElement(Icon) && Icon}
        </Component>
    );

    if (tooltip) {
        return (
            <Tooltip
                trigger={content}
                side={tooltipSide}
                sideOffset={size === "xs" ? 4 : 6}
                title={tooltip}
            />
        );
    }

    return content;
};
