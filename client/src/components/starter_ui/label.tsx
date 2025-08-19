"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils/cn";

export default function Label({
    className,
    ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
    return (
        <LabelPrimitive.Root
            data-slot="label"
            className={cn("text-[var(--text-secondary)] font-medium text-sm ", className)}
            {...props}
        >
            {props.children}
        </LabelPrimitive.Root>
    );
}
