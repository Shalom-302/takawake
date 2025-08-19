import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
    `
    transition-all border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-transparent 
    rounded-lg flex items-center justify-between w-full focus:outline-none
    has-[input:disabled]:pointer-events-none has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-muted
    focus-within:border-input
    focus-within:ring focus-within:ring-ring
    has-[input[aria-invalid=true]]:border-destructive
    has-[input[aria-invalid=true]]:focus-within:ring
    has-[input[aria-invalid=true]]:focus-within:ring-destructive/20
    has-[input[aria-invalid=true]]:focus-within:border-destructive

    shadow-xs
    `,
    {
        variants: {
            variant: {
                default: "",
            },
            customSize: {
                sm: "h-10 py-2",
                md: "h-11 py-2",
            },
        },
        defaultVariants: {
            variant: "default",
            customSize: "sm",
        },
    }
);

function Input({
    className,
    variant,
    customSize,
    icon,
    centerContentInInput = false,
    ...props
}: React.ComponentProps<"input"> &
    VariantProps<typeof inputVariants> & {
        className?: string;
        centerContentInInput?: boolean;
        icon?: null | { position: "left" | "right"; icon: React.ReactNode };
    }) {
    return (
        <>
            <div
                className={cn(
                    inputVariants({ variant, customSize, className }),
                    {
                        "flex-row-reverse": icon && icon.position === "right",
                    },
                    "relative flex border border-input"
                )}
            >
                {icon && (
                    <div
                        className={cn(
                            "h-full text-primary/60 px-2 flex items-center justify-center shrink-0",
                            {
                                "left-0": icon.position === "left",
                                "right-0": icon.position === "right",
                            }
                        )}
                    >
                        {icon?.icon}
                    </div>
                )}
                <input
                    className={cn(
                        "h-full w-full focus:outline-none placeholder:text-sm",
                        `${
                            icon
                                ? icon && icon?.position === "left"
                                    ? "pr-3"
                                    : icon && icon?.position === "right"
                                      ? "pl-3"
                                      : ""
                                : "px-3"
                        }`,
                        {
                            "text-center": centerContentInInput,
                        }
                    )}
                    {...props}
                />
            </div>
        </>
    );
}

Input.displayName = "Input";

export { Input, inputVariants };
