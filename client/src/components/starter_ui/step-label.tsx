/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type StepProps = {
    activeStep: number;
    className?: string;
    steps: {
        id: number;
        label: string;
    }[];
    direction?: "horizontal" | "vertical";
} & React.ComponentPropsWithRef<"div">;

export const StepLabel = React.forwardRef<HTMLDivElement, StepProps>(
    ({ className, activeStep, steps, direction = "horizontal" }) => {
        return (
            <>
                <div
                    className={cn(
                        {
                            "relative flex gap-4 items-start justify-between before:content-[''] before:absolute before:w-full before:top-3 before:border-t-[0.5px] before:border-primary before:border-dashed":
                                direction === "horizontal",
                        },
                        {
                            "relative inline-flex justify-between flex-col gap-4 after:content-[''] after:absolute after:h-full after:left-3 after:top-0 after:border-l-[0.5px] after:border-primary after:border-dashed":
                                direction === "vertical",
                        },
                        className
                    )}
                >
                    {steps?.map((item: any, idx: number) => (
                        <div
                            key={item?.id}
                            className={cn(
                                "flex-1",
                                {
                                    "flex items-center gap-2":
                                        item?.label &&
                                        item?.label.trim().length > 0 &&
                                        direction === "vertical",
                                },
                                {
                                    "flex flex-col items-start gap-2":
                                        item?.label &&
                                        item?.label.trim().length > 0 &&
                                        direction === "horizontal",
                                }
                            )}
                        >
                            <div
                                className={cn(
                                    `
                                        relative z-10 h-6 w-6 shrink-0 rounded-full flex items-center justify-center 
                                        bg-white border border-primary
                                        ring-2 ring-white
                                    `,
                                    {
                                        "bg-primary border-primary text-[var(--fg-white)]":
                                            idx + 1 < activeStep,
                                    },
                                    {
                                        "bg-gray-100 text-primary/70": idx + 1 > activeStep,
                                    }
                                )}
                            >
                                {idx + 1 < activeStep ? (
                                    <>
                                        <AnimateCheck />
                                    </>
                                ) : (
                                    <span className="text-xs">{idx + 1}</span>
                                )}
                            </div>
                            {item?.label && item?.label.trim().length > 0 && (
                                <span
                                    className={cn(
                                        "block text-[var(--text-secondary)] text-sm font-[600] ",
                                        {
                                            " text-[var(--text-placeholder_subtle)]":
                                                idx + 1 > activeStep,
                                        }
                                    )}
                                >
                                    {item?.label}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </>
        );
    }
);

const AnimateCheck = () => {
    return (
        <AnimatePresence mode="wait">
            <motion.svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <motion.path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, pathOffset: 1 }}
                    animate={{ pathLength: 1, pathOffset: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                />
            </motion.svg>
        </AnimatePresence>
    );
};
