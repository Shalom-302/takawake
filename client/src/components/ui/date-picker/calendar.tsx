"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils/cn";
import { buttonVariants } from "@/components/ui/buttons";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-semibold text-fg-secondary",
                nav: "space-x-1 flex items-center",
                nav_button: cn(buttonVariants({ variant: "secondary", size: "sm" }), "h-8 w-8 p-0"),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex border-b-4 border-transparent",
                head_cell: "text-secondary rounded-md w-10 text-sm font-medium",
                row: "flex w-full mt-2 border-b-4 border-transparent last-of-type:border-none",
                cell: "h-10 w-10 p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-active first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20",
                day: cn(
                    buttonVariants({ variant: "tertiary" }),
                    "h-full w-full rounded-full p-0 font-normal hover:bg-primary_hover text-secondary",
                    "aria-selected:bg-brand-solid aria-selected:text-white aria-selected:hover:bg-brand-solid_hover aria-selected:hover:text-white",
                    "aria-selected:focus:bg-brand-solid aria-selected:focus:text-white",
                    "day-range-start:rounded-r-none day-range-end:rounded-l-none",
                    "day-selected:bg-brand-solid day-selected:text-white day-selected:hover:bg-brand-solid_hover day-selected:hover:text-white",
                    "day-today:bg-active day-today:font-medium day-today:hover:bg-secondary_hover",
                    "day-outside:text-disabled day-outside:pointer-events-none day-outside:aria-selected:bg-active",
                    "day-disabled:text-disabled day-disabled:opacity-50 day-disabled:pointer-events-none",
                    "day-range-middle:rounded-none bg-active aria-selected:!bg-active",
                    "day-hidden:invisible"
                ),
                day_range_end: "day-range-end",
                day_range_start: "day-range-start",
                day_range_middle: "day-range-middle",
                day_selected: "day-selected",
                ...classNames,
            }}
            components={{
                IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                IconRight: () => <ChevronRight className="h-4 w-4" />,
            }}
            locale={fr}
            {...props}
        />
    );
}

export { Calendar };
