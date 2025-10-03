"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { StepBase, type StepBaseType } from "./step-base";
import { type StepIconStatus, type StepIconSize } from "./step-icon";
import type { FC, ReactNode } from "react";

interface StepData {
    id: string;
    title?: string;
    description?: string;
    icon?: FC<{ className?: string }> | ReactNode;
}

interface ProgressStepsProps extends React.ComponentProps<"div"> {
    steps: StepData[];
    currentStep: number;
    type: StepBaseType;
    size?: StepIconSize;
    showHorizontalConnector?: boolean;
    onStepClick?: (stepIndex: number) => void;
    className?: string;
    ariaLabel?: string;
}

export function ProgressSteps({
    steps,
    currentStep,
    type,
    size = "sm",
    showHorizontalConnector = true,
    onStepClick,
    className,
    ariaLabel = "Progression des étapes",
}: ProgressStepsProps) {
    const getStepStatus = (index: number): StepIconStatus => {
        if (index < currentStep) return "complete";
        if (index === currentStep) return "current";
        return "incomplete";
    };

    const isLeftLayout = type.includes("-left");
    const isHorizontalLayout = !isLeftLayout;
    const isTextLine = type === "text-line";
    const isDashed = type === "number-top" || type === "number-left";

    let lineTopClass = "";
    if (type.includes("featured-icon")) lineTopClass = "top-[24px]";
    else if (size === "sm") lineTopClass = "top-[12px]";
    else if (size === "md") lineTopClass = "top-[16px]";

    const containerClass = isLeftLayout
        ? "flex flex-col"
        : cn("flex flex-row items-start", type.includes("-line") ? "gap-4" : "");

    const handleStepClick = (index: number) => {
        if (onStepClick && index <= currentStep) {
            onStepClick(index);
        }
    };

    return (
        <nav className={cn("w-full", className)} aria-label={ariaLabel}>
            <ol className={containerClass}>
                {steps.map((step, index) => {
                    const status = getStepStatus(index);
                    const isClickable = onStepClick && index <= currentStep;
                    const isLast = index === steps.length - 1;

                    return (
                        <li
                            key={step.id}
                            className="flex-1 relative flex flex-col items-center list-none"
                        >
                            <StepBase
                                type={type}
                                status={status}
                                size={size}
                                title={step.title}
                                description={step.description}
                                number={index + 1}
                                isLastStep={isLast}
                                icon={step.icon}
                                onClick={isClickable ? () => handleStepClick(index) : undefined}
                                stepIndex={index}
                                totalSteps={steps.length}
                            />

                            {/* Connector à droite sauf pour le dernier */}
                            {isHorizontalLayout && showHorizontalConnector && !isTextLine && (
                                <>
                                    {/* Connector à gauche (sauf pour le premier) */}
                                    {index > 0 && (
                                        <span
                                            className={cn(
                                                "absolute left-0 right-1/2 border-t-2 border-secondary",
                                                lineTopClass,
                                                isDashed && "border-dotted border-primary",
                                                status === "current" &&
                                                    type.includes("featured") &&
                                                    "border-fg-secondary",
                                                status === "complete" &&
                                                    type.includes("featured") &&
                                                    "border-fg-secondary",
                                                status === "current" &&
                                                    type.includes("icon") &&
                                                    "border-fg-brand-primary",
                                                status === "complete" &&
                                                    type.includes("icon") &&
                                                    "border-fg-secondary"
                                            )}
                                        />
                                    )}

                                    {/* Connector à droite (sauf pour le dernier) */}
                                    {index < steps.length - 1 && (
                                        <span
                                            className={cn(
                                                "absolute left-1/2 right-0 border-t-2 border-secondary",
                                                lineTopClass,
                                                isDashed && "border-dotted border-primary",
                                                status === "complete" &&
                                                    type.includes("featured") &&
                                                    "border-fg-secondary",
                                                status === "complete" &&
                                                    type.includes("icon") &&
                                                    "border-fg-brand-primary"
                                            )}
                                        />
                                    )}
                                </>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
