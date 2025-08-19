"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { UserThreeIcon } from "../icons";
import { cn } from "@/lib/utils/cn";

interface AvatarProps {
    children: React.ReactNode;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    className?: string;
}

interface AvatarImageProps {
    src: string;
    alt: string;
    avatarFallback: string;
    showIcon?: boolean;
    className?: string;
}

const Avatar = ({ children, size = "md", className }: AvatarProps) => {
    const avatarClass = clsx(
        "relative inline-block shrink-0 font-semibold text-primary-foreground shrink-0 rounded-lg overflow-hidden bg-primary ",
        {
            "h-6 w-6 text-xs": size === "xs",
            "h-8 w-8 text-sm": size === "sm",
            "h-10 w-10 text-sm": size === "md",
            "h-12 w-12 text-sm": size === "lg",
            "h-14 w-14 text-base": size === "xl",
            "h-16 w-16 text-base": size === "2xl",
        },
        className
    );
    return <div className={avatarClass}>{children}</div>;
};

const AvatarImage = ({
    src,
    alt,
    avatarFallback,
    showIcon = false,
    className,
}: AvatarImageProps) => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            setLoaded(true);
        };
        img.onerror = () => {
            setLoaded(false);
        };
    }, [src]);

    return (
        <>
            {loaded ? (
                <motion.img
                    src={src}
                    alt={alt}
                    className={`object-cover h-full w-full`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: loaded ? 1 : 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                />
            ) : showIcon ? (
                <motion.div
                    className={cn(
                        "w-full h-full flex items-center justify-center uppercase",
                        className
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <UserThreeIcon size={20} />
                </motion.div>
            ) : (
                <motion.div
                    className={cn(
                        "w-full h-full flex items-center justify-center uppercase",
                        className
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <span className="">{avatarFallback}</span>
                </motion.div>
            )}
        </>
    );
};

export { Avatar, AvatarImage };
