"use client";

import * as React from "react";
import { isToday, isSameDay } from "date-fns";
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";
import { ChevronDown, ChevronLeft, ChevronRight } from "@untitled-ui/icons-react";

import { Button, ButtonVariants, buttonVariants } from "@/components/ui/buttons";

import { cn } from "@/lib/utils/cn";
import { getLocalizedLabels, useLocale } from "@/lib/hooks/use-locale";

export function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    captionLayout = "label",
    formatters,
    components,
    highlightedDates = [],
    ...props
}: React.ComponentProps<typeof DayPicker> & {
    buttonVariant?: ButtonVariants["variant"];
    highlightedDates?: Date[];
}) {
    const { locale, localeCode, isRTL, firstDayOfWeek } = useLocale();
    const defaultClassNames = getDefaultClassNames();
    const localizedLabels = getLocalizedLabels(localeCode);

    return (
        <DayPicker
            locale={locale}
            weekStartsOn={firstDayOfWeek}
            dir={isRTL ? "rtl" : "ltr"}
            showOutsideDays={showOutsideDays}
            className={cn("flex flex-col gap-3", isRTL && "rtl", className)}
            captionLayout={captionLayout}
            labels={localizedLabels}
            formatters={{
                formatMonthDropdown: date => date.toLocaleString(localeCode, { month: "short" }),
                formatYearDropdown: date => date.toLocaleString(localeCode, { year: "numeric" }),
                formatWeekdayName: date =>
                    date.toLocaleDateString(localeCode, { weekday: "short" }),
                formatMonthCaption: date =>
                    date.toLocaleDateString(localeCode, {
                        month: "long",
                        year: "numeric",
                    }),
                ...formatters,
            }}
            classNames={{
                root: cn("w-fit", defaultClassNames.root),
                months: cn("flex gap-4 flex-col md:flex-row relative", defaultClassNames.months),
                month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
                nav: cn(
                    "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
                    isRTL && "flex-row-reverse",
                    defaultClassNames.nav
                ),
                button_previous: cn(
                    buttonVariants({ variant: "tertiary" }),
                    "size-8 p-0 select-none hover:bg-primary_hover",
                    defaultClassNames.button_previous
                ),
                button_next: cn(
                    buttonVariants({ variant: "tertiary" }),
                    "size-8 p-0 select-none hover:bg-primary_hover",
                    defaultClassNames.button_next
                ),
                month_caption: cn(
                    "flex items-center justify-center h-8 w-full px-8",
                    defaultClassNames.month_caption
                ),
                caption_label: cn(
                    "text-sm font-semibold text-fg-secondary",
                    defaultClassNames.caption_label
                ),
                table: "w-full border-collapse",
                weekdays: cn(
                    "flex border-b-4 border-transparent",
                    isRTL && "flex-row-reverse",
                    defaultClassNames.weekdays
                ),
                weekday: cn(
                    "flex size-10 items-center justify-center text-sm font-medium text-secondary",
                    defaultClassNames.weekday
                ),
                week: cn(
                    "flex w-full border-b-4 border-transparent last:border-none",
                    isRTL && "flex-row-reverse",
                    defaultClassNames.week
                ),
                // day: cn("relative size-10 p-0 focus-within:z-20", defaultClassNames.day),
                // range_start: cn(
                //     isRTL ? "rounded-r-full bg-active" : "rounded-l-full bg-active",
                //     defaultClassNames.range_start
                // ),
                // range_middle: cn("bg-active", defaultClassNames.range_middle),
                // range_end: cn(
                //     isRTL ? "rounded-l-full bg-active" : "rounded-r-full bg-active",
                //     defaultClassNames.range_end
                // ),
                // today: cn("bg-active font-medium rounded-full", defaultClassNames.today),
                day: cn(
                    "relative size-10 p-0 focus-within:z-20 [&:has([data-range-start])]:rounded-l-full [&:has([data-range-end])]:rounded-r-full [&:has([data-range-middle])]:bg-active",
                    defaultClassNames.day
                ),
                range_start: cn("bg-active", defaultClassNames.range_start),
                range_middle: cn("bg-active", defaultClassNames.range_middle),
                range_end: cn("bg-active", defaultClassNames.range_end),
                today: cn("bg-active font-medium rounded-full", defaultClassNames.today),
                outside: cn("text-tertiary opacity-50 hidden", defaultClassNames.outside),
                disabled: cn("text-disabled pointer-events-none", defaultClassNames.disabled),
                hidden: cn("invisible", defaultClassNames.hidden),
                ...classNames,
            }}
            components={{
                Root: ({ className, rootRef, ...props }) => (
                    <div ref={rootRef} className={cn(className)} {...props} />
                ),
                Chevron: ({ className, orientation, ...props }) => {
                    // Inverser les chevrons pour RTL
                    const actualOrientation = isRTL
                        ? orientation === "left"
                            ? "right"
                            : orientation === "right"
                              ? "left"
                              : orientation
                        : orientation;

                    if (actualOrientation === "left") {
                        return <ChevronLeft className={cn("h-4 w-4", className)} {...props} />;
                    }
                    if (actualOrientation === "right") {
                        return <ChevronRight className={cn("h-4 w-4", className)} {...props} />;
                    }
                    return <ChevronDown className={cn("size-4", className)} {...props} />;
                },
                DayButton: props => (
                    <CalendarDayButton {...props} highlightedDates={highlightedDates} />
                ),
                ...components,
            }}
            {...props}
        />
    );
}

