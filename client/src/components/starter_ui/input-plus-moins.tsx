import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { inputVariants } from "./input";
import { MinusIcon, PlusIcon } from "../icons";

type InputPlusMoinsProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> &
    VariantProps<typeof inputVariants> & {
        className?: string;
        value?: number;
        defaultValue?: number;
        onChange?: (value: number) => void;
    };

export function InputPlusMoins({
    className,
    variant,
    customSize,
    value,
    defaultValue = 0,
    onChange,
    ...props
}: InputPlusMoinsProps) {
    const isControlled = typeof value === "number";

    const [internalValue, setInternalValue] = React.useState<number>(defaultValue);
    const [rawInput, setRawInput] = React.useState<string>(
        (isControlled ? value : defaultValue).toString()
    );

    const actualValue = isControlled ? value! : internalValue;

    const update = (newVal: number) => {
        if (onChange) onChange(newVal);
        if (!isControlled) {
            setInternalValue(newVal);
            setRawInput(newVal.toString());
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;

        if (/^\d*$/.test(input)) {
            setRawInput(input);

            if (input !== "") {
                const parsed = parseInt(input, 10);
                if (!isNaN(parsed)) {
                    update(parsed);
                }
            }
        }
    };

    const handleBlur = () => {
        if (rawInput === "") {
            update(0);
        }
    };

    return (
        <div
            className={cn(
                inputVariants({ variant, customSize, className }),
                "relative flex border py-0"
            )}
        >
            <button
                type="button"
                onClick={() => update(actualValue - 1)}
                className="left-0 border-r border-[var(--border-primary)] h-full text-[var(--fg-quaternary)] px-2 flex items-center justify-center shrink-0 select-none"
            >
                <MinusIcon size={20} />
            </button>

            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={cn(
                    "h-full w-full text-center focus:outline-none placeholder:text-sm px-3 bg-transparent"
                )}
                value={rawInput}
                onChange={handleInputChange}
                onBlur={handleBlur}
                {...props}
            />

            <button
                type="button"
                onClick={() => update(actualValue + 1)}
                className="right-0 border-l cursor-pointer border-[var(--border-primary)] h-full text-[var(--fg-quaternary)] px-2 flex items-center justify-center shrink-0 select-none"
            >
                <PlusIcon size={20} />
            </button>
        </div>
    );
}

InputPlusMoins.displayName = "InputPlusMoins";
