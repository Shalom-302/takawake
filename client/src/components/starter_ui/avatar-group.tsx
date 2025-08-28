"use client";

import clsx from "clsx";
import { AvatarImage } from "./avatar";
import { cn } from "@/lib/utils/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface ListProps {
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    variant?: "independant";
    maxVisible?: number;
    data: {
        src: string;
        alt: string;
        avatarFallback: string;
        name?: string;
    }[];
}

const AvatarGroup = ({ size = "md", maxVisible = 4, variant = "independant", data }: ListProps) => {
    const avatarClass = clsx(
        "relative inline-flex items-center justify-center rounded-full text-primary overflow-hidden bg-primary-foreground font-semibold",
        {
            "h-6 w-6 text-xs": size === "xs",
            "h-8 w-8 text-xs": size === "sm",
            "h-10 w-10 text-sm": size === "md",
            "h-12 w-12 text-sm": size === "lg",
            "h-14 w-14 text-sm": size === "xl",
            "h-16 w-16 text-sm": size === "2xl",
        }
    );

    return (
        <div
            className={clsx("inline-flex items-center", {
                "-space-x-3": size === "xs",
                "-space-x-4": size === "sm",
                "-space-x-5": size === "md",
                "-space-x-6": size === "lg",
                "-space-x-7": size === "xl",
                "-space-x-8": size === "2xl",
            })}
        >
            <div
                className={clsx("inline-flex items-center", {
                    "-space-x-2": size === "xs",
                    "-space-x-3": size === "sm",
                    "-space-x-4": size === "md",
                    "-space-x-5": size === "lg",
                    "-space-x-6": size === "xl",
                    "-space-x-7": size === "2xl",
                })}
            >
                {data?.slice(0, maxVisible)?.map(
                    (
                        item: {
                            src: string;
                            alt: string;
                            avatarFallback: string;
                            name?: string;
                        },
                        idx: number
                    ) => (
                        <div
                            key={idx}
                            className={clsx(avatarClass, "border border-primary-foreground", {
                                "ring-2 ring-primary ": variant === "independant",
                            })}
                        >
                            {item?.name ? (
                                <Tooltip>
                                    <TooltipTrigger className=" ">
                                        <AvatarImage
                                            src={item?.src}
                                            alt={item?.alt}
                                            avatarFallback={item?.avatarFallback}
                                            showIcon
                                            className=""
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <span className="text-xs font-medium">{item?.name}</span>
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <AvatarImage
                                    src={item?.src}
                                    alt={item?.alt}
                                    avatarFallback={item?.avatarFallback}
                                    showIcon
                                    className=""
                                />
                            )}
                        </div>
                    )
                )}
            </div>
            {data.length - maxVisible > 0 && (
                <div
                    className={cn(
                        "ring-2 ring-primary border border-primary-foreground",
                        avatarClass,
                        "bg-gray-200"
                    )}
                >
                    <span className="">{`+${data.length - maxVisible}`}</span>
                </div>
            )}
        </div>
    );
};

export default AvatarGroup;
