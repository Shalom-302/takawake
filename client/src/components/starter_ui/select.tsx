/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
"use client";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { CheckIcon, ChevronDownIcon, SearchMdIcon } from "../icons";
import { SelectProps } from "@/lib/types/definitions";
import { DropdownItem } from "./dropdown";

type DropDownProps = {
    customSize?: "sm" | "md";
    color?: "default";
    placeholder?: string;
    id: string;
    withSearch?: boolean;
    items: {
        label: string;
        value: string;
    }[];
    setSelectedElements: Function;
    selectedElements: SelectProps[];
} & React.ComponentPropsWithRef<"div">;

const Select = React.forwardRef<HTMLDivElement, DropDownProps>(
    (
        {
            items,
            id,
            customSize = "sm",
            setSelectedElements,
            withSearch = false,
            selectedElements,
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

        const selectEl = (data: { label: string; value: string }) => {
            if (!selectedElements.find((x: any) => x.id === id)) {
                setSelectedElements((current: any) => [
                    ...current,
                    { id: id, label: data.label, value: data.value },
                ]);
                setIsActive(false);
                return;
            }

            const newData = selectedElements.map((x: any) => {
                if (x.id === id) {
                    return { id: id, label: data.label, value: data.value };
                }
                return x;
            });

            setSelectedElements(newData);
            setIsActive(false);
        };

        const triggerClass = clsx(
            `
            cursor-pointer flex items-center justify-between shadow-xs bg-white 
            border border-primary/70 w-full pl-3 rounded-lg focus:outline-none transition-all
            focus-within:border-primary
            focus-within:ring focus-within:ring-primary
            `,
            {
                /* Tailles */
                "h-10 py-2": customSize === "sm",
                "h-11 py-2": customSize === "md",
            }
        );

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
                        {selectedElements?.find((x: any) => x.id === id) ? (
                            <span className="block text-sm truncate">
                                {selectedElements?.find((x: any) => x.id === id)?.label}
                            </span>
                        ) : (
                            <span className="block text-sm truncate text-primary/60 ">
                                {placeholder}
                            </span>
                        )}

                        <div className={clsx("flex items-center justify-center shrink-0 h-full")}>
                            <div
                                className={clsx(
                                    "opacity-60 px-2 transition-all duration-300 text-primary",
                                    {
                                        "rotate-180": isActive,
                                    }
                                )}
                            >
                                <ChevronDownIcon size={18} />
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
                                        absolute z-50 w-full
                                        bg-primary-foreground border border-primary/70 overflow-auto rounded-lg shadow-lg
                                    `}
                                >
                                    {withSearch && (
                                        <div className="border-b border-primary/70 w-full flex items-center">
                                            <div className="h-10 w-10 shrink-0 flex items-center justify-center text-primary/60">
                                                <SearchMdIcon size={16} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Rechercher"
                                                className="focus:outline-none h-10 pr-3 w-full placeholder:text-sm placeholder:text-primary/60"
                                            />
                                        </div>
                                    )}

                                    <div className="h-auto max-h-[300px] overflow-auto p-2 ">
                                        {items?.map((el: { label: string; value: string }) => (
                                            <DropdownItem
                                                key={el?.value}
                                                asChild
                                                className="cursor-pointer"
                                                onClick={() => selectEl(el)}
                                            >
                                                <button
                                                    type="button"
                                                    className="flex items-center w-full gap-2 "
                                                >
                                                    <span className="text-sm text-left w-full truncate">
                                                        {el?.label}
                                                    </span>
                                                    {selectedElements?.find(
                                                        (x: any) =>
                                                            x.id === id && x.value === el?.value
                                                    ) && (
                                                        <div className="w-6 h-6 shrink-0 flex items-center justify-end">
                                                            <CheckIcon size={16} />
                                                        </div>
                                                    )}
                                                </button>
                                            </DropdownItem>
                                        ))}
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

Select.displayName = "Select";

export default Select;
