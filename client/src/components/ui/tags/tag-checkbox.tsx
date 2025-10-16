import { Check } from "@untitled-ui/icons-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import * as React from "react";

// ============================================================================
// CVA Variants
// ============================================================================

const checkboxVariants = cva(
    "relative flex appearance-none items-center justify-center rounded ring-1 ring-inset transition-all",
    {
        variants: {
            size: {
                sm: "size-3.5",
                md: "size-4",
                lg: "size-4.5",
            },
            isSelected: {
                true: "bg-brand-solid ring-brand-solid",
                false: "bg-primary ring-primary",
            },
            isDisabled: {
                true: "cursor-not-allowed bg-disabled_subtle ring-disabled",
                false: "cursor-pointer",
            },
            isFocused: {
                true: "outline-2 outline-offset-2 outline-focus-ring",
                false: "",
            },
        },
        defaultVariants: {
            size: "sm",
            isSelected: false,
            isDisabled: false,
            isFocused: false,
        },
    }
);

const checkIconVariants = cva("absolute opacity-0 transition-opacity", {
    variants: {
        size: {
            sm: "size-2.5",
            md: "size-3",
            lg: "size-3.5",
        },
        isSelected: {
            true: "opacity-100 text-fg-white",
            false: "text-fg-white",
        },
        isDisabled: {
            true: "text-fg-disabled_subtle",
            false: "",
        },
    },
    defaultVariants: {
        size: "sm",
        isSelected: false,
        isDisabled: false,
    },
});

// ============================================================================
// Props & Composant
// ============================================================================

interface TagCheckboxProps extends VariantProps<typeof checkboxVariants> {
    size: "sm" | "md" | "lg";
    isSelected: boolean;
    isDisabled?: boolean;
    isFocused?: boolean;
    className?: string;
    iconClassName?: string;
}

export const TagCheckbox = ({
    size,
    isSelected,
    isDisabled,
    isFocused,
    className,
    iconClassName,
}: TagCheckboxProps) => (
    <div className={cn(checkboxVariants({ size, isSelected, isDisabled, isFocused }), className)}>
        <Check
            aria-hidden="true"
            className={cn(checkIconVariants({ size, isSelected, isDisabled }), iconClassName)}
            strokeWidth="2"
        />
    </div>
);
