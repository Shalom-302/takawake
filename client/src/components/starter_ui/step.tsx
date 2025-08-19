/* eslint-disable react/display-name */
"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type StepProps = {
    activeStep: number;
    NumberOfStep: number;
    className?: string;
    direction?: "horizontal" | "vertical";
} & React.ComponentPropsWithRef<"div">;

export const Step = React.forwardRef<HTMLDivElement, StepProps>(
    ({ className, activeStep, NumberOfStep, direction = "horizontal" }) => {
        return (
            <>
                <div
                    className={cn(
                        {
                            "relative flex items-center justify-between before:content-[''] before:absolute before:w-full before:left-0 before:top-1/2 before:-translate-y-1/2 before:border-t-[0.5px] before:border-primary before:border-dashed":
                                direction === "horizontal",
                        },
                        {
                            "relative inline-flex justify-between flex-col  after:content-[''] after:absolute after:h-full after:left-1/2 after:top-0 after:-translate-x-1/2 after:border-l-[0.5px] after:border-primary after:border-dashed":
                                direction === "vertical",
                        },
                        className
                    )}
                >
                    {Array.from({ length: NumberOfStep })?.map((_, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                `
                                relative z-10 h-6 w-6 shrink-0 rounded-full flex items-center justify-center 
                                bg-white border border-primary
                                ring-2 ring-white
                            `,
                                {
                                    "bg-primary border-primary text-white":
                                        idx + 1 < activeStep,
                                },
                                {
                                    "bg-gray-100 text-primary/70":
                                        idx + 1 > activeStep,
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
