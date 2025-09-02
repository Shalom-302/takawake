import * as React from "react";

import { cn } from "@/lib/utils/cn";
import { cva, VariantProps } from "class-variance-authority";
import { Tooltip } from "../tooltip";
import { HelpCircle, InfoCircle } from "@untitled-ui/icons-react";

const baseInputVariants = cva(
    "peer m-0 w-full bg-transparent text-md text-primary ring-0 outline-hidden placeholder:text-placeholder autofill:rounded-lg autofill:text-primary",
    {
        variants: {
            size: {
                sm: "px-3 py-2",
                md: "px-3.5 py-2.5",
            },
        },
        defaultVariants: {
            size: "sm",
        },
    }
);

export type BaseInputVariants = VariantProps<typeof baseInputVariants>;

interface BaseInputProps extends Omit<React.ComponentProps<"input">, "size">, BaseInputVariants {}

function BaseInput({ className, size, type, ...props }: BaseInputProps) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(baseInputVariants({ size }), className)}
            {...props}
        />
    );
}

export interface InputProps extends BaseInputProps {
    /** Tooltip message on hover. */
    tooltip?: string;
    /** Icon component to display on the left side of the input. */
    iconLeft?: React.ComponentType<React.HTMLAttributes<HTMLOrSVGElement>>;
    /** Icon component to display on the right side of the input. */
    iconRight?: React.ComponentType<React.HTMLAttributes<HTMLOrSVGElement>>;
    /** Class name for the input wrapper. */
    wrapperClassName?: string;
    /** Class name for the icon. */
    iconClassName?: string;
    /** Class name for the tooltip. */
    tooltipClassName?: string;
}

function Input({
    size,
    type = "text",
    iconLeft: IconLeft,
    iconRight: IconRight,
    tooltip,
    wrapperClassName,
    className: inputClassName,
    iconClassName,
    tooltipClassName,
    ...props
}: InputProps) {
    const isInvalid = props["aria-invalid"] === true;
    const hasLeftIcon = IconLeft;
    const hasRightIcon = IconRight || tooltip || isInvalid;
    return (
        <div
            className={cn(
                [
                    "relative flex w-full flex-row place-content-center place-items-center rounded-lg bg-primary shadow-xs ring-1 ring-primary transition-shadow duration-100 ease-linear ring-inset",
                    "focus-within:ring-2 focus-within:ring-brand",
                    "has-disabled:cursor-not-allowed has-disabled:text-has-disabled has-disabled:bg-disabled_subtle has-disabled:ring-disabled group-disabled:cursor-not-allowed group-disabled:bg-disabled_subtle group-disabled:ring-disabled",
                    isInvalid &&
                        "ring-error_subtle group-invalid:ring-error_subtle focus-within:ring-2 focus-within:group-invalid:ring-2 focus-within:ring-error focus-within:group-invalid:ring-error",
                ],
                wrapperClassName
            )}
        >
            <BaseInput
                type={type}
                size={size}
                className={cn(
                    size === "sm" ? hasLeftIcon && "pl-10" : hasLeftIcon && "pl-10.5",
                    size === "sm" ? hasRightIcon && "pr-9" : hasRightIcon && "pr-9.5",
                    inputClassName
                )}
                {...props}
            />

            {IconLeft && (
                <IconLeft
                    className={cn(
                        "pointer-events-none absolute size-5 text-fg-quaternary peer-disabled:text-fg-disabled",
                        size === "sm" ? "left-3" : "left-3.5",
                        iconClassName
                    )}
                />
            )}

            {isInvalid ? (
                <InfoCircle
                    className={cn(
                        "pointer-events-none absolute size-5 text-fg-error-secondary",
                        size === "sm" ? "right-3" : "right-3.5",
                        iconClassName
                    )}
                />
            ) : tooltip ? (
                <Tooltip
                    trigger={
                        <HelpCircle
                            className={cn(
                                "absolute size-5 text-fg-quaternary hover:text-fg-quaternary_hover transition duration-200 peer-focus:text-fg-quaternary_hover peer-disabled:text-fg-disabled",
                                size === "sm" ? "right-3" : "right-3.5"
                            )}
                        />
                    }
                    content={tooltip}
                    contentClassName={tooltipClassName}
                />
            ) : (
                IconRight &&
                !isInvalid && (
                    <IconRight
                        className={cn(
                            "pointer-events-none absolute size-5 text-fg-quaternary peer-disabled:text-fg-disabled",
                            size === "sm" ? "right-3" : "right-3.5",
                            iconClassName
                        )}
                    />
                )
            )}
        </div>
    );
}

export { Input, BaseInput };
