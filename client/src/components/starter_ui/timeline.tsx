/* eslint-disable react/display-name */
"use client";
import React, { JSX } from "react";
import { cn } from "@/lib/utils/cn";

type TimelineProps = {
    datas: {
        id: number;
        illustration: JSX.Element;
        content: JSX.Element;
    }[];
    className?: string;
    itemClassName?: string;
    illustrationClassName?: string;
    direction?: "horizontal" | "vertical";
} & React.ComponentPropsWithRef<"div">;

export const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
    ({ className, itemClassName, illustrationClassName, datas, direction = "horizontal" }) => {
        return (
            <>
                <div
                    className={cn(
                        "",
                        {
                            "mt-6 relative flex items-start justify-between gap-3 w-full border-t-[0.5px] border-primary border-dashed":
                                direction === "horizontal",
                        },
                        {
                            "ml-6 relative inline-flex justify-between gap-6 flex-col w-full border-l-[0.5px] border-primary border-dashed":
                                direction === "vertical",
                        },
                        className
                    )}
                >
                    {datas?.map((el, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex flex-row w-full",
                                { "flex-col gap-3 -mt-6": direction === "horizontal" },
                                { "gap-3 -ml-6": direction === "vertical" },
                                itemClassName
                            )}
                        >
                            <div
                                className={cn(
                                    `
                                    relative z-10 h-12 w-12 shrink-0  flex items-center justify-center 
                                `,
                                    illustrationClassName
                                )}
                            >
                                {el?.illustration}
                            </div>
                            <div>{el?.content}</div>
                        </div>
                    ))}
                </div>
            </>
        );
    }
);
