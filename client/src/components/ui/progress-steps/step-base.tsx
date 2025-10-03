"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { StepIcon, type StepIconStatus, type StepIconSize } from "./step-icon";
import { cva } from "class-variance-authority";

// ============ Types ============

export type StepBaseType =
    | "icon-left"
    | "icon-top"
    | "number-left"
    | "number-top"
    | "featured-icon-left"
    | "featured-icon-top"
    | "text-line";

// ============ Component Principal ============
interface StepBaseProps {
    type: StepBaseType;
    status: StepIconStatus;
    size?: StepIconSize;
    title?: string;
    description?: string;
    number?: number;
    icon?: React.FC<{ className?: string }> | React.ReactNode;
    isLastStep: boolean;
    stepIndex?: number;
    totalSteps?: number;
    className?: string;
    onClick?: () => void;
}

const stepBaseContainerVariants = cva("inline-flex", {
    variants: {
        type: {
            "icon-left": "w-80 justify-start items-start",
            "icon-top": "flex-col justify-start items-center relative z-10",
            "number-left": "w-80 justify-start items-start",
            "number-top": "flex-col justify-start items-center relative z-10",
            "featured-icon-left": "w-80 justify-start items-start",
            "featured-icon-top": "flex-col justify-start items-center relative z-10",
            "text-line": "w-80 flex-col justify-start items-start border-t-4",
        },
        size: { sm: "", md: "" },
        status: { incomplete: "", current: "", complete: "" },
        clickable: { true: "cursor-pointer" },
    },
    compoundVariants: [
        // Gaps for Top Layouts
        { type: "icon-top", size: "sm", class: "gap-3" },
        { type: "icon-top", size: "md", class: "gap-4" },
        { type: "number-top", size: "sm", class: "gap-3" },
        { type: "number-top", size: "md", class: "gap-4" },
        { type: "featured-icon-top", size: "sm", class: "gap-3" },
        { type: "featured-icon-top", size: "md", class: "gap-4" },

        // Gaps for Left Layouts
        { type: "icon-left", size: "sm", class: "gap-3" },
        { type: "icon-left", size: "md", class: "gap-4" },
        { type: "number-left", size: "sm", class: "gap-3" },
        { type: "number-left", size: "md", class: "gap-4" },
        { type: "featured-icon-left", size: "sm", class: "gap-3" },
        { type: "featured-icon-left", size: "md", class: "gap-4" },

        // Text line styles
        { type: "text-line", size: "sm", class: "pt-3" },
        { type: "text-line", size: "md", class: "pt-4" },
        { type: "text-line", status: "current", class: "border-fg-brand-primary_alt" },
        { type: "text-line", status: "complete", class: "border-fg-brand-primary_alt" },
        { type: "text-line", status: "incomplete", class: "border-secondary" },

        // Featured icon opacity
        { type: "featured-icon-left", status: "incomplete", class: "opacity-60" },
        { type: "featured-icon-top", status: "incomplete", class: "opacity-60" },
        { type: "featured-icon-left", status: "current", class: "opacity-100" },
        { type: "featured-icon-top", status: "current", class: "opacity-100" },
        { type: "featured-icon-left", status: "complete", class: "opacity-100" },
        { type: "featured-icon-top", status: "complete", class: "opacity-100" },
    ],
    defaultVariants: { type: "icon-left", size: "sm", status: "incomplete", clickable: false },
});

const stepContentLeftPaddingVariants = cva("flex-1", {
    variants: {
        size: {
            sm: "pt-0.5 pb-6",
            md: "pt-1 pb-8",
        },
    },
    defaultVariants: { size: "sm" },
});

