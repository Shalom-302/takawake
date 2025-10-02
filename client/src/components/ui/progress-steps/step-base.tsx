"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { StepIcon, type StepIconStatus, type StepIconSize } from "./step-icon";
import type { FC, ReactNode } from "react";
import { FeaturedIcon } from "@/components/icons/featured-icons";

// ============ Types ============

export type StepBaseType =
    | "icon-left"
    | "icon-top"
    | "number-left"
    | "number-top"
    | "featured-icon-left"
    | "featured-icon-top"
    | "text-line";

interface StepBaseProps extends React.ComponentProps<"div"> {
    type: StepBaseType;
    status: StepIconStatus;
    size?: StepIconSize;
    title?: string;
    description?: string;
    number?: number;
    icon?: FC<{ className?: string }> | ReactNode;
    isLastStep: boolean;
}

// ============ Component Principal ============

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
    ...props
}: StepBaseProps) {
    const commonProps = { status, size, type, title, description, className, isLastStep, ...props };

    switch (type) {
        case "icon-left":
            return <StepIconLeft {...commonProps} />;
        case "icon-top":
            return <StepIconTop {...commonProps} />;
        case "number-left":
            return <StepNumberLeft number={number} {...commonProps} />;
        case "number-top":
            return <StepNumberTop number={number} {...commonProps} />;
        case "featured-icon-left":
            return <StepFeaturedIconLeft icon={icon} {...commonProps} />;
        case "featured-icon-top":
            return <StepFeaturedIconTop icon={icon} {...commonProps} />;
        case "text-line":
            return <StepTextLine {...commonProps} />;
        default:
            return null;
    }
}

// =======================================================
// SOUS-COMPOSANTS VARIATIONS
// =======================================================

const LEFT_GAP_CLASS = {
    sm: "gap-3",
    md: "gap-4",
};
const TEXT_SIZE_CLASS = {
    sm: "text-sm",
    md: "text-md",
};
const TEXT_PADDING_LEFT_CLASS = {
    sm: "pt-0.5 pb-6",
    md: "pt-1 pb-8",
};

const VerticalConnector = ({
    size,
    status,
    type,
}: {
    size: StepIconSize;
    status: StepIconStatus;
    type: StepBaseType;
}) => (
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
            status === "complete" && type === "icon-left" && "bg-fg-brand-primary"
        )}
    />
);

// NOTE: Le composant HorizontalConnector a été retiré.

// ============ Icon Left Variant ============

