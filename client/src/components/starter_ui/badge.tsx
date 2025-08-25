import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center justify-center font-medium w-fit whitespace-nowrap shrink-0  transition-[color,box-shadow] overflow-hidden",
    {
        variants: {
            variant: {
                "pill-color": "box-border border rounded-full",
                "badge-color": "box-border border rounded-md",
                "badge-modern":
                    "box-border border rounded-md text-[var(--text-secondary)]! bg-primary! border-primary!",
            },
            size: {
                sm: "h-5.5 px-2 py-0.5 gap-1 text-xs",
                md: "h-6 px-2.5 py-0.5 gap-1.5 text-sm",
                lg: "h-7 px-3 py-1 gap-1.5 text-sm",
            },
            color: {
                gray: "bg-utility-neutral-100 border-utility-neutral-200 text-utility-neutral-700 ",
                brand: "bg-utility-primary-200 border-utility-primary-300 text-utility-primary-700",
                error: "bg-utility-error-200 border-utility-error-300 text-utility-error-700",
                warning:
                    "bg-utility-warning-200 border-utility-warning-300 text-utility-warning-700",
                success:
                    "bg-utility-success-200 border-utility-success-300 text-utility-success-700",
                "gray-blue":
                    "bg-utility-shandy-200 border-utility-shandy-300 text-utility-shandy-700",
                "blue-light":
                    "bg-utility-deepmauve-200 border-utility-deepmauve-300 text-utility-deepmauve-700",
                blue: "bg-utility-information-200 border-utility-information-300 text-utility-information-700",
            },
        },
        defaultVariants: {
            variant: "pill-color",
            size: "sm",
            color: "gray",
        },
    }
);

function Badge({
    className,
    variant,
    color,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : "span";

    return (
        <Comp
            data-slot="badge"
            className={cn(
                badgeVariants({
                    variant,
                    size,
                    ...(variant !== "badge-modern" && { color }),
                }),
                className
            )}
            {...props}
        />
    );
}

export { Badge };