export function StepBase({
    type,
    status,
    size = "sm",
    title,
    description,
    number = 1,
    icon,
    className,
    isLastStep,
    stepIndex = 0,
    totalSteps = 1,
    onClick,
}: StepBaseProps) {
    const isClickable = !!onClick && status !== "incomplete";
    const role = isClickable ? "button" : undefined;
    const tabIndex = isClickable ? 0 : undefined;
    const ariaDisabled = status === "incomplete" ? true : undefined;
    const ariaCurrent = status === "current" ? ("step" as const) : undefined;
    const isNumberType = type.includes("number");
    const isFeaturedIcon = type.includes("featured-icon");

    const clickableAriaLabel =
        isClickable && title
            ? `Aller à l'étape ${stepIndex + 1} : ${title}, actuellement ${status === "complete" ? "terminée" : "en cours"}`
            : undefined;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (isClickable && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick?.();
        }
    };

    const commonA11yProps = {
        role,
        tabIndex,
        "aria-disabled": ariaDisabled,
        "aria-current": ariaCurrent,
        "aria-label": clickableAriaLabel,
        onClick: isClickable ? onClick : undefined,
        onKeyDown: isClickable ? handleKeyDown : undefined,
    };

    const containerClasses = stepBaseContainerVariants({
        type,
        size,
        status,
        clickable: isClickable,
    });

    const RenderTextContent = ({ centered = false }: { centered?: boolean }) => (
        <StepTextContent
            title={title}
            description={description}
            status={status}
            size={size}
            type={type}
            centered={centered}
        />
    );

    // TEXT LINE
    if (type === "text-line") {
        return (
            <div className={cn(containerClasses, className)} {...commonA11yProps}>
                <RenderTextContent />
            </div>
        );
    }

    // LEFT LAYOUTS
    if (type.includes("-left")) {
        return (
            <div className={cn(containerClasses, className)} {...commonA11yProps}>
                <div className="inline-flex flex-col justify-start items-center gap-1 h-full">
                    <StepIcon
                        type={isNumberType ? "number" : isFeaturedIcon ? "featured-icon" : "radio"}
                        status={status}
                        size={size}
                        number={number}
                        icon={icon}
                        stepIndex={stepIndex}
                        totalSteps={totalSteps}
                    />
                    {!isLastStep && (
                        <VerticalConnector
                            size={size}
                            status={status}
                            type={type as "icon-left" | "number-left" | "featured-icon-left"}
                        />
                    )}
                </div>
                <div className={stepContentLeftPaddingVariants({ size })}>
                    <RenderTextContent />
                </div>
            </div>
        );
    }

    // TOP LAYOUTS
    if (type.includes("-top")) {
        return (
            <div className={cn(containerClasses, className)} {...commonA11yProps}>
                <StepIcon
                    type={isNumberType ? "number" : isFeaturedIcon ? "featured-icon" : "radio"}
                    status={status}
                    size={size}
                    number={number}
                    icon={icon}
                    stepIndex={stepIndex}
                    totalSteps={totalSteps}
                />
                <div className="max-w-80 px-2 self-stretch flex flex-col justify-start items-center">
                    <RenderTextContent centered />
                </div>
            </div>
        );
    }

    return null;
}

// =======================================================
// SOUS-COMPOSANTS VARIATIONS
// =======================================================

interface TextContentProps {
    title?: string;
    description?: string;
    status: StepIconStatus;
    size: StepIconSize;
    centered?: boolean;
    type?: StepBaseType;
}

const textContentContainerVariants = cva("flex flex-col justify-start", {
    variants: {
        size: { sm: "text-sm", md: "text-md" },
        centered: { true: "items-center" },
    },
    defaultVariants: { size: "sm", centered: true },
});

const textContentTitleVariants = cva("self-stretch justify-start font-semibold", {
    variants: {
        status: {
            incomplete: "text-secondary",
            current: "text-brand-secondary",
            complete: "text-secondary",
        },
        type: {
            "icon-left": "",
            "icon-top": "",
            "number-left": "text-secondary",
            "number-top": "",
            "featured-icon-left": "text-secondary",
            "featured-icon-top": "",
            "text-line": "",
        },
        centered: { true: "text-center" },
    },
    compoundVariants: [
        { type: "number-top", status: "current", class: "text-brand-primary" },
        { type: "featured-icon-top", status: "current", class: "text-brand-primary" },
    ],
    defaultVariants: { status: "incomplete", type: "icon-left", centered: false },
});

const textContentDescriptionVariants = cva("self-stretch justify-start", {
    variants: {
        status: {
            incomplete: "text-tertiary",
            current: "text-brand-tertiary",
            complete: "text-tertiary",
        },
        type: {
            "icon-left": "",
            "icon-top": "",
            "number-left": "text-tertiary",
            "number-top": "text-tertiary",
            "featured-icon-left": "text-tertiary",
            "featured-icon-top": "text-tertiary",
            "text-line": "",
        } as Record<StepBaseType, string>,
        centered: { true: "text-center" },
    },
    defaultVariants: { status: "incomplete", type: "icon-left", centered: true },
});

function StepTextContent({
    title,
    description,
    status,
    size,
    centered = false,
    type = "icon-left",
}: TextContentProps) {
    if (!title) return null;
    return (
        <div className={textContentContainerVariants({ size, centered })}>
            <h3 className={textContentTitleVariants({ status, type, centered })}>{title}</h3>
            {description && (
                <p className={textContentDescriptionVariants({ status, type, centered })}>
                    {description}
                </p>
            )}
        </div>
    );
}

function VerticalConnector({
    size,
    status,
    type,
}: {
    size: StepIconSize;
    status: StepIconStatus;
    type: StepBaseType;
}) {
    return (
        <div
            className={cn(
                size === "sm" && type === "icon-left" && "h-[34px] border-l-2 border-secondary",
                size === "md" && type === "icon-left" && "h-10 border-l-2 border-secondary",
                size === "sm" &&
                    type === "number-left" &&
                    "h-[30px] border-l-2 border-dotted border-primary",
                size === "md" &&
                    type === "number-left" &&
                    "h-9  border-l-2 border-dotted border-primary",
                size === "sm" && type === "featured-icon-left" && "h-3 border-l-2 border-secondary",
                size === "md" && type === "featured-icon-top" && "h-6 border-l-2 border-secondary",
                status === "complete" && type === "icon-left" && "border-fg-brand-primary"
            )}
        />
    );
}
