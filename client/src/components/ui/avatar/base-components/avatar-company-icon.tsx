"use client";

import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

const avatarCompanyIconVariants = cva(
    "absolute -right-0.5 -bottom-0.5 rounded-full ring-[1.5px] ring-bg-primary overflow-hidden",
    {
        variants: {
            size: {
                xs: "size-2",
                sm: "size-3",
                md: "size-3.5",
                lg: "size-4",
                xl: "size-4.5",
                "2xl": "size-5 ring-[1.67px]",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
);

export type AvatarCompanyIconProps = VariantProps<typeof avatarCompanyIconVariants> & {
    src: string;
    alt?: string;
    className?: string;
};

export const AvatarCompanyIcon = ({ size, src, alt, className }: AvatarCompanyIconProps) => (
    <span className={cn(avatarCompanyIconVariants({ size }), className)} aria-hidden="true">
        <Image src={src} alt={alt ?? "Company icon"} fill className="object-cover rounded-full" />
    </span>
);
