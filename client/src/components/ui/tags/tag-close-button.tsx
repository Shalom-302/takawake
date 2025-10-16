import { XClose } from "@untitled-ui/icons-react";
import { type TagSize } from ".";
import { cva } from "class-variance-authority";

const closeButtonVariants = cva(
    "flex cursor-pointer rounded-[3px] text-fg-quaternary outline-transparent transition duration-100 ease-linear hover:bg-primary_hover hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            size: {
                sm: "p-0.5",
                md: "p-0.5",
                lg: "p-0.75",
            },
        },
        defaultVariants: {
            size: "sm",
        },
    }
);

const closeIconVariants = cva("transition-inherit-all", {
    variants: {
        size: {
            sm: "size-2.5",
            md: "size-3",
            lg: "size-3.5",
        },
    },
    defaultVariants: {
        size: "sm",
    },
});

export const TagCloseButton = ({
    size,
    onClose,
    isDisabled,
}: {
    size: TagSize;
    onClose: () => void;
    isDisabled?: boolean;
}) => (
    <button
        type="button"
        aria-label="Remove this tag"
        onClick={onClose}
        disabled={isDisabled}
        className={closeButtonVariants({ size })}
    >
        <XClose className={closeIconVariants({ size })} strokeWidth="3" />
    </button>
);
