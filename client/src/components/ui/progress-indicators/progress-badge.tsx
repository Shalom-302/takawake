// components/progress-badge.jsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils/cn";
import { CheckCircle } from "@untitled-ui/icons-react";
import { badgeVariants, type BadgeVariants } from "../badges/badge";

const PROGRESSION_STATUS = [
    {
        threshold: 0,
        text: "Pas commencé",
        color: "gray",
        icon: null,
    },
    {
        threshold: 1,
        text: "Commencé",
        color: "warning",
        icon: null,
    },
    {
        threshold: 25,
        text: "En cours",
        color: "gray-blue",
        icon: null,
    },
    {
        threshold: 75,
        text: "Bientôt fini",
        color: "blue",
        icon: null,
    },
    {
        threshold: 100,
        text: "Terminé",
        color: "success",
        icon: CheckCircle,
    },
];

export function ProgressBadge({
    className,
    size,
    asChild = false,
    value = 0,
    ...props
}: React.ComponentProps<"span"> & {
    asChild?: boolean;
    value?: number;
    size: BadgeVariants["size"];
}) {
    const Comp = asChild ? Slot : "span";

    const status = PROGRESSION_STATUS.slice()
        .reverse()
        .find(s => value >= s.threshold);

    console.log("status :>> ", status);

    const Icon = status?.icon;

    return (
        <Comp
            data-slot="badge"
            className={cn(
                badgeVariants({ size, color: status?.color as BadgeVariants["color"] }),
                className
            )}
            {...props}
        >
            {Icon ? <Icon className="size-4" /> : <SimpleCircleProgressBar value={value} />}
            <span className="text-xs block">{status?.text}</span>
        </Comp>
    );
}

export const SimpleCircleProgressBar = (props: { value: number; min?: 0; max?: 100 }) => {
    const { value, min = 0, max = 100 } = props;
    const percentage = ((value - min) * 100) / (max - min);

    return (
        <div
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            className={cn("relative flex w-max items-center justify-center size-4")}
        >
            <svg className="size-full -rotate-90" viewBox="0 0 60 60">
                <circle
                    className="stroke-current opacity-30"
                    cx="30"
                    cy="30"
                    r="26"
                    fill="none"
                    strokeWidth="6"
                />
                <circle
                    className="stroke-current opacity-30"
                    style={{
                        strokeDashoffset: `calc(100 - ${percentage})`,
                    }}
                    cx="30"
                    cy="30"
                    r="26"
                    fill="none"
                    strokeWidth="6"
                    strokeDasharray="100"
                    pathLength="100"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};
