import { cn } from "@/lib/utils/cn";
import { Avatar, AvatarProps } from "./avatar";

interface AvatarGroupProps {
    max?: number;
    items: Omit<AvatarProps, "size">[];
    size?: AvatarProps["size"];
    className?: string;
    avatarClassName?: string;
}

export function AvatarGroup({
    size,
    items = [],
    max = 3,
    className,
    avatarClassName,
}: AvatarGroupProps) {
    return (
        <div className={cn("flex -space-x-2", className)}>
            {items.slice(0, max).map((item, index) => (
                <Avatar
                    key={index}
                    size={size}
                    src={item.src}
                    alt={item.alt}
                    initials={item.initials}
                    placeholder={item.placeholder}
                    className={cn("ring-[1.5px] ring-bg-primary", avatarClassName)}
                />
            ))}
            {items.length > max && (
                <Avatar
                    size={size}
                    className="ring-[1.5px] ring-bg-primary"
                    placeholder={
                        <span className="flex items-center justify-center text-sm font-semibold text-quaternary">
                            +{items.length - max}
                        </span>
                    }
                />
            )}
        </div>
    );
}
