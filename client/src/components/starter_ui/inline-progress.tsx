import { cn } from "@/lib/utils/cn";
import React from "react";

type Props = {
    progress: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    progressBackgroundColor?: string;
    progressionColor?: string;
    percentPosition?: "right" | "bottom" | "top" | null;
    // percentClassNames?: string;
};

export default function InlineProgress({
    progress,
    percentPosition = null,
    // percentClassNames,
    progressBackgroundColor = "bg-primary/10",
    progressionColor = "bg-primary",
}: Props) {
    return (
        <div
            className={cn(
                "relative",
                {
                    "flex items-center gap-2": percentPosition && percentPosition === "right",
                },
                {
                    "flex flex-col items-end gap-2":
                        percentPosition && percentPosition === "bottom",
                },
                {
                    "flex flex-col-reverse items-end gap-2":
                        percentPosition && percentPosition === "top",
                }
            )}
        >
            <div className={cn("h-2 w-full rounded-full overflow-hidden", progressBackgroundColor)}>
                <div
                    className={cn("h-full rounded-full", progressionColor)}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            {percentPosition && (
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
            )}
        </div>
    );
}
