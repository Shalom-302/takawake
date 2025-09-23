"use client";

import * as React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/buttons";
import { Popover } from "@/components/ui/popover";
import { Calendar } from "./calendar";
import { Calendar as CalendarIcon } from "@untitled-ui/icons-react";
import { DateInput } from "./date-input";
import { useLocale } from "@/lib/hooks/use-locale";
import { FormFieldWrapper, type FormFieldWrapperProps } from "../form";
import { type FieldPath, type FieldValues } from "react-hook-form";

interface DatePickerProps {
    value?: Date | undefined;
    onChange?: (date: Date | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    "aria-invalid"?: boolean;
}

export function DatePicker({
    value,
    onChange,
    placeholder = "Select date",
    disabled = false,
    ...props
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value || undefined);

    React.useEffect(() => {
        setSelectedDate(value);
    }, [value]);

    const highlightedDates = [new Date()]; // Today

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
    };

    const handleApply = () => {
        onChange?.(selectedDate || undefined);
        setOpen(false);
    };

    const handleCancel = () => {
        setSelectedDate(value || undefined);
        setOpen(false);
    };

    const todayPreset = () => {
        const today = new Date();
        setSelectedDate(today);
    };
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            handleApply();
        }
    };

    const { dateFormat } = useLocale();

    const formattedDate = value ? format(value, dateFormat) : placeholder;

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            trigger={
                <Button
                    size="md"
                    variant="secondary"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-placeholder"
                    )}
                    disabled={disabled}
                    leftIcon={<CalendarIcon className="size-4" />}
                    aria-label="Date picker"
                >
                    {formattedDate}
                </Button>
            }
            triggerClassName={
                props["aria-invalid"]
                    ? "ring-error_subtle focus-visible:ring-2 focus-visible:ring-error focus-visible:outline-none"
                    : undefined
            }
            content={
                <div className="w-full" onKeyDown={handleKeyDown}>
                    <div className="flex px-6 py-5 ">
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-3">
                                <DateInput
                                    value={selectedDate}
                                    onChange={setSelectedDate}
                                    className="flex-1"
                                />
                                <Button size="md" variant="secondary" onClick={todayPreset}>
                                    Today
                                </Button>
                            </div>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                highlightedDates={highlightedDates}
                                className="w-max"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-secondary p-4">
                        <Button size="md" variant="secondary" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button size="md" onClick={handleApply}>
                            Apply
                        </Button>
                    </div>
                </div>
            }
            contentClassName="w-auto p-0 rounded-2xl bg-primary shadow-xl ring ring-secondary_alt"
        />
    );
}

// === FORM INTEGRATION ===
export interface InputFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldWrapperProps<TFieldValues, TName>, "children">,
        Omit<DatePickerProps, "defaultValue" | "name"> {
    isRequired?: boolean;
}

export function DatePickerForm<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    isRequired,
    control,
    name,
    label,
    description,
    labelTooltip,
    ...props
}: InputFormProps<TFieldValues, TName>) {
    return (
        <FormFieldWrapper
            control={control}
            name={name}
            label={label}
            labelTooltip={labelTooltip}
            description={description}
            isRequired={isRequired}
        >
            {field => {
                return <DatePicker {...field} {...props} />;
            }}
        </FormFieldWrapper>
    );
}
