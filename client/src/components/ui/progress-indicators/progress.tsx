"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils/cn";

type LabelPosition = "right" | "bottom" | "top-floating" | "bottom-floating";

export interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
    min?: number;
    /** Classe additionnelle pour l'indicateur (barre remplie). */
    progressClassName?: string;
    /** Position du label si voulu */
    labelPosition?: LabelPosition;
}

export function ProgressBar({
    className,
    progressClassName,
    value,
    min = 0,
    max = 100,
    labelPosition,
    getValueLabel,
    ...props
}: ProgressProps) {
    const isIndeterminate = value === null;

    const percentage = value ? ((value - min) * 100) / (max - min) : 0;

    const formattedValue = !isIndeterminate
        ? getValueLabel
            ? String(getValueLabel(value as number, max))
            : `${Math.round(percentage)}%`
        : "";

    // const state = isIndeterminate
    //     ? "indeterminate"
    //     : (value as number) >= max
    //       ? "complete"
    //       : "loading";

    const ProgressBarBase = (
        <ProgressPrimitive.Root
            data-slot="progress"
            value={value}
            max={max}
            aria-valuemin={min}
            className={cn("h-2 w-full overflow-hidden rounded-md bg-quaternary", className)}
            {...props}
        >
            <ProgressPrimitive.Indicator
                data-slot="progress-indicator"
                className={cn(
                    "size-full rounded-md bg-fg-brand-primary transition-transform duration-75 ease-linear",
                    progressClassName,
                    isIndeterminate && "animate-pulse"
                )}
                style={
                    isIndeterminate ? undefined : { transform: `translateX(-${100 - percentage}%)` }
                }
            />
        </ProgressPrimitive.Root>
    );

    if (labelPosition === "right") {
        return (
            <div className="flex items-center gap-3">
                {ProgressBarBase}
                <span className="shrink-0 text-sm font-medium text-secondary tabular-nums">
                    {formattedValue}
                </span>
            </div>
        );
    }

    if (labelPosition === "bottom") {
        return (
            <div className="flex flex-col items-end gap-2">
                {ProgressBarBase}
                <span className="text-sm font-medium text-secondary tabular-nums">
                    {formattedValue}
                </span>
            </div>
        );
    }

    if (labelPosition === "top-floating" || labelPosition === "bottom-floating") {
        return (
            <div className="relative flex flex-col items-end gap-2">
                {ProgressBarBase}
                {percentage !== undefined && (
                    <div
                        // left en pourcentage positionne la bulle au-dessus de l'indicateur
                        style={{ left: `${percentage}%` }}
                        className={cn(
                            "absolute -translate-x-1/2 rounded-lg bg-primary_alt px-3 py-1.5 shadow-lg ring-1 ring-secondary_alt",
                            labelPosition === "top-floating"
                                ? "-top-2 -translate-y-full"
                                : "-bottom-2 translate-y-full"
                        )}
                    >
                        <div className="text-xs font-semibold text-secondary tabular-nums">
                            {formattedValue}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return ProgressBarBase;
}
