"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils/cn";
import { Tooltip } from "../tooltip";
import { HelpCircle } from "@untitled-ui/icons-react";

interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
    isRequired?: boolean;
    labelTooltip?: React.ReactNode;
}

function Label({ className, isRequired, labelTooltip, children, ...props }: LabelProps) {
    return (
        <LabelPrimitive.Root
            data-slot="label"
            className={cn(
                "flex cursor-default items-center gap-0.5 text-sm font-medium text-secondary select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-disabled",
                className
            )}
            {...props}
        >
            {children}
            <span
                className={cn(
                    "hidden text-brand-tertiary",
                    isRequired && "block",
                    typeof isRequired === "undefined" && "group-required:block"
                )}
            >
                *
            </span>
            {labelTooltip && (
                <Tooltip
                    trigger={
                        <HelpCircle className="size-4 cursor-pointer text-fg-quaternary transition duration-200 hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover" />
                    }
                    title={labelTooltip}
                    side="top"
                />
            )}
        </LabelPrimitive.Root>
    );
}

export { Label };
