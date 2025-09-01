"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils/cn";
import { cva, VariantProps } from "class-variance-authority";

const checboxVariants = cva(
    [
        "flex size-4 shrink-0 cursor-pointer appearance-none items-center justify-center rounded bg-primary ring-1 ring-primary ring-inset",
        "data-[state=checked]:bg-brand-solid data-[state=checked]:ring-bg-brand-solid",
        "data-[state=indeterminate]:bg-brand-solid data-[state=indeterminate]:ring-bg-brand-solid",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        "disabled:cursor-not-allowed disabled:bg-disabled_subtle disabled:ring-disabled",
    ],
    {
        variants: {
            size: {
                sm: "size-4 rounded-xs",
                md: "size-5 rounded-sm",
            },
        },
        defaultVariants: {
            size: "sm",
        },
    }
);
export type CheckboxVariantProps = VariantProps<typeof checboxVariants>;

interface CheckboxProps
    extends React.ComponentProps<typeof CheckboxPrimitive.Root>,
        CheckboxVariantProps {
    label?: React.ReactNode;
    hint?: React.ReactNode;
}

export function Checkbox({ size, label, hint, className, ...props }: CheckboxProps) {
    return (
        <label
            className={cn(
                `flex items-start ${size === "sm" ? "gap-2" : "gap-3"}  cursor-pointer`,
                props.disabled && "cursor-not-allowed"
            )}
        >
            <CheckboxPrimitive.Root
                data-slot="checkbox"
                className={cn(checboxVariants({ size }), (label || hint) && "mt-0.5", className)}
                {...props}
            >
                <CheckboxPrimitive.Indicator
                    data-slot="checkbox-indicator"
                    className="flex items-center justify-center text-current transition-none"
                >
                    {props.checked === "indeterminate" ? (
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 14 14"
                            fill="none"
                            className={cn(
                                "pointer-events-none h-3 w-2.5 text-fg-white transition-inherit-all",
                                size === "md" && "size-3.5",
                                props.disabled && "text-fg-disabled_subtle"
                            )}
                        >
                            <path
                                d="M2.91675 7H11.0834"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    ) : (
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 14 14"
                            fill="none"
                            className={cn(
                                "pointer-events-none size-3 text-fg-white transition-inherit-all",
                                size === "md" && "size-3.5",
                                props.disabled && props.checked && "text-fg-disabled_subtle"
                            )}
                        >
                            <path
                                d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </CheckboxPrimitive.Indicator>
            </CheckboxPrimitive.Root>

            {(label || hint) && (
                <div className={`inline-flex flex-col ${size === "md" && "gap-0.5"} `}>
                    {label && (
                        <span
                            className={cn(
                                size === "md" ? "text-md font-medium" : "text-sm font-medium",
                                "text-secondary select-none"
                            )}
                        >
                            {label}
                        </span>
                    )}
                    {hint && (
                        <span
                            className={cn(size === "md" ? "text-md" : "text-sm", "text-tertiary")}
                        >
                            {hint}
                        </span>
                    )}
                </div>
            )}
        </label>
    );
}
