import { cn } from "@/lib/utils/cn";

export function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
    return (
        <kbd
            data-slot="kbd"
            className={cn(
                "inline-flex w-fit rounded px-1 py-px font-body text-xs font-medium text-tertiary ring-1 ring-secondary ring-inset pointer-events-none select-none",
                "[&_svg:not([class*='size-'])]:size-4 [[aria-disableb=true]_&]:text-disabled",
                "[[data-slot=tooltip-content]_&]:bg-secondary-solid [[data-slot=tooltip-content]_&]:text-placeholder_subtle",
                className
            )}
            {...props}
        />
    );
}

export function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <kbd
            data-slot="kbd-group"
            className={cn("inline-flex items-center gap-1", className)}
            {...props}
        />
    );
}