function StepIconLeft({
    status,
    size = "sm",
    type,
    title,
    description,
    className,
    isLastStep,
    ...props
}: Omit<StepBaseProps, "number" | "icon" | "horizontalConnector">) {
    return (
        <div
            className={cn(
                "w-80 inline-flex justify-start items-start",
                LEFT_GAP_CLASS[size],
                className
            )}
            {...props}
        >
            <div className="inline-flex flex-col justify-start items-center gap-1 h-full">
                <StepIcon type="radio" status={status} size={size} />
                {!isLastStep && <VerticalConnector size={size} status={status} type={type} />}
            </div>

            {/* Text Column */}
            {title && (
                <div
                    className={cn(
                        "flex-1 inline-flex flex-col justify-start items-start",
                        TEXT_PADDING_LEFT_CLASS[size],
                        TEXT_SIZE_CLASS[size]
                    )}
                >
                    <h3 className={cn("self-stretch justify-start text-secondary font-semibold")}>
                        {title}
                    </h3>
                    {description && (
                        <p className={cn("self-stretch justify-start text-tertiary ")}>
                            {description}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// ============ Icon Top Variant ============

function StepIconTop({
    status,
    size = "sm",
    title,
    description,
    className,
    ...props
}: Omit<StepBaseProps, "type" | "number" | "icon" | "horizontalConnector">) {
    return (
        <div
            className={cn(
                // IMPORTANT: relative z-10 assure que l'icône est au-dessus de la ligne du parent
                "inline-flex flex-col justify-start items-center relative z-10",
                LEFT_GAP_CLASS[size],
                className
            )}
            {...props}
        >
            <div className="flex gap-0">
                <StepIcon type="radio" status={status} size={size} />
                {/* Le connecteur est géré par le parent */}
            </div>

            {/* Text */}
            {title && (
                <div
                    className={cn(
                        "max-w-80 px-2 self-stretch flex flex-col justify-start items-center",
                        size === "sm" ? "gap-0.5" : "gap-1",
                        TEXT_SIZE_CLASS[size]
                    )}
                >
                    <div
                        className={cn(
                            "self-stretch text-center font-semibold",
                            status === "current" ? "text-brand-primary" : "text-secondary"
                        )}
                    >
                        {title}
                    </div>
                    {description && (
                        <div className={cn("self-stretch text-center  text-tertiary")}>
                            {description}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ============ Number Left Variant ============

function StepNumberLeft({
    status,
    size = "sm",
    type,
    title,
    description,
    number,
    className,
    isLastStep,
    ...props
}: Omit<StepBaseProps, "icon" | "horizontalConnector">) {
    return (
        <div
            className={cn(
                "w-80 inline-flex justify-start items-start",
                LEFT_GAP_CLASS[size],
                className
            )}
            {...props}
        >
            <div className="inline-flex flex-col justify-start items-center gap-1 h-full">
                <StepIcon type="number" status={status} size={size} number={number} />
                {!isLastStep && <VerticalConnector size={size} status={status} type={type} />}
            </div>

            {title && (
                <div
                    className={cn(
                        "flex-1 inline-flex flex-col justify-start items-start",
                        TEXT_PADDING_LEFT_CLASS[size],
                        TEXT_SIZE_CLASS[size]
                    )}
                >
                    <div className={cn("self-stretch justify-start text-secondary font-semibold")}>
                        {title}
                    </div>
                    {description && (
                        <div className={cn("self-stretch justify-start text-tertiary ")}>
                            {description}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ============ Number Top Variant ============

function StepNumberTop({
    status,
    size = "sm",
    title,
    description,
    number,
    className,
    ...props
}: Omit<StepBaseProps, "type" | "icon" | "horizontalConnector">) {
    return (
        <div
            className={cn(
                "inline-flex flex-col justify-start items-center relative z-10", // Ajout de z-10
                LEFT_GAP_CLASS[size],
                className
            )}
            {...props}
        >
            <div className="flex gap-0">
                <StepIcon type="number" status={status} size={size} number={number} />
                {/* Le connecteur est géré par le parent */}
            </div>

            {title && (
                <div
                    className={cn(
                        "max-w-80 px-2 self-stretch flex flex-col justify-start items-center",
                        size === "sm" ? "gap-0.5" : "gap-1",
                        TEXT_SIZE_CLASS[size]
                    )}
                >
                    <div
                        className={cn(
                            "self-stretch text-center font-semibold",
                            status === "current" ? "text-brand-primary" : "text-secondary"
                        )}
                    >
                        {title}
                    </div>
                    {description && (
                        <div className={cn("self-stretch text-center  text-tertiary")}>
                            {description}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ============ Featured Icon Left Variant ============

function StepFeaturedIconLeft({
    status,
    size = "sm",
    type,
    title,
    description,
    icon: IconComponent,
    className,
    isLastStep,
    ...props
}: Omit<StepBaseProps, "number" | "horizontalConnector">) {
    return (
        <div
            className={cn(
                "w-80 inline-flex justify-start items-start",
                LEFT_GAP_CLASS[size],
                status === "incomplete" ? "opacity-60" : "opacity-100",
                className
            )}
            {...props}
        >
            <div className="inline-flex flex-col justify-start items-center gap-1 h-full">
                <FeaturedIcon size="lg" variant="modern" color="gray" icon={IconComponent} />
                {!isLastStep && <VerticalConnector size={size} status={status} type={type} />}
            </div>

            {title && (
                <div
                    className={cn(
                        "flex-1 inline-flex flex-col justify-start items-start",
                        TEXT_PADDING_LEFT_CLASS[size],
                        TEXT_SIZE_CLASS[size]
                    )}
                >
                    <div className={cn("self-stretch justify-start text-secondary font-semibold")}>
                        {title}
                    </div>
                    {description && (
                        <div className={cn("self-stretch justify-start text-tertiary ")}>
                            {description}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ============ Featured Icon Top Variant ============

function StepFeaturedIconTop({
    status,
    size = "sm",
    title,
    description,
    icon: IconComponent,
    className,
    ...props
}: Omit<StepBaseProps, "type" | "number" | "horizontalConnector">) {
    return (
        <div
            className={cn(
                "inline-flex flex-col justify-start items-center relative z-10", // Ajout de z-10
                status === "incomplete" ? "opacity-60" : "opacity-100",
                LEFT_GAP_CLASS[size],
                className
            )}
            {...props}
        >
            <div className="flex gap-0">
                <FeaturedIcon size="lg" variant="modern" color="gray" icon={IconComponent} />
                {/* Le connecteur est géré par le parent */}
            </div>

            {title && (
                <div
                    className={cn(
                        "max-w-80 px-2 self-stretch flex flex-col justify-start items-center",
                        size === "sm" ? "gap-0.5" : "gap-1",
                        TEXT_SIZE_CLASS[size]
                    )}
                >
                    <div
                        className={cn(
                            "self-stretch text-center font-semibold",

                            status === "current" ? "text-brand-primary" : "text-secondary"
                        )}
                    >
                        {title}
                    </div>
                    {description && (
                        <div className={cn("self-stretch text-center text-tertiary")}>
                            {description}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ============ Text Line Variant ============

function StepTextLine({
    status,
    size = "sm",
    title,
    description,
    className,
    ...props
}: Omit<StepBaseProps, "type" | "horizontalConnector" | "number" | "icon">) {
    return (
        <div
            className={cn(
                "w-80 inline-flex flex-col justify-start items-start border-t-4",
                size === "sm" ? "pt-3" : "pt-4",
                status === "complete" || status === "current"
                    ? "border-fg-brand-primary_alt"
                    : "border-border-secondary",
                className
            )}
            {...props}
        >
            {title && (
                <div
                    className={cn(
                        "self-stretch flex flex-col justify-start items-start",
                        TEXT_SIZE_CLASS[size]
                    )}
                >
                    <div
                        className={cn(
                            "self-stretch justify-start text-secondary font-semibold",
                            status === "current" && "text-brand-secondary"
                        )}
                    >
                        {title}
                    </div>
                    {description && (
                        <div
                            className={cn(
                                "self-stretch justify-start text-tertiary",
                                status === "current" && "text-brand-tertiary"
                            )}
                        >
                            {description}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
