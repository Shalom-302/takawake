"use client";

import React, { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface AccordionProps {
    children: React.ReactNode;
    className?: string;
    closeOthers?: boolean; // New prop to specify if other items should close
}

interface AccordionItemProps {
    value: string;
    children: React.ReactNode;
}

interface AccordionTriggerProps {
    children: React.ReactNode;
    className?: string;
    value: string;
    icon?: React.ReactNode;
}

interface AccordionContentProps {
    children: React.ReactNode;
    className?: string;
    value: string;
}

interface AccordionContextType {
    openItems: string[];
    toggleItem: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

const Accordion: React.FC<AccordionProps> = ({ children, className, closeOthers = false }) => {
    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleItem = (value: string) => {
        setOpenItems(prev => {
            if (prev.includes(value)) {
                return prev.filter(item => item !== value);
            } else {
                return closeOthers ? [value] : [...prev, value];
            }
        });
    };

    return (
        <AccordionContext.Provider value={{ openItems, toggleItem }}>
            <div className={cn("accordion", className)}>{children}</div>
        </AccordionContext.Provider>
    );
};

const AccordionItem: React.FC<AccordionItemProps> = ({ value, children }) => {
    return (
        <div
            className=" border-b border-[var(--border-tertiary)] overflow-hidden"
            data-value={value}
        >
            {children}
        </div>
    );
};

const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
    value,
    children,
    icon,
    className,
}) => {
    const { toggleItem, openItems } = useContext(AccordionContext)!;

    const isOpen = openItems.includes(value);

    return (
        <button
            className={cn(
                " w-full flex items-center justify-between gap-4 py-2 cursor-pointer",
                className
            )}
            onClick={() => toggleItem(value)}
            aria-expanded={isOpen}
        >
            {children}
            <motion.span
                className="text-[var(--text-secondary)]"
                initial={{ rotate: 0 }}
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
            >
                {icon || <DefaultChevronIcon />}
            </motion.span>
        </button>
    );
};

const AccordionContent: React.FC<AccordionContentProps> = ({ value, children, className }) => {
    const { openItems } = useContext(AccordionContext)!;

    const isOpen = openItems.includes(value);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={cn("", className)}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    <div className="py-4">{children}</div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const DefaultChevronIcon: React.FC = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-4 h-4"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
