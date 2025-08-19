/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable react/display-name */
"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ModalProps = {
    isDialogActive: boolean;
    toggleDialog: Function;
    modalWidthValue?: number | string;
    isContentCentered?: boolean;
} & React.ComponentPropsWithRef<"div">;

export const Dialog = React.forwardRef<HTMLDivElement, ModalProps>(
    (
        { children, isDialogActive, toggleDialog, modalWidthValue = 260, isContentCentered = true }
    ) => {
        useEffect(() => {
            if (isDialogActive) {
                document.body.classList.add("no-scroll");
            } else {
                document.body.classList.remove("no-scroll");
            }

            return () => {
                document.body.classList.remove("no-scroll");
            };
        }, [isDialogActive]);

        return (
            <>
                <AnimatePresence>
                    {isDialogActive && (
                        <motion.div
                            className={`
                          ${isContentCentered ? "flex items-center justify-center" : ""} fixed p-3 sm:p-5  md:p-10 z-[1000] scrollbar-hide overflow-y-auto top-0 left-0 right-0 bottom-0 w-full h-full
                        `}
                        >
                            <motion.div
                                onClick={() => toggleDialog()}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={` 
                                    fixed z-[100] top-0 left-0 right-0 bottom-0
                                    bg-gradient-to-b from-primary/70 to-primary backdrop-blur-xs
                                `}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15, ease: "easeInOut" }}
                                className={` 
                                    z-[200] relative bg-primary-foreground rounded-2xl overflow-hidden
                                    w-full mx-auto
                                `}
                                style={{
                                    maxWidth: `${modalWidthValue}px`,
                                }}
                            >
                                <div className="">{children}</div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    }
);
