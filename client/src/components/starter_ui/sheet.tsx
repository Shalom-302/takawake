"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ReactNode, useEffect } from "react";
import clsx from "clsx";

type SheetProps = {
    side?: "left" | "right";
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    width?: string;
};

// ✅ Fonction typée correctement
const getSheetVariants = (side: "left" | "right"): Variants => {
    const slideX = side === "right" ? "100%" : "-100%";

    return {
        hidden: {
            x: slideX,
        },
        visible: {
            x: 0,
            transition: {
                type: "tween" as const,
                duration: 0.3,
            },
        },
        exit: {
            x: slideX,
            transition: {
                type: "tween" as const,
                duration: 0.2,
            },
        },
    };
};

export function Sheet({
    side = "right",
    isOpen,
    onClose,
    children,
    width = "w-[80vw] max-w-sm",
}: SheetProps) {
    const sheetVariants = getSheetVariants(side);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }

        return () => {
            document.body.classList.remove("no-scroll");
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="fixed inset-0 bg-gradient-to-b from-primary/70 to-primary backdrop-blur-xs z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Sheet panel */}
                    <motion.div
                        className={clsx(
                            "fixed top-0 bottom-0 bg-primary-foreground z-50 shadow-xl",
                            width,
                            side === "right" ? "right-0" : "left-0"
                        )}
                        variants={sheetVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
