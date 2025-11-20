import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { FlagTypes, IconComponentType, Sizes } from "./badge-types";
import { Dot } from "@/components/icons/_old/dot-icon";
import Image from "next/image";
import { XClose } from "@untitled-ui/icons-react";

export const badgeAddonColors = {
    gray: {
        addon: "text-utility-gray-500",
        addonButton: "hover:bg-utility-gray-100 text-utility-gray-400 hover:text-utility-gray-500",
    },
    brand: {
        addon: "text-utility-brand-500",
        addonButton:
            "hover:bg-utility-brand-100 text-utility-brand-400 hover:text-utility-brand-500",
    },
    error: {
        addon: "text-utility-error-500",
        addonButton:
            "hover:bg-utility-error-100 text-utility-error-400 hover:text-utility-error-500",
    },
    warning: {
        addon: "text-utility-warning-500",
        addonButton:
            "hover:bg-utility-warning-100 text-utility-warning-400 hover:text-utility-warning-500",
    },
    success: {
        addon: "text-utility-success-500",
        addonButton:
            "hover:bg-utility-success-100 text-utility-success-400 hover:text-utility-success-500",
    },
    blue: {
        addon: "text-utility-blue-500",
        addonButton: "hover:bg-utility-blue-100 text-utility-blue-400 hover:text-utility-blue-500",
    },
    modern: {
        addon: "text-gray-500",
        addonButton: "hover:bg-utility-gray-100 text-utility-gray-400 hover:text-utility-gray-500",
    },
} as const;

const sizeConfig = {
    sm: { padding: "px-2 py-0.5", gap: "gap-1", text: "text-xs" },
    md: { padding: "px-2.5 py-0.5", gap: "gap-1.5", text: "text-sm" },
    lg: { padding: "px-3 py-1", gap: "gap-1.5", text: "text-sm" },
} as const;

const generateSizeClasses = (
    size: Sizes,
    type: "default" | "dot" | "icon" | "flag" | "button" | "iconOnly"
) => {
    const config = sizeConfig[size as keyof typeof sizeConfig];

    const sizeMap = {
        sm: {
            icon: 3,
            padding: {
                dot: "pl-1.5 pr-2",
                iconL: "pr-2 pl-1.5",
                iconR: "pl-2 pr-1.5",
                flag: "pl-0.75 pr-2",
                button: "pl-2 pr-0.75",
                iconOnly: "p-1.25",
            },
        },
        md: {
            icon: 3,
            padding: {
                dot: "pl-2 pr-2.5",
                iconL: "pr-2.5 pl-2",
                iconR: "pl-2.5 pr-2",
                flag: "pl-1 pr-2.5",
                button: "pl-2.5 pr-1",
                iconOnly: "p-1.5",
            },
        },
        lg: {
            icon: 3,
            padding: {
                dot: "pl-2.5 pr-3",
                iconL: "pr-3 pl-2.5",
                iconR: "pl-3 pr-2.5",
                flag: "pl-1.5 pr-3",
                button: "pl-3 pr-1.5",
                iconOnly: "p-2",
            },
        },
    };

    const s = sizeMap[size as keyof typeof sizeMap];

    switch (type) {
        case "dot":
            return `${s.padding.dot} ${config.gap} ${config.text}`;
        case "icon":
            return `${config.gap} ${config.text}`;
        case "flag":
            return `${s.padding.flag} ${config.gap} ${config.text}`;
        case "button":
            return `${s.padding.button} gap-0.5 ${config.text}`;
        case "iconOnly":
            return s.padding.iconOnly;
        default:
            return `${config.padding} ${config.gap} ${config.text}`;
    }
};

