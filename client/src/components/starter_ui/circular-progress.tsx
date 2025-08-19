import { cn } from "@/lib/utils/cn";
import React from "react";

type Props = {
    progress: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    circleColor?: string;
    progressionColor?: string;
    withPercentInside?: boolean;
    percentClassNames?: string;
};

export default function CircularProgress({
    progress,
    size = 48,
    strokeWidth = 4,
    withPercentInside = false,
    percentClassNames,
    circleColor = "text-primary/10",
    progressionColor = "text-primary",
}: Props) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative inline-block" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Fond */}
                <circle
                    className={cn(circleColor)}
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progression */}
                <circle
                    className={cn("transition-[stroke-dashoffset] duration-500", progressionColor)}
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            {/* Pourcentage au centre (optionnel) */}
            {withPercentInside && (
                <div
                    className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        percentClassNames
                    )}
                >
                    {Math.round(progress)}%
                </div>
            )}
        </div>
    );
}
