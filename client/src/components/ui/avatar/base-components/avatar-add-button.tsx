import { cn } from "@/lib/utils/cn";
import { Tooltip } from "../../tooltip";
import { Plus } from "@untitled-ui/icons-react";

interface AvatarAddButtonProps {
    size: "xs" | "sm" | "md";
    title?: string;
    className?: string;
}
const sizes = {
    xs: { button: "size-6", icon: "size-4" },
    sm: { button: "size-8", icon: "size-4" },
    md: { button: "size-10", icon: "size-5" },
};

export function AvatarAddButton({ size, className, title = "Add user" }: AvatarAddButtonProps) {
    return (
        <Tooltip
            trigger={
                <button
                    className={cn(
                        "flex cursor-pointer items-center justify-center rounded-full border border-dashed border-primary bg-primary text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2 disabled:border-gray-200 disabled:bg-secondary disabled:text-gray-200",
                        sizes[size].button,
                        className
                    )}
                    aria-label={title}
                >
                    <Plus className={cn("text-current transition-inherit-all", sizes[size].icon)} />
                </button>
            }
            title={title}
        />
    );
}
