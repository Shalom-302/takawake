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
                color: "box-border border rounded-md",
                modern: "box-border border rounded-md text-[var(--text-secondary)]! bg-primary! border-primary!",
            },
            size: {
                sm: "h-5.5 px-2 py-0.5 gap-1 text-xs",
                md: "h-6 px-2.5 py-0.5 gap-1.5 text-sm",
                lg: "h-7 px-3 py-1 gap-1.5 text-sm",
            },
            color: {
                gray: "bg-utility-gray-50 text-utility-gray-700 ring-utility-gray-200 ",
                brand: "bg-utility-brand-50 text-utility-brand-700 ring-utility-brand-200",
                error: "bg-utility-error-50 text-utility-error-700 ring-utility-error-200",
                warning: "bg-utility-warning-50 text-utility-warning-700 ring-utility-warning-200",
                success: "bg-utility-success-50 text-utility-success-700 ring-utility-success-200",
                "gray-blue":
                    "bg-utility-gray-blue-50 text-utility-gray-blue-700 ring-utility-gray-blue-200",
                "blue-light":
                    "bg-utility-blue-light-50 text-utility-blue-light-700 ring-utility-blue-light-200",
                blue: "bg-utility-blue-50 text-utility-blue-700 ring-utility-blue-200",
                indigo: "bg-utility-indigo-50 text-utility-indigo-700 ring-utility-indigo-200",
                purple: "bg-utility-purple-50 text-utility-purple-700 ring-utility-purple-200",
                pink: "bg-utility-pink-50 text-utility-pink-700 ring-utility-pink-200",
                orange: "bg-utility-orange-50 text-utility-orange-700 ring-utility-orange-200",
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
                    ...(variant !== "modern" && { color }),
                }),
                className
            )}
            {...props}
        />
    );
}
export type BadgeVariants = VariantProps<typeof badgeVariants>;

export { Badge, badgeVariants };
