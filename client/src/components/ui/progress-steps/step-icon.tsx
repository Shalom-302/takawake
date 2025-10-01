"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { Check } from "@untitled-ui/icons-react";

// ===================================
// 1. TYPES ET VARIANTS CVA
// ===================================

export type StepIconType = "radio" | "number";
export type StepIconStatus = "incomplete" | "current" | "complete";
export type StepIconSize = "sm" | "md";

interface StepIconProps extends React.ComponentProps<"div"> {
    type: StepIconType;
    status: StepIconStatus;
    size?: StepIconSize;
    number?: number;
}

// -----------------------------------
// Composant Principal
// -----------------------------------

export function StepIcon({
    type,
    status,
    size = "sm",
    number = 1,
    className,
    ...props
}: StepIconProps) {
    if (type === "radio") {
        return <StepIconRadio status={status} size={size} className={className} {...props} />;
    }
    return (
        <StepIconNumber
            status={status}
            size={size}
            number={number}
            className={className}
            {...props}
        />
    );
}

// -----------------------------------
// CVA "Radio" (Check/Dot)
// -----------------------------------

const stepIconRadioVariants = cva(
    "relative rounded-full flex items-center justify-center shrink-0 transition-all",
    {
        variants: {
            size: {
                sm: "w-6 h-6",
                md: "w-8 h-8",
            },
            status: {
                incomplete: "bg-primary ring-border-disabled_subtle ring-[1.5px] ring-inset",
                current:
                    "bg-brand-solid ring-2 ring-brand-solid ring-offset-2 ring-offset-white overflow-hidden",
                complete: "bg-brand-solid overflow-hidden",
            },
        },
        defaultVariants: {
            size: "sm",
            status: "incomplete",
        },
    }
);

function StepIconRadio({
    status,
    size = "sm",
    className,
    ...props
}: Omit<StepIconProps, "type" | "number">) {
    const isComplete = status === "complete";

    return (
        <div className={stepIconRadioVariants({ status, size, className })} {...props}>
            {isComplete ? (
                // Icône de validation
                <Check
                    className={cn(
                        "text-fg-white stroke-[2.5px]",
                        size === "sm" && "size-3",
                        size === "md" && "size-4"
                    )}
                />
            ) : (
                // Point interne
                <div
                    className={cn(
                        "rounded-full",
                        size === "sm" && "size-2",
                        size === "md" && "size-2.5",
                        status === "current" ? "bg-fg-white" : "bg-fg-disabled_subtle"
                    )}
                />
            )}
        </div>
    );
}

// -----------------------------------
// CVA "Number"
// -----------------------------------

const stepIconNumberVariants = cva(
    "relative rounded-full flex items-center justify-center shrink-0 font-semibold transition-all overflow-hidden border border-secondary",
    {
        variants: {
            size: {
                sm: "w-6 h-6 text-xs",
                md: "w-8 h-8 text-sm",
            },
            status: {
                incomplete: "bg-primary text-disabled",
                current: "bg-primary text-secondary",
                complete: "bg-success-solid border-none",
            },
        },
        defaultVariants: {
            size: "sm",
            status: "incomplete",
        },
    }
);

function StepIconNumber({
    status,
    size = "sm",
    number = 1,
    className,
    ...props
}: Omit<StepIconProps, "type">) {
    const isComplete = status === "complete";

    return (
        <div className={stepIconNumberVariants({ status, size, className })} {...props}>
            {isComplete ? (
                <Check
                    className={cn(
                        "text-fg-white stroke-[2.5px]",
                        size === "sm" && "size-3",
                        size === "md" && "size-4"
                    )}
                />
            ) : (
                <span>{number}</span>
            )}
        </div>
    );
}
