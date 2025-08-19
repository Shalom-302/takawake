import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";
import CircularProgress from "./circular-progress";
import { CheckCircleIcon } from "../icons";

const badgeVariants = cva(
    "inline-flex items-center box-border border rounded-full justify-center font-medium w-fit whitespace-nowrap shrink-0  transition-[color,box-shadow] overflow-hidden",
    {
        variants: {
            size: {
                sm: "h-5.5 px-2 py-0.5 gap-1 text-sm",
                md: "h-6 px-2.5 py-0.5 gap-1.5 text-sm",
                lg: "h-7 px-3 py-1 gap-1.5 text-sm",
            },
        },
        defaultVariants: {
            size: "sm",
        },
    }
);

function ProgressBadge({
    className,
    size,
    asChild = false,
    progression = 0,
    ...props
}: React.ComponentProps<"span"> &
    VariantProps<typeof badgeVariants> & {
        asChild?: boolean;
        progression?: number;
    }) {
    const Comp = asChild ? Slot : "span";

    let text = "";
    let circleColor = "";

    switch (true) {
        case progression === 0:
            text = "Pas commencé";
            circleColor = "text-primary/20";
            break;
        case progression > 0 && progression < 25:
            circleColor = "text-yellow-400";
            text = "Commencé";
            break;
        case progression >= 25 && progression < 75:
            circleColor = "text-red-400";
            text = "En cours";
            break;
        case progression >= 75 && progression < 100:
            circleColor = "text-blue-200";
            text = "Bientôt fini";
            break;
        case progression === 100:
            circleColor = "text-green-200";
            text = "Terminé";
            break;
        default:
            text = "";
    }

    return (
        <Comp
            data-slot="badge"
            className={cn(
                badgeVariants({
                    size,
                }),
                {
                    "bg-gray-50 border-gray-200 text-gray-400": progression === 0,
                },
                {
                    "bg-yellow-50 border-yellow-300 text-yellow-700":
                        progression > 0 && progression < 25,
                },
                {
                    "bg-red-50 border-red-300 text-red-500": progression >= 25 && progression < 75,
                },
                {
                    "bg-blue-50 border-blue-300 text-blue-500":
                        progression >= 75 && progression < 100,
                },
                {
                    "bg-green-50 border-green-500 text-green-600": progression === 100,
                },
                className
            )}
            {...props}
        >
            {progression >= 100 ? (
                <CheckCircleIcon size={14} />
            ) : (
                <CircularProgress
                    progress={progression}
                    size={14}
                    strokeWidth={1.5}
                    circleColor={circleColor}
                    progressionColor={"currentColor"}
                />
            )}

            <span className="text-xs block">{text}</span>
        </Comp>
    );
}

export default ProgressBadge;
