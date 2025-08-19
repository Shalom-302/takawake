/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { CalendarIcon } from "../icons";
import { Calendar } from "./calendar";
import { formatDateToFrench } from "@/lib/utils/format-date";

type DropDownProps = {
    customSize?: "sm" | "md";
    color?: "default";
    placeholder?: string;
    selectedDate: any;
    setSelectedDate: any;
    mode?: "single" | "multiple" | "range";
} & React.ComponentPropsWithRef<"div">;

const DatePicker = React.forwardRef<HTMLDivElement, DropDownProps>(
    (
        {
            customSize = "sm",
            selectedDate,
            setSelectedDate,
            mode = "single",
            placeholder = "Sélectionnez",
        },
        ref
    ) => {
        const box = useRef<HTMLDivElement>(null);
        const triggerRef = useRef<HTMLButtonElement>(null);
        const dropdownRef = useRef<HTMLDivElement>(null);

        const [isActive, setIsActive] = useState(false);
        const [showAbove, setShowAbove] = useState(false);
        const [triggerHeight, setTriggerHeight] = useState<number>(0);

        const [dropdownHeight, setDropdownHeight] = useState<number>(0);

        const handleClick = () => {
            setIsActive(!isActive);
        };

        const handleOutsideClick = useCallback(
            (event: MouseEvent) => {
                if (box?.current && !box?.current.contains(event.target as Node)) {
                    setIsActive(false);
                }
            },
            [setIsActive]
        );

        const adjustDropdownPosition = useCallback(() => {
            if (box.current && triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect(); // Mesurer la hauteur du trigger
                setTriggerHeight(rect.height); // Stocker la hauteur du trigger

                const availableSpaceBelow = window.innerHeight - rect.bottom; // Espace sous le bouton
                const availableSpaceAbove = rect.top; // Espace au-dessus du bouton

                // Si l'espace sous le bouton est insuffisant, affichez au-dessus
                setShowAbove(
                    availableSpaceBelow < dropdownHeight && availableSpaceAbove > dropdownHeight
                );
            }
        }, [dropdownHeight]);

        useEffect(() => {
            document.addEventListener("click", handleOutsideClick);
            return () => {
                document.removeEventListener("click", handleOutsideClick);
            };
        }, [handleOutsideClick]);

        useEffect(() => {
            if (isActive) {
                if (box.current && dropdownRef.current) {
                    const rect = dropdownRef.current.getBoundingClientRect(); // Mesurer la hauteur du trigger
                    setDropdownHeight(rect.height); // Stocker la hauteur du trigger
                }
                adjustDropdownPosition();
                window.addEventListener("resize", adjustDropdownPosition);
            } else {
                window.removeEventListener("resize", adjustDropdownPosition);
            }
            return () => {
                window.removeEventListener("resize", adjustDropdownPosition);
            };
        }, [isActive, adjustDropdownPosition]);

        const triggerClass = clsx(
            `
            cursor-pointer flex items-center justify-between shadow-xs bg-[var(--bg-primary)] 
            border border-primary/30 w-full pl-3 rounded-lg focus:outline-none transition-all
            focus-within:border-primary
            focus-within:ring focus-within:ring-primary
            `,
            {
                "border-primary ring ring-primary": isActive,
            },
            {
                /* Tailles */
                "h-10 py-2": customSize === "sm",
                "h-11 py-2": customSize === "md",
            }
        );

        const [formatSelectedDate, setFormatSelectedDate] = useState<string | null>(null);

        useEffect(() => {
            if (selectedDate && mode === "single") {
                setFormatSelectedDate(`${formatDateToFrench(selectedDate)}`);
            }

            if (selectedDate && mode === "range") {
                setFormatSelectedDate(
                    `${formatDateToFrench(selectedDate?.from)} - ${formatDateToFrench(selectedDate?.to)}`
                );
            }

            if (selectedDate && mode === "multiple") {
                setFormatSelectedDate(
                    `${selectedDate.length} ${selectedDate.length > 1 ? "sélections" : "sélection"} `
                );
            }
        }, [selectedDate]);

        return (
            <>
                {isActive && <div className="fixed top-0 left-0 inset-0 z-50"></div>}
                <div ref={box} className={`relative`}>
                    <button
                        ref={triggerRef} // Référence pour mesurer la hauteur
                        onClick={e => {
                            e.preventDefault();
                            handleClick();
                        }}
                        type="button"
                        className={triggerClass}
                    >
                        {formatSelectedDate ? (
                            <span
                                className={clsx("block text-sm truncate", {
                                    capitalize: mode !== "multiple",
                                })}
                            >
                                {formatSelectedDate}
                            </span>
                        ) : (
                            <span className="block text-sm truncate text-primary/60 ">
                                {placeholder}
                            </span>
                        )}

                        <div className={clsx("flex items-center justify-center shrink-0 h-full")}>
                            <div
                                className={clsx(
                                    "opacity-60 px-2 transition-all duration-300 text-primary"
                                )}
                            >
                                <CalendarIcon size={18} />
                            </div>
                        </div>
                    </button>

                    <AnimatePresence mode="popLayout">
                        {isActive && (
                            <div
                                className="relative"
                                style={{
                                    top: showAbove
                                        ? `-${dropdownHeight + 10 + triggerHeight}px`
                                        : `10px`,
                                }}
                            >
                                <motion.div
                                    ref={dropdownRef}
                                    initial={{ opacity: 0, y: showAbove ? -4 : 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: showAbove ? -4 : 4 }}
                                    transition={{ duration: 0.1 }}
                                    className={`
                                        absolute z-50 w-full min-w-[340px]
                                        bg-white border border-primary/30 overflow-auto rounded-lg shadow-lg
                                    `}
                                >
                                    <div className="h-auto max-h-[380px] overflow-auto p-4 ">
                                        <Calendar
                                            mode={mode}
                                            selectedDate={selectedDate}
                                            setSelectedDate={setSelectedDate}
                                        />
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </>
        );
    }
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
