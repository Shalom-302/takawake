import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import React from "react";

const typographyVariants = cva("", {
    variants: {
        variant: {
            // Optima (display)
            "display-2xl": "text-[72px] leading-[90px] tracking-[-0.02em] font-optima",
            "display-xl": "text-[60px] leading-[72px] tracking-[-0.02em] font-optima",
            "display-lg": "text-[48px] leading-[60px] tracking-[-0.02em] font-optima",
            "display-md": "text-[36px] leading-[44px] font-optima",
            "display-sm": "text-[30px] leading-[38px] font-optima",
            "display-xs": "text-[24px] leading-[32px] font-optima",
            // Inter (text)
            "text-xl": "text-[20px] leading-[30px] font-inter",
            "text-lg": "text-[18px] leading-[28px] font-inter",
            "text-md": "text-[16px] leading-[24px] font-inter",
            "text-sm": "text-[14px] leading-[20px] font-inter",
            "text-xs": "text-[12px] leading-[18px] font-inter",
        },
    },
    defaultVariants: {
        variant: "text-md",
    },
});

type TypographyProps = React.HTMLAttributes<HTMLElement> &
    VariantProps<typeof typographyVariants> & {
        as?: React.ElementType;
    };

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
    ({ className, variant, as: Comp = "span", ...props }, ref) => {
        return (
            <Comp ref={ref} className={cn(typographyVariants({ variant }), className)} {...props} />
        );
    }
);

Typography.displayName = "Typography";

export default Typography;
