"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils/cn";

const styles = {
    default: "hidden",
    bottom: "absolute top-2 left-1/2 -translate-x-1/2 translate-y-full text-md font-medium text-primary",
    "top-floating":
        "absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-secondary shadow-lg ring-1 ring-secondary_alt",
};

interface SliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
    labelPosition?: keyof typeof styles;
    labelFormatter?: (value: number) => string;
    formatOptions?: Intl.NumberFormatOptions;
}

export const Slider = ({
    labelPosition = "default",
    min = 0,
    max = 100,
    step = 1,
    value,
    defaultValue,
    labelFormatter,
    formatOptions,
    className,
    onValueChange,
    ...rest
}: SliderProps) => {
    // Format thumb value as percentage by default.
    const defaultFormatOptions: Intl.NumberFormatOptions = {
        style: "percent",
        maximumFractionDigits: 0,
    };

    const finalFormatOptions = formatOptions ?? defaultFormatOptions;

    // État interne pour gérer les valeurs actuelles
    const [currentValues, setCurrentValues] = React.useState<number[]>(() => {
        if (Array.isArray(value)) return value;
        if (typeof value === "number") return [value];
        if (Array.isArray(defaultValue)) return defaultValue;
        if (typeof defaultValue === "number") return [defaultValue];
        return [min];
    });

    // Synchroniser avec les props externes
    React.useEffect(() => {
        if (Array.isArray(value)) {
            setCurrentValues(value);
        } else if (typeof value === "number") {
            setCurrentValues([value]);
        }
    }, [value]);

    const handleValueChange = (newValues: number[]) => {
        setCurrentValues(newValues);
        onValueChange?.(newValues);
    };

    const formatValue = React.useCallback(
        (val: number) => {
            if (labelFormatter) {
                return labelFormatter(val);
            }

            // Use Intl.NumberFormat like react-aria does
            const formatter = new Intl.NumberFormat(undefined, finalFormatOptions);

            // If using percentage format, convert to 0-1 range like react-aria
            if (finalFormatOptions.style === "percent") {
                return formatter.format(val / 100);
            }

            return formatter.format(val);
        },
        [labelFormatter, finalFormatOptions]
    );

    // Calculer les positions et largeurs comme dans react-aria
    const getThumbPercent = (index: number) => {
        return (currentValues[index] - min) / (max - min);
    };

    const left = currentValues.length === 1 ? 0 : getThumbPercent(0);
    const width = currentValues.length === 1 ? getThumbPercent(0) : getThumbPercent(1) - left;

    return (
        <SliderPrimitive.Root
            className={cn(
                "relative flex w-full h-6 items-center select-none touch-none",
                className
            )}
            value={currentValues}
            defaultValue={
                Array.isArray(defaultValue)
                    ? defaultValue
                    : typeof defaultValue === "number"
                      ? [defaultValue]
                      : undefined
            }
            min={min}
            max={max}
            step={step}
            onValueChange={handleValueChange}
            {...rest}
        >
            <SliderPrimitive.Track className="relative w-full grow overflow-hidden">
                {/* Background Track */}
                <span className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-quaternary" />

                {/* Active Range - calculé manuellement */}
                <span
                    className="absolute top-0 h-full rounded-full bg-brand-solid"
                    style={{
                        left: `${left * 100}%`,
                        width: `${width * 100}%`,
                    }}
                />
            </SliderPrimitive.Track>

            {/* Thumbs */}
            {currentValues.map((val, index) => (
                <SliderPrimitive.Thumb
                    key={index}
                    className={cn(
                        "block size-6 cursor-grab rounded-full bg-slider-handle-bg shadow-md ring-2 ring-slider-handle-border ring-inset transition-colors",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                        "disabled:pointer-events-none disabled:opacity-50"
                    )}
                >
                    {/* Label Output */}
                    <div className={cn("whitespace-nowrap", styles[labelPosition])}>
                        {formatValue(val)}
                    </div>
                </SliderPrimitive.Thumb>
            ))}
        </SliderPrimitive.Root>
    );
};
