import { Check } from "@untitled-ui/icons-react";
import { cva } from "class-variance-authority";
import { type TagSize } from ".";

const checkboxVariants = cva(
    "flex cursor-pointer appearance-none items-center justify-center rounded bg-primary ring-1 ring-primary ring-inset transition-all",
    {
        variants: {
            size: {
                sm: "size-3.5",
                md: "size-4",
                lg: "size-4.5",
            },
            isSelected: {
                true: "bg-brand-solid ring-brand-solid",
                false: "",
            },
            isDisabled: {
                true: "cursor-not-allowed bg-disabled_subtle ring-disabled",
                false: "",
            },
        },
        defaultVariants: {
            size: "sm",
            isSelected: false,
            isDisabled: false,
        },
    }
);

const checkIconVariants = cva("absolute text-fg-white opacity-0 transition-opacity", {
    variants: {
        size: {
            sm: "size-2.5",
            md: "size-3",
            lg: "size-3.5",
        },
        isSelected: {
            true: "opacity-100",
            false: "",
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

export const TagCheckbox = ({
    size,
    isSelected,
    isDisabled,
}: {
    size: TagSize;
    isSelected: boolean;
    isDisabled?: boolean;
}) => (
    <div className={checkboxVariants({ size, isSelected, isDisabled })}>
        <Check
            aria-hidden="true"
            className={checkIconVariants({ size, isSelected, isDisabled })}
            strokeWidth="2"
        />
    </div>
);
