/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils/cn";
import * as React from "react";
import Button from "./button";
import { XCloseIcon } from "../icons";

type AlertProps = {
    className?: string;
    type: "success" | "error" | "warning";
    icon?: React.ReactNode | null;
    title: string;
    desc: string;
    action: any;
} & React.ComponentPropsWithRef<"div">;

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    ({ className, type, icon = null, title, desc, action }) => {
        return (
            <>
                <div
                    className={cn(
                        "min-w-[300px] rounded-xl shadow-xs",
                        { "bg-[var(--bg-error-secondary)]": type === "error" },
                        { "bg-[var(--bg-warning-secondary)]": type === "warning" },
                        { "bg-[var(--bg-success-secondary)]": type === "success" },
                        className
                    )}
                >
                    <div className="flex items-start justify-between gap-4 py-4 px-4 pr-2">
                        <div className="flex items-start gap-2">
                            {icon && (
                                <div className="h-8 w-8 shrink-0 flex items-center justify-center">
                                    {icon}
                                </div>
                            )}
                            <div className="">
                                <span
                                    className={cn("text-sm font-semibold ", {
                                        "text-[var(--text-secondary)]":
                                            type === "error" ||
                                            type === "warning" ||
                                            type === "success",
                                    })}
                                >
                                    {title}
                                </span>
                                <p
                                    className={cn("text-sm mt-1", {
                                        "text-[var(--text-tertiary)]":
                                            type === "error" ||
                                            type === "warning" ||
                                            type === "success",
                                    })}
                                >
                                    {desc}
                                </p>
                            </div>
                        </div>
                        <Button
                            size={"icon-sm"}
                            variant={"tertiary"}
                            className={cn(
                                "border-none shadow-none",
                                {
                                    "bg-[var(--bg-error-secondary)] sm:hover:bg-[var(--bg-error-secondary)]":
                                        type === "error",
                                },
                                {
                                    "bg-[var(--bg-warning-secondary)] sm:hover:bg-[var(--bg-warning-secondary)]":
                                        type === "warning",
                                },
                                {
                                    "bg-[var(--bg-success-secondary)] sm:hover:bg-[var(--bg-success-secondary)]":
                                        type === "success",
                                }
                            )}
                            onClick={action}
                        >
                            <XCloseIcon size={20} />
                        </Button>
                    </div>
                </div>
            </>
        );
    }
);
Alert.displayName = "Alert";

export { Alert };
