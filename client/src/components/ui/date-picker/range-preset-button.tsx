"use client";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/buttons";
import type { DateRange } from "react-day-picker";
import * as React from "react";

export const RangePresetButton = ({
    value,
    range,
    className,
    ...props
}: React.ComponentProps<typeof Button> & {
    value: DateRange | undefined;
    range: DateRange | undefined;
}) => {
    const isSelected =
        range?.from?.getTime() === value?.from?.getTime() &&
        range?.to?.getTime() === value?.to?.getTime();

    return (
        <Button
            size="md"
            color="secondary"
            className={cn(
                "justify-start",
                isSelected && "bg-brand-solid text-white hover:bg-brand-solid_hover",
                className
            )}
            {...props}
        />
    );
};
