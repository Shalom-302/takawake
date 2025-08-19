/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { easeInOut } from "framer-motion"; // ✅ correction ici

type LoaderSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<LoaderSize, { container: string; dot: string; translate: number }> = {
    sm: { container: "w-8 h-8", dot: "w-1 h-1", translate: 10 },
    md: { container: "w-12 h-12", dot: "w-1.5 h-1.5", translate: 16 },
    lg: { container: "w-14 h-14", dot: "w-[6px] h-[6px]", translate: 20 },
    xl: { container: "w-16 h-16", dot: "w-2 h-2", translate: 24 },
};

// ✅ Typage correct pour circleVariants avec fonction dynamique
const circleVariants = {
    animate: (i: number): any => ({
        opacity: [1, 0.2],
        transition: {
            repeat: Infinity,
            duration: 1.6,
            ease: easeInOut,
            delay: i * 0.15,
        },
    }),
};

export default function LoadingIndicator({
    size = "md",
    label = "Chargement...",
}: {
    size?: LoaderSize;
    label?: string;
}) {
    const { container, dot, translate } = sizeMap[size];

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`relative ${container}`}>
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        custom={i}
                        variants={circleVariants}
                        animate="animate"
                        className={`absolute rounded-full bg-primary ${dot}`}
                        style={{
                            top: "50%",
                            left: "50%",
                            transform: `rotate(${i * 30}deg) translate(${translate}px)`,
                            transformOrigin: "center",
                        }}
                    />
                ))}
            </div>
            <p className="text-sm font-medium text-primary">{label}</p>
        </div>
    );
}
