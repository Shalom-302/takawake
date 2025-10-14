import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { FlagTypes, IconComponentType, Sizes } from "./badge-types";
import { Dot } from "@/components/icons/dot-icon";
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
    // Styles pour 'modern'
    modern: {
        addon: "text-gray-500",
        addonButton: "hover:bg-utility-gray-100 text-utility-gray-400 hover:text-utility-gray-500",
    },
} as const;

const badgeSizes = {
    // ----------------------------------------------------
    // Badge Standard (Badge)
    sm: "px-2 py-0.5 gap-1 text-xs",
    md: "px-2.5 py-0.5 gap-1.5 text-sm",
    lg: "px-3 py-1 gap-1.5 text-sm",

    // ----------------------------------------------------
    // Badge avec Dot (BadgeWithDot)
    dot_sm: "py-0.5 pl-1.5 pr-2 gap-1 text-xs",
    dot_md: "py-0.5 pl-2 pr-2.5 gap-1.5 text-sm",
    dot_lg: "py-1 pl-2.5 pr-3 gap-1.5 text-sm",

    // ----------------------------------------------------
    // Badge avec Icône (BadgeWithIcon)
    icon_leading_sm: "gap-0.5 py-0.5 pr-2 pl-1.5 text-xs",
    icon_trailing_sm: "gap-0.5 py-0.5 pl-2 pr-1.5 text-xs",
    icon_leading_md: "gap-1 py-0.5 pr-2.5 pl-2 text-sm",
    icon_trailing_md: "gap-1 py-0.5 pl-2.5 pr-2 text-sm",
    icon_leading_lg: "gap-1 py-1 pr-3 pl-2.5 text-sm",
    icon_trailing_lg: "gap-1 py-1 pl-3 pr-2.5 text-sm",

    // ----------------------------------------------------
    // Badge avec Drapeau/Image (BadgeWithFlag, BadgeWithImage)
    flag_sm: "gap-1 py-0.5 pl-0.75 pr-2 text-xs",
    flag_md: "gap-1.5 py-0.5 pl-1 pr-2.5 text-sm",
    flag_lg: "gap-1.5 py-1 pl-1.5 pr-3 text-sm",

    // ----------------------------------------------------
    // Badge avec Bouton (BadgeWithButton)
    button_sm: "gap-0.5 py-0.5 pl-2 pr-0.75 text-xs",
    button_md: "gap-0.5 py-0.5 pl-2.5 pr-1 text-sm",
    button_lg: "gap-0.5 py-1 pl-3 pr-1.5 text-sm",

    // ----------------------------------------------------
    // Icône seule (BadgeIcon)
    icon_only_sm: "p-1.25",
    icon_only_md: "p-1.5",
    icon_only_lg: "p-2",
} as const;

export const badgeVariants = cva(
    "size-max inline-flex items-center justify-center font-medium w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden",
    {
        variants: {
            variant: {
                "pill-color": "rounded-full ring-1 ring-inset",
                color: " rounded-md ring-1 ring-inset",
                modern: " rounded-md ring-1 ring-inset shadow-xs bg-primary! text-secondary! ring-primary!",
            },
            size: badgeSizes,
            color: {
                gray: "bg-utility-gray-50 text-utility-gray-700 ring-utility-gray-200 ",
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

export function Badge({
    className,
    variant,
    color,
    size = "md",
    asChild = false,
    ...props
}: CommonBadgeProps) {
    const Comp = asChild ? Slot : "span";

    const baseSize =
        size === "dot_sm" || size === "dot_md" || size === "dot_lg" ? "md" : (size as Sizes);

    return (
        <Comp
            data-slot="badge"
            className={cn(
                badgeVariants({
                    variant,
                    size: baseSize,
                    ...(variant !== "modern" && { color }),
                }),
                className
            )}
            {...props}
        />
    );
}

// ----------------------------------------------------
// BadgeWithDot
// ----------------------------------------------------

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

    const sizeWithDot = `dot_${size}` as BadgeVariants["size"];
    const addonColorKey: BadgeColorKeys =
        variant === "modern" ? "modern" : (color as BadgeColorKeys);
    const addonStyle = badgeAddonColors[addonColorKey]?.addon || "";

    return (
        <Comp
            data-slot="badge-with-dot"
            className={cn(
                badgeVariants({
                    variant,
                    size: sizeWithDot,
                    ...(variant !== "modern" && { color }),
                }),
                className
            )}
            {...props}
        >
            <Dot className={addonStyle} />
            {children}
        </Comp>
    );
}

// ----------------------------------------------------
// BadgeWithIcon
// ----------------------------------------------------
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

    const iconPosition = LeftIcon ? "leading" : "trailing";
    const sizeWithIcon = `icon_${iconPosition}_${size}` as BadgeVariants["size"];

    const addonColorKey: BadgeColorKeys =
        variant === "modern" ? "modern" : (color as BadgeColorKeys);
    const addonStyle = badgeAddonColors[addonColorKey]?.addon || "";

    return (
        <Comp
            data-slot="badge-with-icon"
            className={cn(
                badgeVariants({
                    variant,
                    size: sizeWithIcon,
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

// ----------------------------------------------------
// BadgeWithFlag
// ----------------------------------------------------
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
    const sizeWithFlag = `flag_${size}` as BadgeVariants["size"];

    return (
        <Comp
            data-slot="badge-with-flag"
            className={cn(
                badgeVariants({
                    variant,
                    size: sizeWithFlag,
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

// ----------------------------------------------------
// BadgeWithImage
// ----------------------------------------------------
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
    const sizeWithImage = `flag_${size}` as BadgeVariants["size"];

    return (
        <Comp
            data-slot="badge-with-image"
            className={cn(
                badgeVariants({
                    variant,
                    size: sizeWithImage,
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

// ----------------------------------------------------
// BadgeWithButton
// ----------------------------------------------------
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
    const sizeWithButton = `button_${size}` as BadgeVariants["size"];

    const addonColorKey: BadgeColorKeys =
        variant === "modern" ? "modern" : (color as BadgeColorKeys);
    const buttonStyle = badgeAddonColors[addonColorKey]?.addonButton || "";

    return (
        <Comp
            data-slot="badge-with-button"
            className={cn(
                badgeVariants({
                    variant,
                    size: sizeWithButton,
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
                    buttonStyle,
                    variant === "pill-color" ? "rounded-full" : "rounded-[3px]"
                )}
            >
                <Icon className="size-3 stroke-[3px] transition-inherit-all" strokeWidth={3} />
            </button>
        </Comp>
    );
}

// ----------------------------------------------------
// BadgeIcon
// ----------------------------------------------------
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
    const sizeIconOnly = `icon_only_${size}` as BadgeVariants["size"];

    const addonColorKey: BadgeColorKeys =
        variant === "modern" ? "modern" : (color as BadgeColorKeys);
    const addonStyle = badgeAddonColors[addonColorKey]?.addon || "";

    return (
        <Comp
            data-slot="badge-icon"
            className={cn(
                badgeVariants({
                    variant,
                    size: sizeIconOnly,
                    ...(variant !== "modern" && { color }),
                }),
                className
            )}
            {...props}
        >
            <Icon className={cn("size-3 stroke-[3px]", addonStyle)} strokeWidth={3} />
        </Comp>
    );
}
