"use client";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Slot } from "@radix-ui/react-slot";

const TriggerVariant = ["click", "hover"] as const;

type DropDownProps = {
    triggerMode?: (typeof TriggerVariant)[number];
    classNames?: string;
    triggerClassNames?: string;
    dropdownTrigger: React.ReactNode;
    dropdownOrigin?: "left" | "right";
} & React.ComponentPropsWithRef<"div">;

export const Dropdown = React.forwardRef<HTMLDivElement, DropDownProps>(
    (
        {
            children,
            dropdownTrigger,
            triggerMode = "click",
            dropdownOrigin,
            classNames,
            triggerClassNames,
        },
        ref
    ) => {
        const box = useRef<HTMLDivElement>(null);
        const triggerRef = useRef<HTMLButtonElement>(null);
        const dropdownRef = useRef<HTMLDivElement>(null);

        const [isActive, setIsActive] = useState(false);
        const [showAbove, setShowAbove] = useState(false);
        const [alignRight, setAlignRight] = useState(false);
        const [triggerHeight, setTriggerHeight] = useState<number>(0);
        const [dropdownHeight, setDropdownHeight] = useState<number>(0);
        const timeoutRef = useRef<NodeJS.Timeout | null>(null);

        const handleClick = () => {
            setIsActive(prev => !prev);
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
            if (triggerRef.current && dropdownRef.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const dropdownRect = dropdownRef.current.getBoundingClientRect();

                // Stocker les hauteurs pour la position verticale
                setTriggerHeight(triggerRect.height);
                setDropdownHeight(dropdownRect.height);

                // Position verticale (au-dessus ou en dessous)
                const availableSpaceBelow = window.innerHeight - triggerRect.bottom;
                const availableSpaceAbove = triggerRect.top;

                setShowAbove(
                    availableSpaceBelow < dropdownRect.height &&
                        availableSpaceAbove > dropdownRect.height
                );

                // Position horizontale (gauche ou droite)
                const spaceOnRight = window.innerWidth - triggerRect.left - dropdownRect.width;
                const spaceOnLeft = triggerRect.right - dropdownRect.width;

                if (dropdownOrigin) {
                    setAlignRight(dropdownOrigin === "right");
                } else {
                    setAlignRight(spaceOnRight < 0 && spaceOnLeft > 0);
                }
            }
        }, [dropdownOrigin]);

        useEffect(() => {
            if (triggerMode === "click") {
                document.addEventListener("click", handleOutsideClick);
                return () => {
                    document.removeEventListener("click", handleOutsideClick);
                };
            }
        }, [handleOutsideClick, triggerMode]);

        useEffect(() => {
            if (isActive) {
                adjustDropdownPosition();
                window.addEventListener("resize", adjustDropdownPosition);
            } else {
                window.removeEventListener("resize", adjustDropdownPosition);
            }

            return () => {
                window.removeEventListener("resize", adjustDropdownPosition);
            };
        }, [isActive, adjustDropdownPosition]);

        const handleHoverEnter = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setIsActive(true);
        };

        const handleHoverLeave = () => {
            timeoutRef.current = setTimeout(() => {
                setIsActive(false);
            }, 150);
        };

        const eventHandlers =
            triggerMode === "hover"
                ? {
                      onMouseEnter: handleHoverEnter,
                      onMouseLeave: handleHoverLeave,
                  }
                : {};

        const triggerProps =
            triggerMode === "click"
                ? {
                      onClick: (e: React.MouseEvent) => {
                          e.preventDefault();
                          handleClick();
                      },
                  }
                : {};

        return (
            <div ref={box} className="relative inline-block" {...eventHandlers}>
                <button
                    ref={triggerRef}
                    type="button"
                    className={cn(
                        "focus:outline-none cursor-pointer transition-all",
                        {
                            "ring-2 ring-ring rounded-md ring-offset-1": isActive,
                        },
                        triggerClassNames
                    )}
                    {...triggerProps}
                >
                    {dropdownTrigger}
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
                        absolute z-50
                        ${alignRight ? "right-0" : "left-0"}
                        bg-background border border-border overflow-auto rounded-lg shadow-lg
                        ${classNames}
                    `}
                            >
                                {children}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);

export const DropdownItem = ({
    className,
    asChild = false,
    ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) => {
    const Comp = asChild ? Slot : "div";

    return (
        <Comp
            data-slot="dropdown-item"
            className={cn(
                "flex items-center p-2 gap-2 rounded-md hover:bg-accent hover:text-accent-foreground ",
                className
            )}
            {...props}
        >
            {props.children}
        </Comp>
    );
};
