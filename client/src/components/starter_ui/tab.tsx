/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface TabsProps {
    defaultValue: string;
    children: React.ReactNode;
    className?: string;
    display?: "vertical" | "horizontal";
}

interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}

interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

const Tabs: React.FC<TabsProps> = ({
    defaultValue,
    children,
    display = "horizontal",
    className,
}) => {
    const [activeTab, setActiveTab] = useState(defaultValue);
    const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0, height: 0, top: 0 });
    const tabsRef = useRef<HTMLDivElement | null>(null);

    const onTriggerClick = (value: string, triggerElement: HTMLButtonElement) => {
        setActiveTab(value);
        const { offsetWidth, offsetLeft, offsetHeight, offsetTop } = triggerElement;
        setIndicatorStyle({
            width: offsetWidth,
            left: offsetLeft,
            height: offsetHeight,
            top: offsetTop,
        });
    };

    useEffect(() => {
        const activeTrigger = tabsRef.current?.querySelector(
            `button[data-value='${defaultValue}']`
        ) as HTMLButtonElement;
        if (activeTrigger) {
            const { offsetWidth, offsetLeft, offsetHeight, offsetTop } = activeTrigger;
            setIndicatorStyle({
                width: offsetWidth,
                left: offsetLeft,
                height: offsetHeight,
                top: offsetTop,
            });
        }
    }, [defaultValue]);

    return (
        <div
            className={cn(
                "flex",
                {
                    "flex-col": display === "horizontal",
                    "flex-row": display === "vertical",
                },
                className
            )}
        >
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, {
                        activeTab,
                        onTriggerClick,
                        indicatorStyle,
                        tabsRef,
                        display,
                    });
                }
                return child;
            })}
        </div>
    );
};

const TabsList: React.FC<
    TabsListProps & {
        activeTab?: string;
        onTriggerClick?: (value: string, element: HTMLButtonElement) => void;
        indicatorStyle?: { width: number; left: number; height: number; top: number };
        tabsRef?: React.RefObject<HTMLDivElement>;
        display?: "horizontal" | "vertical";
    }
> = ({ children, className, display, activeTab, onTriggerClick, indicatorStyle, tabsRef }) => {
    return (
        <div
            ref={tabsRef}
            className={cn(
                "relative flex bg-primary/5 rounded-lg",
                {
                    "flex-col items-start": display === "vertical",
                },
                className
            )}
        >
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, {
                        activeTab,
                        onTriggerClick,
                    });
                }
                return child;
            })}
            <motion.div
                className={cn(
                    "absolute bottom-0 bg-white border border-primary shadow-xs rounded-lg",
                    {
                        "h-full": display === "horizontal",
                        "w-full": display === "vertical",
                    }
                )}
                animate={
                    display === "vertical"
                        ? { height: indicatorStyle?.height, top: indicatorStyle?.top }
                        : { width: indicatorStyle?.width, left: indicatorStyle?.left }
                }
                transition={{ duration: 0.3, ease: "easeInOut" }}
            />
        </div>
    );
};

TabsList.displayName = "TabsList";

const TabsTrigger: React.FC<
    TabsTriggerProps & {
        activeTab?: string;
        onTriggerClick?: (value: string, element: HTMLButtonElement) => void;
    }
> = ({ value, children, className, activeTab, onTriggerClick }) => {
    const isActive = activeTab === value;
    return (
        <button
            data-value={value}
            onClick={e => onTriggerClick?.(value, e.currentTarget)}
            className={cn(
                "px-4 py-2 relative z-30 text-sm font-semibold transition-all cursor-pointer",
                isActive ? "text-primary" : "duration-300 text-primary/60",
                className
            )}
        >
            {children}
        </button>
    );
};

const TabsContent: React.FC<TabsContentProps & { activeTab?: string }> = ({
    value,
    children,
    className,
    activeTab,
}) => {
    if (activeTab !== value) return null;
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={value}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.3, ease: "easeIn" }}
                className={cn(className)}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
