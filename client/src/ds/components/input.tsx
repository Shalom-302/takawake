/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { BaseInput as ShadcnInput } from "@/components/ui/input";
import { Tooltip } from "./tooltip";
import { AlertCircleIcon } from "@/components/icons";
// import { Dropdown } from "./dropdown";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useRef, useState } from "react";

// --- util pour fusionner les refs (externe + interne) ---
function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
    return (node: T) => {
        refs.forEach(ref => {
            if (!ref) return;
            if (typeof ref === "function") ref(node);
            else (ref as React.MutableRefObject<T | null>).current = node;
        });
    };
}

const inputVariants = cva(
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex items-center min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    {
        variants: {
            variant: {
                default:
                    "dark:bg-input/30 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
                success:
                    "border-green-500 focus-within:border-green-500 focus-within:ring-green-500/50 focus-within:ring-[3px]",
                warning:
                    "border-yellow-500 focus-within:border-yellow-500 focus-within:ring-yellow-500/50 focus-within:ring-[3px]",
                error: "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/50 focus-within:ring-[3px]",
                info: "border-blue-500 focus-within:border-blue-500 focus-within:ring-blue-500/50 focus-within:ring-[3px]",
            },
            size: {
                default: "h-9",
                sm: "h-7 text-xs px-2 py-0.5",
                lg: "h-11 text-lg px-4 py-2",
            },
            rounded: {
                default: "rounded-md",
                full: "rounded-full",
                none: "rounded-none",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            rounded: "default",
        },
    }
);

export interface InputProps
    extends Omit<React.ComponentPropsWithoutRef<typeof ShadcnInput>, "size">,
        VariantProps<typeof inputVariants> {
    icon?: null | { position: "left" | "right"; icon: React.ReactNode };
    info?: null | { position: "left" | "right"; description?: string };
    dropdownInfo?: null | { position: "left" | "right"; trigger?: React.ReactNode; items: any[] };
    clipboard?: boolean;
    prefixedInput?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            variant,
            size,
            rounded,
            icon,
            info,
            dropdownInfo,
            clipboard,
            prefixedInput,
            ...props
        },
        ref
    ) => {
        const [copied, setCopied] = useState(false);
        const inputRef = useRef<HTMLInputElement>(null); // <-- ref interne

        const handleCopy = async () => {
            if (props.disabled) return; // respect du disabled
            const text = inputRef.current?.value ?? ""; // <-- valeur courante
            if (!text) return;
            try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (e) {
                console.error("Clipboard error:", e);
            }
        };

        return (
            <div className={cn(clipboard || prefixedInput ? "flex items-stretch" : "")}>
                {/* prefixedInput label */}
                {prefixedInput && (
                    <div
                        className={cn(
                            inputVariants({ size, rounded }),
                            "!rounded-r-none shadow-none !border-r-0 flex items-center gap-[4px] px-[14px] shrink-0"
                        )}
                    >
                        <span className="text-sm font-normal text-muted-foreground">
                            {prefixedInput}
                        </span>
                    </div>
                )}

                <div
                    className={cn(
                        inputVariants({ variant, size, rounded }),
                        {
                            "flex-row-reverse":
                                (icon && icon.position === "right") ||
                                (info && info.position === "left") ||
                                (dropdownInfo && dropdownInfo.position === "left"),
                        },
                        {
                            "!rounded-r-none shadow-none border-r": clipboard,
                        },
                        {
                            "!rounded-l-none shadow-none border-l": prefixedInput,
                        },
                        className
                    )}
                >
                    {/* Simple Icon */}
                    {icon && (
                        <div
                            className={cn(
                                "h-full text-muted-foreground flex items-center justify-center shrink-0",
                                {
                                    "mr-[8px]": icon.position === "left",
                                    "ml-[8px]": icon.position === "right",
                                }
                            )}
                        >
                            {icon?.icon}
                        </div>
                    )}

                    {/* input */}
                    <input
                        className={cn("h-full w-full focus:outline border-0")}
                        ref={composeRefs(ref, inputRef)}
                        data-slot="input"
                        {...props}
                    />

                    {/* Tooltip */}
                    {info && (
                        <div
                            className={cn("h-full flex items-center", {
                                "mr-[8px]": info.position === "left",
                                "ml-[8px]": info.position === "right",
                            })}
                        >
                            <Tooltip content={info.description}>
                                <div className="text-muted-foreground">
                                    <AlertCircleIcon size={16} />
                                </div>
                            </Tooltip>
                        </div>
                    )}

                    {/* with selected options */}
                    {dropdownInfo && (
                        <div
                            className={cn("h-full flex items-center", {
                                "mr-[8px]": dropdownInfo.position === "left",
                                "ml-[8px]": dropdownInfo.position === "right",
                            })}
                        >
                            {/* <Dropdown
                                trigger={dropdownInfo.trigger}
                                items={dropdownInfo.items}
                                size="auto"
                                align={dropdownInfo.position === "left" ? "start" : "end"}
                            /> */}
                        </div>
                    )}
                </div>

                {/* Clipboard action */}
                {clipboard && (
                    <div
                        className={cn(
                            inputVariants({ size, rounded }),
                            "!rounded-l-none shadow-none border !border-l-0 flex items-center gap-[4px] px-[14px] cursor-pointer shrink-0"
                        )}
                        onClick={handleCopy}
                    >
                        {copied ? (
                            <CheckIcon className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                            <CopyIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <h2 className="text-sm font-semibold">Copy</h2>
                    </div>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
