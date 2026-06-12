import { XClose } from "@untitled-ui/icons-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

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

interface TagCloseButtonProps
    extends Omit<React.ComponentPropsWithoutRef<"button">, "onClick">,
        VariantProps<typeof closeButtonVariants> {
    size: "sm" | "md" | "lg";
    onClose: (e: React.MouseEvent<HTMLButtonElement>) => void;
    isDisabled?: boolean;
    className?: string;
    iconClassName?: string;
    ariaLabel?: string;
}

export const TagCloseButton = ({
    size,
    onClose,
    isDisabled,
    className,
    iconClassName,
    ariaLabel = "Remove this tag",
    ...props
}: TagCloseButtonProps) => (
    <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClose}
        disabled={isDisabled}
        className={cn(closeButtonVariants({ size }), className)}
        {...props}
    >
        <XClose className={cn(closeIconVariants({ size }), iconClassName)} strokeWidth={3} />
    </button>
);