const badgeSizes = {
    sm: generateSizeClasses("sm", "default"),
    md: generateSizeClasses("md", "default"),
    lg: generateSizeClasses("lg", "default"),
    dot_sm: generateSizeClasses("sm", "dot"),
    dot_md: generateSizeClasses("md", "dot"),
    dot_lg: generateSizeClasses("lg", "dot"),
    icon_leading_sm: `${generateSizeClasses("sm", "icon")} pr-2 pl-1.5`,
    icon_trailing_sm: `${generateSizeClasses("sm", "icon")} pl-2 pr-1.5`,
    icon_leading_md: `${generateSizeClasses("md", "icon")} pr-2.5 pl-2`,
    icon_trailing_md: `${generateSizeClasses("md", "icon")} pl-2.5 pr-2`,
    icon_leading_lg: `${generateSizeClasses("lg", "icon")} pr-3 pl-2.5`,
    icon_trailing_lg: `${generateSizeClasses("lg", "icon")} pl-3 pr-2.5`,
    flag_sm: generateSizeClasses("sm", "flag"),
    flag_md: generateSizeClasses("md", "flag"),
    flag_lg: generateSizeClasses("lg", "flag"),
    button_sm: generateSizeClasses("sm", "button"),
    button_md: generateSizeClasses("md", "button"),
    button_lg: generateSizeClasses("lg", "button"),
    icon_only_sm: generateSizeClasses("sm", "iconOnly"),
    icon_only_md: generateSizeClasses("md", "iconOnly"),
    icon_only_lg: generateSizeClasses("lg", "iconOnly"),
} as const;

