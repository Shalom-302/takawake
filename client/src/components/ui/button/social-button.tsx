"use client";

import { cva, type VariantProps } from "class-variance-authority";
import {
    AppleLogo,
    DribbleLogo,
    FacebookLogo,
    FigmaLogo,
    GoogleLogo,
    TwitterLogo,
} from "./social-logos";
import { cn } from "@/lib/utils/cn";
import Link, { type LinkProps } from "next/link";

const socialButtonVariants = cva(
    [
        "group relative inline-flex h-max items-center justify-center",
        "font-semibold whitespace-nowrap outline-none",
        "transition-all duration-100 ease-linear",
        "before:absolute before:inset-0",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
    ],
    {
        variants: {
            size: {
                sm: "gap-2 rounded-lg px-3 py-2 text-sm before:rounded-[7px]",
                md: "gap-2.5 rounded-lg px-3.5 py-2.5 text-sm before:rounded-[7px]",
                lg: "gap-3 rounded-lg px-4 py-2.5 text-base before:rounded-[7px]",
                xl: "gap-3.5 rounded-lg px-4.5 py-3 text-base before:rounded-[7px]",
                "2xl": "gap-4 rounded-[10px] px-5.5 py-4 text-lg before:rounded-[9px]",
            },
            variant: {
                brand: "",
                gray: "bg-gray-100 text-gray-900 shadow-sm ring-1 ring-gray-200 ring-inset hover:bg-gray-200",
                color: "",
            },
            social: {
                google: "",
                facebook: "",
                apple: "",
                twitter: "",
                figma: "",
                dribble: "",
            },
            iconOnly: {
                true: "",
                false: "",
            },
        },
        compoundVariants: [
            // Icon only padding overrides
            { size: "sm", iconOnly: true, className: "p-2" },
            { size: "md", iconOnly: true, className: "p-2.5" },
            { size: "lg", iconOnly: true, className: "p-2.5" },
            { size: "xl", iconOnly: true, className: "p-3.5" },
            { size: "2xl", iconOnly: true, className: "p-4" },

            // Brand variant styles per social
            {
                variant: "brand",
                social: "google",
                className:
                    "bg-gray-100 text-gray-900 shadow-sm ring-1 ring-gray-200 ring-inset hover:bg-gray-200",
            },
            {
                variant: "brand",
                social: "facebook",
                className:
                    "bg-[#1877F2] text-white shadow-sm ring-1 ring-transparent ring-inset before:border before:border-white/12 hover:bg-[#0C63D4]",
            },
            {
                variant: "brand",
                social: "apple",
                className:
                    "bg-black text-white shadow-sm ring-1 ring-transparent ring-inset before:border before:border-white/12",
            },
            {
                variant: "brand",
                social: "twitter",
                className:
                    "bg-black text-white shadow-sm ring-1 ring-transparent ring-inset before:border before:border-white/12",
            },
            {
                variant: "brand",
                social: "figma",
                className:
                    "bg-black text-white shadow-sm ring-1 ring-transparent ring-inset before:border before:border-white/12",
            },
            {
                variant: "brand",
                social: "dribble",
                className:
                    "bg-[#EA4C89] text-white shadow-sm ring-1 ring-transparent ring-inset before:border before:border-white/12 hover:bg-[#E62872]",
            },

            // Color variant styles
            {
                variant: "color",
                className:
                    "bg-gray-100 shadow-sm ring-1 ring-gray-200 ring-inset hover:bg-gray-200",
            },
        ],
        defaultVariants: {
            size: "lg",
            variant: "brand",
            iconOnly: false,
        },
    }
);

const iconVariants = cva("pointer-events-none shrink-0 transition-all duration-100", {
    variants: {
        variant: {
            brand: "",
            gray: "text-gray-500 group-hover:text-gray-600",
            color: "",
        },
        social: {
            google: "",
            facebook: "",
            apple: "",
            twitter: "",
            figma: "",
            dribble: "",
        },
    },
    compoundVariants: [
        {
            variant: "brand",
            social: "facebook",
            className: "text-white",
        },
        {
            variant: "brand",
            social: "apple",
            className: "text-white",
        },
        {
            variant: "brand",
            social: "twitter",
            className: "text-white",
        },
        {
            variant: "color",
            social: "apple",
            className: "text-black",
        },
        {
            variant: "color",
            social: "twitter",
            className: "text-black",
        },
    ],
});

// ============================================================================
// Types
// ============================================================================
type SocialType = "google" | "facebook" | "apple" | "twitter" | "figma" | "dribble";

interface SocialButtonBaseProps extends VariantProps<typeof socialButtonVariants> {
    social: SocialType;
    className?: string;
    children?: React.ReactNode;
    asChild?: boolean;
}

type ButtonElementProps = Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    keyof SocialButtonBaseProps
>;

interface SocialButtonAsButton extends SocialButtonBaseProps, ButtonElementProps {
    href?: never;
}

interface SocialButtonAsLink extends LinkProps, SocialButtonBaseProps {}

export type SocialButtonProps = SocialButtonAsButton | SocialButtonAsLink;
export type SocialButtonVariants = VariantProps<typeof socialButtonVariants>;

// ============================================================================
// Component
// ============================================================================
export const SocialButton = ({
    size,
    variant,
    social,
    className,
    children,
    ...props
}: SocialButtonProps) => {
    const isIconOnly = !children;
    const isLink = "href" in props && props.href !== undefined;

    const logos = {
        google: GoogleLogo,
        facebook: FacebookLogo,
        apple: AppleLogo,
        twitter: TwitterLogo,
        figma: FigmaLogo,
        dribble: DribbleLogo,
    };

    const Logo = logos[social];

    const shouldUseColorfulLogo =
        (variant === "brand" && (social === "google" || social === "figma")) ||
        (variant === "color" &&
            (social === "google" ||
                social === "facebook" ||
                social === "figma" ||
                social === "dribble"));

    const buttonClasses = cn(
        socialButtonVariants({ size, variant, social, iconOnly: isIconOnly }),
        className
    );

    const iconClasses = iconVariants({ variant, social });

    if (isLink) {
        const { href, disabled, ...anchorProps } = props as SocialButtonAsLink & {
            disabled?: boolean;
        };

        return (
            <Link
                href={href}
                aria-disabled={disabled ? true : undefined}
                className={buttonClasses}
                {...anchorProps}
            >
                <Logo className={iconClasses} colorful={shouldUseColorfulLogo} />
                {children}
            </Link>
        );
    }

    const buttonProps = props as ButtonElementProps;

    return (
        <button type={buttonProps.type || "button"} className={buttonClasses} {...buttonProps}>
            <Logo className={iconClasses} colorful={shouldUseColorfulLogo} />
            {children}
        </button>
    );
};

SocialButton.displayName = "SocialButton";
