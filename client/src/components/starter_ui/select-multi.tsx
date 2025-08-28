/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/display-name */
"use client";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { CheckIcon, ChevronDownIcon, XCloseIcon, SearchMdIcon } from "../icons";
import { SelectProps } from "@/lib/types/definitions";
import { DropdownItem } from "./dropdown";
import { Checkbox } from "./checkbox";
import { cn } from "@/lib/utils/cn";
import Label from "./label";
import { Badge } from "../ui/badges/badge";

type DropDownProps = {
    customSize?: "sm" | "md";
    color?: "default";
    placeholder?: string;
    id: string;
    withSearch?: boolean;
    items: { label: string; value: string }[];
    setSelectedElements: (value: SelectProps[]) => void;
    selectedElements: SelectProps[];
} & React.ComponentPropsWithRef<"div">;

export const SelectMulti = React.forwardRef<HTMLDivElement, DropDownProps>(
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

        const handleClick = () => setIsActive(!isActive);

        const handleOutsideClick = useCallback((event: MouseEvent) => {
            if (box?.current && !box?.current.contains(event.target as Node)) {
                setIsActive(false);
            }
        }, []);

        const adjustDropdownPosition = useCallback(() => {
            if (box.current && triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setTriggerHeight(rect.height);
                const availableSpaceBelow = window.innerHeight - rect.bottom;
                const availableSpaceAbove = rect.top;
                setShowAbove(
                    availableSpaceBelow < dropdownHeight && availableSpaceAbove > dropdownHeight
                );
            }
        }, [dropdownHeight]);

        useEffect(() => {
            document.addEventListener("click", handleOutsideClick);
            return () => document.removeEventListener("click", handleOutsideClick);
        }, [handleOutsideClick]);

        useEffect(() => {
            if (isActive) {
                if (dropdownRef.current) {
                    const rect = dropdownRef.current.getBoundingClientRect();
                    setDropdownHeight(rect.height);
                }
                adjustDropdownPosition();
                window.addEventListener("resize", adjustDropdownPosition);
            } else {
                window.removeEventListener("resize", adjustDropdownPosition);
            }
            return () => window.removeEventListener("resize", adjustDropdownPosition);
        }, [isActive, adjustDropdownPosition]);

        const toggleItem = (item: { label: string; value: string }) => {
            const exists = selectedElements.find(x => x.id === id && x.value === item.value);
            if (exists) {
                setSelectedElements(
                    selectedElements.filter(x => !(x.id === id && x.value === item.value))
                );
            } else {
                setSelectedElements([
                    ...selectedElements,
                    { id, label: item.label, value: item.value },
                ]);
            }
        };

        const removeItem = (value: string) => {
            setSelectedElements(selectedElements.filter(x => !(x.id === id && x.value === value)));
        };

        const selectedForThisSelect = selectedElements.filter(x => x.id === id);

        const triggerClass = clsx(
            `
                cursor-pointer flex items-center justify-between shadow-xs bg-white border border-primary/70
                w-full pl-1.5 rounded-lg focus:outline-none transition-all
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
                {isActive && <div className="fixed inset-0 z-50" />}
                <div ref={box} className="relative">
                    <button
                        ref={triggerRef}
                        onClick={e => {
                            e.preventDefault();
                            handleClick();
                        }}
                        type="button"
                        className={triggerClass}
                    >
                        <div className="flex flex-wrap gap-1 items-center flex-1">
                            {selectedForThisSelect.length > 0 ? (
                                selectedForThisSelect.map(el => (
                                    <Badge key={el.value} size={"md"} className="px-2">
                                        {el.label}
                                        <span
                                            role="button"
                                            tabIndex={0}
                                            onClick={e => {
                                                e.stopPropagation();
                                                removeItem(el.value);
                                            }}
                                            className=" hover:text-[var(--bg-error-solid)] cursor-pointer"
                                        >
                                            <XCloseIcon size={14} />
                                        </span>
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-sm pl-1.5 text-primary/60">
                                    {placeholder}
                                </span>
                            )}
                        </div>
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
                                    className="absolute z-50 w-full bg-primary-foreground border border-primary/30 overflow-auto rounded-lg shadow-lg"
                                >
                                    {withSearch && (
                                        <div className="border-b border-primary/30 w-full flex items-center">
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

                                    <div className="max-h-[300px] overflow-auto p-2">
                                        {items.map(el => {
                                            const isSelected = selectedForThisSelect.some(
                                                x => x.value === el.value
                                            );
                                            return (
                                                <DropdownItem
                                                    key={el.value}
                                                    asChild
                                                    className="cursor-pointer"
                                                    onClick={() => toggleItem(el)}
                                                >
                                                    <button
                                                        type="button"
                                                        className="flex items-center w-full gap-2"
                                                    >
                                                        <span className="text-sm text-left w-full truncate">
                                                            {el.label}
                                                        </span>
                                                        {isSelected && (
                                                            <div className="w-6 h-6 shrink-0 flex items-center justify-end">
                                                                <CheckIcon size={16} />
                                                            </div>
                                                        )}
                                                    </button>
                                                </DropdownItem>
                                            );
                                        })}
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

export const SelectMultiTwo = React.forwardRef<HTMLDivElement, DropDownProps>(
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

        const handleClick = () => setIsActive(!isActive);

        const handleOutsideClick = useCallback((event: MouseEvent) => {
            if (box?.current && !box?.current.contains(event.target as Node)) {
                setIsActive(false);
            }
        }, []);

        const adjustDropdownPosition = useCallback(() => {
            if (box.current && triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setTriggerHeight(rect.height);
                const availableSpaceBelow = window.innerHeight - rect.bottom;
                const availableSpaceAbove = rect.top;
                setShowAbove(
                    availableSpaceBelow < dropdownHeight && availableSpaceAbove > dropdownHeight
                );
            }
        }, [dropdownHeight]);

        useEffect(() => {
            document.addEventListener("click", handleOutsideClick);
            return () => document.removeEventListener("click", handleOutsideClick);
        }, [handleOutsideClick]);

        useEffect(() => {
            if (isActive) {
                if (dropdownRef.current) {
                    const rect = dropdownRef.current.getBoundingClientRect();
                    setDropdownHeight(rect.height);
                }
                adjustDropdownPosition();
                window.addEventListener("resize", adjustDropdownPosition);
            } else {
                window.removeEventListener("resize", adjustDropdownPosition);
            }
            return () => window.removeEventListener("resize", adjustDropdownPosition);
        }, [isActive, adjustDropdownPosition]);

        const toggleItem = (item: { label: string; value: string }) => {
            const exists = selectedElements.find(x => x.id === id && x.value === item.value);
            if (exists) {
                setSelectedElements(
                    selectedElements.filter(x => !(x.id === id && x.value === item.value))
                );
            } else {
                setSelectedElements([
                    ...selectedElements,
                    { id, label: item.label, value: item.value },
                ]);
            }
        };

        const selectedForThisSelect = selectedElements.filter(x => x.id === id);

        const triggerClass = clsx(
            `
                cursor-pointer inline-block shadow-xs bg-white 
                border border-dashed border-primary/30 w-full rounded-lg focus:outline-none transition-all
                focus-within:border-primary
                focus-within:bg-primary-foreground
                `,
            {
                /* Tailles */
                "h-10 py-2": customSize === "sm",
                "h-11 py-2": customSize === "md",
            }
        );

        return (
            <>
                {isActive && <div className="fixed inset-0 z-50" />}
                <>
                    <div ref={box} className="relative inline-block">
                        <button
                            ref={triggerRef}
                            onClick={e => {
                                e.preventDefault();
                                handleClick();
                            }}
                            type="button"
                            className={triggerClass}
                        >
                            <div className="flex items-center">
                                <span className=" px-3 text-sm block font-medium text-primary/60 ">
                                    {placeholder}
                                </span>
                                {selectedForThisSelect.length > 0 && (
                                    <div className="px-3 border-l border-primary/30 flex flex-wrap gap-1">
                                        {selectedForThisSelect.length > 2 ? (
                                            <Badge size={"md"} className="px-2">
                                                {`${selectedForThisSelect.length} sélections`}
                                            </Badge>
                                        ) : (
                                            selectedForThisSelect.map(el => (
                                                <Badge key={el.value} size={"md"} className="px-2">
                                                    {el.label}
                                                </Badge>
                                            ))
                                        )}
                                    </div>
                                )}
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
                                        className="absolute z-50 bg-primary-foreground w-[220px] border border-primary/30 overflow-auto rounded-lg shadow-lg"
                                    >
                                        {withSearch && (
                                            <div className="border-b border-primary/30 w-full flex items-center">
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

                                        <div className="max-h-[300px] overflow-auto p-2">
                                            {items.map(el => {
                                                const isSelected = selectedForThisSelect.some(
                                                    x => x.value === el.value
                                                );
                                                return (
                                                    <DropdownItem
                                                        key={el.value}
                                                        asChild
                                                        className="cursor-pointer block"
                                                    >
                                                        <Label
                                                            htmlFor={el?.value}
                                                            className={cn(
                                                                "flex items-start gap-2 rounded-xl cursor-pointer transition-all",
                                                                "has-[:disabled]:bg-primary/60 has-[:disabled]:cursor-not-allowed has-[:disabled]:text-primary/40 ",
                                                                "has-[[aria-checked=true][disabled]]:ring-primary"
                                                            )}
                                                        >
                                                            <Checkbox
                                                                id={el?.value}
                                                                checked={isSelected}
                                                                onCheckedChange={() =>
                                                                    toggleItem(el)
                                                                }
                                                                className="bg-primary-foreground ring-transparent! size-4.5 rounded-sm [&_svg]:scale-90"
                                                            />
                                                            <div className="grid gap-1.5 font-normal">
                                                                <p className="text-sm leading-none font-medium">
                                                                    {el?.label}
                                                                </p>
                                                            </div>
                                                        </Label>
                                                    </DropdownItem>
                                                );
                                            })}
                                        </div>
                                        {selectedForThisSelect.length > 0 && (
                                            <div className="p-1 mt-2 border-t border-primary/30">
                                                <DropdownItem
                                                    asChild
                                                    className="cursor-pointer block"
                                                    onClick={() => setSelectedElements([])}
                                                >
                                                    <div className="text-sm font-medium text-center">
                                                        {"Tout vider"}
                                                    </div>
                                                </DropdownItem>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </>
            </>
        );
    }
);