export const badgeVariants = cva(
    "size-max inline-flex items-center justify-center font-medium w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden",
    {
        variants: {
            variant: {
                "pill-color": "rounded-full ring-1 ring-inset",
                color: "rounded-md ring-1 ring-inset",
                modern: "rounded-md ring-1 ring-inset shadow-xs bg-primary! text-secondary! ring-primary!",
            },
            size: badgeSizes,
            color: {
                gray: "bg-utility-gray-50 text-utility-gray-700 ring-utility-gray-200",
                brand: "bg-utility-brand-50 text-utility-brand-700 ring-utility-brand-200",
                error: "bg-utility-error-50 text-utility-error-700 ring-utility-error-200",
                warning: "bg-utility-warning-50 text-utility-warning-700 ring-utility-warning-200",
                success: "bg-utility-success-50 text-utility-success-700 ring-utility-success-200",
                blue: "bg-utility-blue-50 text-utility-blue-700 ring-utility-blue-200",
            },
        },
        defaultVariants: {
            variant: "pill-color",
            size: "md",
            color: "gray",
        },
    }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
type BadgeColorKeys = keyof typeof badgeAddonColors;
type CommonBadgeProps = BadgeVariants &
    Omit<React.ComponentProps<"span">, "color" | "size"> & {
        asChild?: boolean;
    };

// Utilitaire pour récupérer les styles d'addon
const getAddonStyle = (
    variant: BadgeVariants["variant"],
    color: BadgeVariants["color"],
    type: "addon" | "button" = "addon"
) => {
    const colorKey: BadgeColorKeys = variant === "modern" ? "modern" : (color as BadgeColorKeys);
    return type === "button"
        ? badgeAddonColors[colorKey]?.addonButton || ""
        : badgeAddonColors[colorKey]?.addon || "";
};

export function Badge({
    className,
    variant,
    color,
    size = "md",
    asChild = false,
    ...props
}: CommonBadgeProps) {
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

export function BadgeWithDot({
    className,
    variant,
    color = "gray",
    size = "md",
    children,
    asChild = false,
    ...props
}: CommonBadgeProps) {
    const Comp = asChild ? Slot : "span";

    return (
        <Comp
            data-slot="badge-with-dot"
            className={cn(
                badgeVariants({
                    variant,
                    size: `dot_${size}` as BadgeVariants["size"],
                    ...(variant !== "modern" && { color }),
                }),
                className
            )}
            {...props}
        >
            <Dot className={getAddonStyle(variant, color)} size="sm" />
            {children}
        </Comp>
    );
}

interface BadgeWithIconProps extends CommonBadgeProps {
    leftIcon?: IconComponentType;
    rightIcon?: IconComponentType;
}

export function BadgeWithIcon({
    className,
    variant,
    color = "gray",
    size = "md",
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    children,
    asChild = false,
    ...props
}: BadgeWithIconProps) {
    const Comp = asChild ? Slot : "span";
    const position = LeftIcon ? "leading" : "trailing";
    const addonStyle = getAddonStyle(variant, color);

    return (
        <Comp
            data-slot="badge-with-icon"
            className={cn(
                badgeVariants({
                    variant,
                    size: `icon_${position}_${size}` as BadgeVariants["size"],
                    ...(variant !== "modern" && { color }),
                }),
                className
            )}
            {...props}
        >
            {LeftIcon && <LeftIcon className={cn(addonStyle, "size-3 stroke-3")} strokeWidth={3} />}
            {children}
            {RightIcon && (
                <RightIcon className={cn(addonStyle, "size-3 stroke-3")} strokeWidth={3} />
            )}
        </Comp>
    );
}

interface BadgeWithFlagProps extends CommonBadgeProps {
    flag?: FlagTypes;
}

export function BadgeWithFlag({
    className,
    variant,
    color = "gray",
    size = "md",
    flag = "AU",
    children,
    asChild = false,
    ...props
}: BadgeWithFlagProps) {
    const Comp = asChild ? Slot : "span";

    return (
        <Comp
            data-slot="badge-with-flag"
            className={cn(
                badgeVariants({
                    variant,
                    size: `flag_${size}` as BadgeVariants["size"],
                    ...(variant !== "modern" && { color }),
                }),
                className
            )}
            {...props}
        >
            <div className="relative size-4 max-w-none rounded-full">
                <Image
                    src={`https://www.untitledui.com/images/flags/${flag}.svg`}
                    alt={`${flag} flag`}
                    fill
                />
            </div>
            {children}
        </Comp>
    );
}

interface BadgeWithImageProps extends CommonBadgeProps {
    imgSrc: string;
}

export function BadgeWithImage({
    className,
    variant,
    color = "gray",
    size = "md",
    imgSrc,
    children,
    asChild = false,
    ...props
}: BadgeWithImageProps) {
    const Comp = asChild ? Slot : "span";

    return (
        <Comp
            data-slot="badge-with-image"
            className={cn(
                badgeVariants({
                    variant,
                    size: `flag_${size}` as BadgeVariants["size"],
                    ...(variant !== "modern" && { color }),
                }),
                className
            )}
            {...props}
        >
            <div className="relative size-4 max-w-none">
                <Image src={imgSrc} alt="Badge image" className="rounded-full" fill />
            </div>
            {children}
        </Comp>
    );
}

interface BadgeWithButtonProps extends CommonBadgeProps {
    icon?: IconComponentType;
    buttonLabel?: string;
    onButtonClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function BadgeWithButton({
    className,
    variant = "pill-color",
    color = "gray",
    size = "md",
    icon: Icon = XClose,
    buttonLabel = "Supprimer",
    children,
    onButtonClick,
    asChild = false,
    ...props
}: BadgeWithButtonProps) {
    const Comp = asChild ? Slot : "span";

    return (
        <Comp
            data-slot="badge-with-button"
            className={cn(
                badgeVariants({
                    variant,
                    size: `button_${size}` as BadgeVariants["size"],
                    ...(variant !== "modern" && { color }),
                }),
                className
            )}
            {...props}
        >
            {children}
            <button
                type="button"
                aria-label={buttonLabel}
                onClick={onButtonClick}
                className={cn(
                    "flex cursor-pointer items-center justify-center p-0.5 outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2",
                    getAddonStyle(variant, color, "button"),
                    variant === "pill-color" ? "rounded-full" : "rounded-[3px]"
                )}
            >
                <Icon className="size-3 stroke-[3px] transition-inherit-all" strokeWidth={3} />
            </button>
        </Comp>
    );
}

interface BadgeIconProps extends CommonBadgeProps {
    icon: IconComponentType;
}

export function BadgeIcon({
    className,
    variant,
    color = "gray",
    size = "md",
    icon: Icon,
    asChild = false,
    ...props
}: BadgeIconProps) {
    const Comp = asChild ? Slot : "span";

    return (
        <Comp
            data-slot="badge-icon"
            className={cn(
                badgeVariants({
                    variant,
                    size: `icon_only_${size}` as BadgeVariants["size"],
                    ...(variant !== "modern" && { color }),
                }),
                className
            )}
            {...props}
        >
            <Icon
                className={cn("size-3 stroke-[3px]", getAddonStyle(variant, color))}
                strokeWidth={3}
            />
        </Comp>
    );
}
