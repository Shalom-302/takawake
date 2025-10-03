"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { Check } from "@untitled-ui/icons-react";
import { FeaturedIcon } from "@/components/icons/featured-icons";

export type StepIconType = "radio" | "number" | "featured-icon";
export type StepIconStatus = "incomplete" | "current" | "complete";
export type StepIconSize = "sm" | "md";

interface StepIconProps {
    type: StepIconType;
    status: StepIconStatus;
    size?: StepIconSize;
    number?: number;
    icon?: React.FC<{ className?: string }> | React.ReactNode;
    className?: string;
    stepIndex?: number;
    totalSteps?: number;
}

const radioVariants = cva(
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

const numberVariants = cva(
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

const checkIconVariants = cva("text-fg-white stroke-[2.5px]", {
    variants: {
        size: {
            sm: "size-3",
            md: "size-4",
        },
    },
    defaultVariants: {
        size: "sm",
    },
});

const dotIconVariants = cva("rounded-full", {
    variants: {
        size: {
            sm: "size-2",
            md: "size-2.5",
        },
        status: {
            current: "bg-fg-white",
            incomplete: "bg-fg-disabled_subtle",
            complete: "bg-fg-white",
        },
    },
    defaultVariants: {
        size: "sm",
        status: "incomplete",
    },
});

export function StepIcon({
    type,
    status,
    size = "sm",
    number = 1,
    icon,
    className,
    stepIndex = 0,
    totalSteps = 1,
}: StepIconProps) {
    const isComplete = status === "complete";

    // Labels accessibles
    const getAriaLabel = () => {
        const statusText = isComplete ? "terminée" : status === "current" ? "en cours" : "à venir";
        return `Étape ${stepIndex + 1} sur ${totalSteps}, ${statusText}`;
    };

    switch (type) {
        case "radio":
            return (
                <div
                    className={cn(radioVariants({ status, size }), className)}
                    role="img"
                    aria-label={getAriaLabel()}
                >
                    {isComplete ? (
                        <Check className={checkIconVariants({ size })} aria-hidden="true" />
                    ) : (
                        <div className={dotIconVariants({ size, status })} aria-hidden="true" />
                    )}
                </div>
            );
        case "number":
            return (
                <div
                    className={cn(numberVariants({ status, size }), className)}
                    role="img"
                    aria-label={getAriaLabel()}
                >
                    {isComplete ? (
                        <Check className={checkIconVariants({ size })} aria-hidden="true" />
                    ) : (
                        <span aria-hidden="true">{number}</span>
                    )}
                </div>
            );
        case "featured-icon":
            return <FeaturedIcon size="lg" variant="modern" color="gray" icon={icon} />;

        default:
            return null;
    }
}