function CalendarDayButton({
    className,
    day,
    modifiers,
    highlightedDates = [],
    ...props
}: React.ComponentProps<typeof DayButton> & { highlightedDates?: Date[] }) {
    const defaultClassNames = getDefaultClassNames();
    const isHighlighted = highlightedDates.some(d => isSameDay(d, day.date));
    const isTodayDate = isToday(day.date);

    const ref = React.useRef<HTMLButtonElement>(null);
    React.useEffect(() => {
        if (modifiers.focused) ref.current?.focus();
    }, [modifiers.focused]);

    return (
        <Button
            ref={ref}
            variant="tertiary"
            data-range-start={modifiers.range_start || undefined}
            data-range-end={modifiers.range_end || undefined}
            data-range-middle={modifiers.range_middle || undefined}
            className={cn(
                "size-full rounded-full text-sm font-normal relative",
                "hover:bg-primary_hover hover:text-secondary_hover hover:font-medium",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:text-disabled",
                // Selected single date
                modifiers.selected &&
                    !modifiers.range_middle &&
                    !modifiers.range_start &&
                    !modifiers.range_end &&
                    "bg-brand-solid font-medium text-white hover:bg-brand-solid_hover hover:text-white",
                // Range styling with proper rounded corners
                modifiers.range_start &&
                    "bg-brand-solid font-medium text-white hover:bg-brand-solid_hover hover:text-white rounded-l-full ",
                modifiers.range_end &&
                    "bg-brand-solid font-medium text-white hover:bg-brand-solid_hover hover:text-white rounded-r-full",
                modifiers.range_middle && "bg-active font-medium text-secondary rounded-none",
                // Today styling (when not selected)
                modifiers.today &&
                    !modifiers.selected &&
                    !modifiers.range_start &&
                    !modifiers.range_end &&
                    "bg-active font-medium",
                // Outside month
                modifiers.outside && "text-tertiary opacity-50",
                defaultClassNames.day,
                className
            )}
            {...props}
        >
            <div className="flex items-center justify-center size-full">
                {day.date.getDate()}
                {(isHighlighted || isTodayDate) && (
                    <div
                        className={cn(
                            "absolute bottom-1 left-1/2 size-1.25 -translate-x-1/2 rounded-full",
                            modifiers.selected && modifiers.range_start && modifiers.range_end
                                ? "bg-fg-white"
                                : "bg-fg-brand-primary"
                        )}
                    />
                )}
            </div>
        </Button>
    );
}
