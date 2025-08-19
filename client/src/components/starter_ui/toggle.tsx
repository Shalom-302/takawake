"use client";

import { cn } from "@/lib/utils/cn";
import React from "react";

type SwitchProps = {
    id: string;
    disabled?: boolean;
    isChecked: string[];
    setIsChecked: Function;
};

export const Toggle: React.FC<SwitchProps> = ({ id, isChecked, setIsChecked, disabled }) => {
    const handleClick = () => {
        if (isChecked.find((x: string) => x === id)) {
            const newData = isChecked.filter((x: string) => x !== id);
            setIsChecked(newData);
            return;
        }
        setIsChecked((current: string[]) => [...current, id]);
    };
    return (
        <>
            <button
                onClick={() => (disabled ? null : handleClick())}
                aria-checked={isChecked.find((x: string) => x === id) ? true : false}
                role="switch"
                className={cn(
                    "relative w-9 h-5 p-0.5 flex items-center rounded-md transition-all",
                    !disabled && "focus:ring-2 focus:ring-offset-1 focus:ring-primary",
                    disabled
                        ? "bg-muted"
                        : isChecked.includes(id)
                          ? "bg-primary sm:hover:bg-primary/80"
                          : "bg-accent"
                )}
            >
                <div
                    className={cn(
                        "flex items-center justify-center absolute w-4 h-4 rounded-sm shrink-0 shadow-sm transition-transform duration-300",
                        disabled
                            ? "bg-[var(--color-toggle-button-fg_disabled)] cursor-not-allowed"
                            : "bg-[var(--fg-white)]",
                        isChecked.includes(id) ? "translate-x-[16px]" : "translate-x-0"
                    )}
                />
            </button>
        </>
    );
};
