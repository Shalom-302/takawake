// components/progress-badge.jsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CheckCircle } from "@untitled-ui/icons-react";

const badgeVariants = cva(
    "inline-flex h-max items-center box-border border rounded-full justify-center font-medium w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden",
    {
        variants: {
            size: {
                sm: "px-2 py-0.5 gap-1 text-sm",
                md: "px-2.5 py-0.5 gap-1.5 text-sm",
                lg: "px-3 py-1 gap-1.5 text-sm",
            },
        },
        defaultVariants: {
            size: "sm",
        },
    }
);

const PROGRESSION_STATUS = [
    {
        threshold: 0,
        text: "Pas commencé",
        progressCircleColor: "stroke-utility-neutral-200",
        bg: "bg-utility-neutral-50",
        border: "border-utility-neutral-200",
        textClass: "text-utility-neutral-400",
        icon: null,
    },
    {
        threshold: 1, // Start from 1% to avoid overlap with 0%
        text: "Commencé",
        progressCircleColor: "stroke-utility-warning-400",
        bg: "bg-utility-warning-50",
        border: "border-utility-warning-300",
        textClass: "text-utility-warning-700",
        icon: null,
    },
    {
        threshold: 25,
        text: "En cours",
        progressCircleColor: "stroke-utility-sandybrown-200",
        bg: "bg-utility-sandybrown-50",
        border: "border-utility-sandybrown-300",
        textClass: "text-utility-sandybrown-500",
        icon: null,
    },
    {
        threshold: 75,
        text: "Bientôt fini",
        progressCircleColor: "stroke-utility-information-200",
        bg: "bg-utility-french-skyblue-50",
        border: "border-utility-french-skyblue-300",
        textClass: "text-utility-french-skyblue-500",
        icon: null,
    },
    {
        threshold: 100,
        text: "Terminé",
        progressCircleColor: "stroke-utility-success-200",
        bg: "bg-utility-success-100",
        border: "border-utility-success-500",
        textClass: "text-utility-success-600",
        icon: CheckCircle,
    },
];

export function ProgressBadge({
    className,
    size,
    asChild = false,
    value = 0,
    ...props
}: React.ComponentProps<"span"> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean; value?: number }) {
    const Comp = asChild ? Slot : "span";

    const status = PROGRESSION_STATUS.slice()
        .reverse()
        .find(s => value >= s.threshold);

    const Icon = status?.icon;

    return (
        <Comp
            data-slot="badge"
            className={cn(
                badgeVariants({ size }),
                status?.bg,
                status?.border,
                status?.textClass,
                className
            )}
            {...props}
        >
            {Icon ? (
                <Icon size={16} />
            ) : (
                <SimpleCircleProgressBar
                    value={value}
                    progressCircleColor={
                        status?.progressCircleColor || "stroke-utility-neutral-200"
                    }
                />
            )}
            <span className="text-xs block">{status?.text}</span>
        </Comp>
    );
}

export const SimpleCircleProgressBar = (props: {
    value: number;
    min?: 0;
    max?: 100;
    progressCircleColor: string;
}) => {
    const { value, min = 0, max = 100, progressCircleColor } = props;
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
                <circle stroke="currentColor" cx="30" cy="30" r="26" fill="none" strokeWidth="6" />
                <circle
                    className={progressCircleColor}
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
