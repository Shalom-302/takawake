"use client";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";
import Link, { type LinkProps } from "next/link";
import {
    AppGalleryLogo,
    AppStoreLogo,
    GalaxyStoreLogo,
    GooglePlayLogo,
    GooglePlayWhiteLogo,
} from "./store-logos";

const appStoreButtonVariants = cva(
    [
        "inline-flex items-center justify-center",
        "transition-all duration-100 ease-linear",
        "rounded-[7px] focus-visible:outline-2 focus-visible:outline-offset-2",
        "ring-1 ring-inset outline-focus-ring ",
    ],
    {
        variants: {
            variant: {
                filled: "bg-black ring-app-store-badge-border ",
                outlined: "text-fg-primary ring-fg-primary",
            },
        },
        defaultVariants: {
            variant: "filled",
        },
    }
);
export type AppStoreButtonVariants = Exclude<
    VariantProps<typeof appStoreButtonVariants>["variant"],
    undefined | null
>;
export type StoreType =
    | "google-play"
    | "google-play-white"
    | "app-store"
    | "galaxy-store"
    | "app-gallery";
export type SizeType = "md" | "lg";

export const MobileAppStore = ({
    store,
    size = "md",
    variant = "filled",
    className,
    href = "#",
    ...props
}: LinkProps & {
    size?: SizeType;
    store: StoreType;
    variant: AppStoreButtonVariants;
    className?: string;
}) => {
    const ariaLabels: Record<StoreType, string> = {
        "google-play": "Get it on Google Play",
        "google-play-white": "Get it on Google Play",
        "app-store": "Download on the App Store",
        "galaxy-store": "Available on Galaxy Store",
        "app-gallery": "Explore it on AppGallery",
    };

    const renderSVG = () => {
        switch (store) {
            case "google-play":
                return <GooglePlayLogo size={size} variant={variant} />;
            case "google-play-white":
                return <GooglePlayWhiteLogo size={size} variant={variant} />;
            case "app-store":
                return <AppStoreLogo size={size} variant={variant} />;
            case "galaxy-store":
                return <GalaxyStoreLogo size={size} variant={variant} />;
            case "app-gallery":
                return <AppGalleryLogo size={size} variant={variant} />;
            default:
                return null;
        }
    };

    return (
        <Link
            aria-label={ariaLabels[store]}
            href={href}
            className={cn(appStoreButtonVariants({ variant }), className)}
            {...props}
        >
            {renderSVG()}
        </Link>
    );
};
