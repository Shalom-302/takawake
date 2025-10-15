import * as React from "react";
import { FC, ReactNode, isValidElement } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { isReactComponent } from "@/lib/utils/is-react-component";
import { ArrowRight } from "@untitled-ui/icons-react";

type Size = "md" | "lg";
type Color = "brand" | "warning" | "error" | "gray" | "success";
type Theme = "light" | "modern";
type Align = "left" | "right";

// Configuration spécifique pour le point (dot) dans le thème modern
const dotModernClasses: Record<Color, string> = {
    brand: "bg-utility-brand-500 outline-utility-brand-100",
    gray: "bg-utility-gray-500 outline-utility-gray-100",
    error: "bg-utility-error-500 outline-utility-error-100",
    warning: "bg-utility-warning-500 outline-utility-warning-100",
    success: "bg-utility-success-500 outline-utility-success-100",
};

// Configuration centralisée des couleurs pour la racine et les éléments imbriqués
const themeColors: Record<Theme, Record<Color, string>> = {
    light: {
        brand: "bg-utility-brand-50 ring-utility-brand-200 text-utility-brand-700 hover:bg-utility-brand-100",
        gray: "bg-utility-gray-50 ring-utility-gray-200 text-utility-gray-700 hover:bg-utility-gray-100",
        error: "bg-utility-error-50 ring-utility-error-200 text-utility-error-700 hover:bg-utility-error-100",
        warning:
            "bg-utility-warning-50 ring-utility-warning-200 text-utility-warning-700 hover:bg-utility-warning-100",
        success:
            "bg-utility-success-50 ring-utility-success-200 text-utility-success-700 hover:bg-utility-success-100",
    },
    modern: {
        brand: "text-utility-brand-500",
        gray: "text-utility-gray-500",
        error: "text-utility-error-500",
        warning: "text-utility-warning-500",
        success: "text-utility-success-500",
    },
};

// Variant pour le badge principal
const badgeVariants = cva(
    "inline-flex w-max cursor-pointer items-center transition duration-100 ease-linear font-medium",
    {
        variants: {
            theme: {
                light: "rounded-full ring-1 ring-inset",
                modern: "rounded-[10px] shadow-xs ring-1 ring-inset ring-primary bg-primary text-secondary hover:bg-secondary",
            },
            size: {
                md: "py-1 text-xs",
                lg: "py-1 text-sm",
            },
        },
        defaultVariants: {
            theme: "light",
            size: "md",
        },
    }
);

// Variant pour l'addon
const addonVariants = cva("inline-flex items-center", {
    variants: {
        theme: {
            light: "rounded-full ring-1 ring-inset bg-primary text-current",
            modern: "rounded-md shadow-xs ring-1 ring-inset ring-primary",
        },
        size: {
            md: "px-2 py-0.5",
            lg: "px-2.5 py-0.5",
        },
    },
    defaultVariants: {
        theme: "light",
        size: "md",
    },
});

interface BadgeGroupProps {
    children?: string | ReactNode;
    addonText: string | ReactNode;
    size?: Size;
    color?: Color;
    theme?: Theme;
    align?: Align;
    rightIcon?: FC<{ className?: string }> | ReactNode;
    className?: string;
}

export const BadgeGroup: FC<BadgeGroupProps> = ({
    children,
    addonText,
    size = "md",
    color = "brand",
    theme = "light",
    align = "left",
    rightIcon: RightIcon = ArrowRight,
    className,
}) => {
    // Classes dynamiques basées sur les props
    const hasText = !!children;
    const sizeMap = {
        md: { icon: "size-4", dot: "size-2" },
        lg: { icon: "size-4", dot: "size-2" },
    };

    // -----------------------------------------------------------------
    // 1. CLASSES DU BADGE PRINCIPAL (ROOT)
    // -----------------------------------------------------------------
    const badgeClasses = cn(
        badgeVariants({ theme, size }),
        // 1. Application des couleurs de fond/texte spécifiques (Root)
        theme === "light" && themeColors.light[color],
        // 2. Calcul du padding horizontal basé sur l'alignement et la présence de texte
        align === "left"
            ? cn("pl-1", hasText ? "pr-2" : "pr-1") // Addon à gauche, padding à droite ajusté
            : cn("pr-1", hasText ? "pl-3" : "pl-2.5"), // Addon à droite, padding à gauche ajusté
        className
    );

    // -----------------------------------------------------------------
    // 2. CLASSES DE L'ADDON
    // -----------------------------------------------------------------
    const addonLightColorClasses =
        theme === "light"
            ? themeColors.light[color].split(" ").slice(1, 3).join(" ") // Extrait de ring + text
            : "";

    const addonClasses = cn(
        addonVariants({ theme, size }),
        // 1. Ajout du gap/padding spécifiques au thème moderne
        theme === "modern" && (size === "md" ? "gap-1 px-1.5" : "gap-1.5 px-2"),
        // 2. Ajout du margin si il y a du texte principal (children)
        hasText && (align === "left" ? "mr-2" : "ml-2"),
        // 3. Ajout des classes de couleur de text/ring pour le thème light
        addonLightColorClasses
    );

    // -----------------------------------------------------------------
    // 3. CLASSES DU POINT ET DE L'ICÔNE
    // -----------------------------------------------------------------
    const dotClasses = cn(
        "inline-block shrink-0 rounded-full",
        sizeMap[size].dot,
        theme === "modern" &&
            cn(
                dotModernClasses[color],
                "outline-3 -outline-offset-1",
                // Ajustement du margin pour le point dans le thème modern (si l'addon est à droite)
                align === "right" && (size === "md" ? "mr-1.5" : "mr-2")
            )
    );

    const iconClasses = cn(
        sizeMap[size].icon,
        align === "right" ? "ml-0.5 stroke-[3px]" : "ml-1",
        theme === "modern" ? themeColors.modern.gray : themeColors.modern[color]
    );

    // Rendu de l'icône
    const IconElement = isReactComponent(RightIcon) ? (
        <RightIcon className={iconClasses} />
    ) : isValidElement(RightIcon) ? (
        RightIcon
    ) : null;

    // Rendu conditionnel basé sur l'alignement
    if (align === "right") {
        return (
            <div className={badgeClasses}>
                {theme === "modern" && <span className={dotClasses} />}
                {children}
                <span className={addonClasses}>
                    {addonText}
                    {IconElement}
                </span>
            </div>
        );
    }

    return (
        <div className={badgeClasses}>
            <span className={addonClasses}>
                {theme === "modern" && <span className={dotClasses} />}
                {addonText}
            </span>
            {children}
            {IconElement}
        </div>
    );
};
