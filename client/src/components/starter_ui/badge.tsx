import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
            },
            size: {
                sm: "h-5.5 px-2 py-0.5 gap-1 text-xs",
                md: "h-6 px-2.5 py-0.5 gap-1.5 text-sm",
                lg: "h-7 px-3 py-1 gap-1.5 text-sm",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "sm",
        },
    }
);

function Badge({
    className,
    variant,
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
                }),
                className
            )}
            {...props}
        />
    );
}

export default Badge;
