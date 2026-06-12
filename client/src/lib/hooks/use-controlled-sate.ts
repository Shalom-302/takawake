"use client";
import * as React from "react";

export function useControlledState<T>(
    controlledValue: T | undefined,
    defaultValue: T,
    onChange?: (value: T) => void
) {
    const [internalValue, setInternalValue] = React.useState<T>(defaultValue);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const setValue = React.useCallback(
        (newValue: T) => {
            if (!isControlled) {
                setInternalValue(newValue);
            }
            onChange?.(newValue);
        },
        [isControlled, onChange]
    );

    return [value, setValue] as const;
}
