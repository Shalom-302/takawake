"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

// Variants pour DropdownMenu.Content
export const dropdownContentVariants = cva("", {
    variants: {
        size: {
            default: "w-56",
            sm: "w-40",
            lg: "w-72",
            auto: "w-auto",
        },
        variant: {
            default: "",
            bordered: "border-2",
            elevated: "shadow-lg",
        },
        rounded: {
            default: "rounded-md",
            sm: "rounded-sm",
            lg: "rounded-lg",
            full: "rounded-full",
        },
    },
    defaultVariants: {
        size: "default",
        variant: "default",
        rounded: "default",
    },
});

// Variants pour DropdownMenu.Item
const dropdownItemVariants = cva("", {
    variants: {
        variant: {
            default: "",
            destructive: "text-destructive focus:text-destructive",
            muted: "text-muted-foreground focus:text-muted-foreground",
        },
        size: {
            default: "text-sm py-1.5",
            sm: "text-xs py-1",
            lg: "text-base py-2",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});

// Interfaces pour les props
export interface DropdownContentProps
    extends React.ComponentPropsWithoutRef<typeof DropdownMenu.Content>,
        VariantProps<typeof dropdownContentVariants> {}

export interface DropdownItemProps
    extends React.ComponentPropsWithoutRef<typeof DropdownMenu.Item>,
        VariantProps<typeof dropdownItemVariants> {}

// Composants avec variants
const DropdownContent = React.forwardRef<
    React.ElementRef<typeof DropdownMenu.Content>,
    DropdownContentProps
>(({ className, size, variant, rounded, ...props }, ref) => (
    <DropdownMenu.Content
        ref={ref}
        className={cn(dropdownContentVariants({ size, variant, rounded }), className)}
        {...props}
    />
));
DropdownContent.displayName = "DropdownContent";

const DropdownItem = React.forwardRef<
    React.ElementRef<typeof DropdownMenu.Item>,
    DropdownItemProps
>(({ className, variant, size, ...props }, ref) => (
    <DropdownMenu.Item
        ref={ref}
        className={cn(dropdownItemVariants({ variant, size }), className)}
        {...props}
    />
));
DropdownItem.displayName = "DropdownItem";

// Type pour les éléments du dropdown
export interface DropdownItemData {
    id: string;
    label: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: VariantProps<typeof dropdownItemVariants>["variant"];
    icon?: React.ReactNode;
    shortcut?: string;
}

export interface DropdownGroupData {
    id: string;
    label?: string;
    items: DropdownItemData[];
}

// Interface pour le composant Dropdown
export interface DropdownProps {
    trigger: React.ReactNode;
    items?: DropdownItemData[];
    groups?: DropdownGroupData[];
    label?: string;
    size?: VariantProps<typeof dropdownContentVariants>["size"];
    variant?: VariantProps<typeof dropdownContentVariants>["variant"];
    rounded?: VariantProps<typeof dropdownContentVariants>["rounded"];
    itemSize?: VariantProps<typeof dropdownItemVariants>["size"];
    align?: "start" | "center" | "end";
    side?: "top" | "right" | "bottom" | "left";
    sideOffset?: number;
    alignOffset?: number;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
    contentClassName?: string;
    itemClassName?: string;
}

// Composant Dropdown avec API simplifiée
export function Dropdown({
    trigger,
    items,
    groups,
    label,
    size,
    variant,
    rounded,
    itemSize,
    align = "end",
    side = "bottom",
    sideOffset = 4,
    alignOffset,
    open,
    onOpenChange,
    className,
    contentClassName,
    itemClassName,
}: DropdownProps) {
    return (
        <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
            <DropdownMenu.Trigger asChild className={className}>
                {trigger}
            </DropdownMenu.Trigger>
            <DropdownContent
                size={size}
                variant={variant}
                rounded={rounded}
                align={align}
                side={side}
                sideOffset={sideOffset}
                alignOffset={alignOffset}
                className={contentClassName}
            >
                {label && <DropdownMenu.Label>{label}</DropdownMenu.Label>}

                {/* Rendu des items simples */}
                {items && items.length > 0 && (
                    <>
                        {items.map(item => (
                            <DropdownItem
                                key={item.id}
                                onClick={item.onClick}
                                disabled={item.disabled}
                                variant={item.variant}
                                size={itemSize}
                                className={itemClassName}
                            >
                                {item.icon && (
                                    <span className="mr-2 h-4 w-4 flex items-center justify-center">
                                        {item.icon}
                                    </span>
                                )}
                                <span>{item.label}</span>
                                {item.shortcut && (
                                    <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                                        {item.shortcut}
                                    </span>
                                )}
                            </DropdownItem>
                        ))}
                    </>
                )}

                {/* Rendu des groupes */}
                {groups && groups.length > 0 && (
                    <>
                        {groups.map((group, index) => (
                            <React.Fragment key={group.id}>
                                {index > 0 && <DropdownMenu.Separator />}
                                <DropdownMenu.Group>
                                    {group.label && (
                                        <DropdownMenu.Label>{group.label}</DropdownMenu.Label>
                                    )}
                                    {group.items.map(item => (
                                        <DropdownItem
                                            key={item.id}
                                            onClick={item.onClick}
                                            disabled={item.disabled}
                                            variant={item.variant}
                                            size={itemSize}
                                            className={itemClassName}
                                        >
                                            {item.icon && (
                                                <span className="mr-2 h-4 w-4 flex items-center justify-center">
                                                    {item.icon}
                                                </span>
                                            )}
                                            <span>{item.label}</span>
                                            {item.shortcut && (
                                                <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                                                    {item.shortcut}
                                                </span>
                                            )}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu.Group>
                            </React.Fragment>
                        ))}
                    </>
                )}
            </DropdownContent>
        </DropdownMenu.Root>
    );
}

// Export des composants
export {
    // DropdownMenu,
    // DropdownMenu.Content,
    // DropdownMenu.Item,
    // DropdownMenu.Label,
    // DropdownMenu.Separator,
    // DropdownMenu.Trigger,
    // DropdownMenu.Group,
    // DropdownMenu.Sub,
    // DropdownMenu.SubContent,
    // DropdownMenu.SubTrigger,
    // DropdownMenu.CheckboxItem,
    // DropdownMenu.RadioGroup,
    // DropdownMenu.RadioItem,
    // DropdownMenu.Portal,
    DropdownContent,
    DropdownItem,
};
