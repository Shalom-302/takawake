import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { isReactComponent } from "@/lib/utils/is-react-component";
import type { FC, ReactNode, Ref } from "react";
import { isValidElement } from "react";

const featuredIconVariants = cva("relative flex shrink-0 items-center justify-center", {
    variants: {
        size: {
            sm: "",
            md: "",
            lg: "",
            xl: "",
        },
        color: {
            brand: "",
            gray: "",
            error: "",
            warning: "",
            success: "",
        },
        variant: {
            light: "rounded-full",
            gradient:
                "rounded-full text-fg-white before:absolute before:inset-0 before:size-full before:rounded-full before:border before:mask-b-from-0% after:absolute after:block after:rounded-full",
            dark: "text-fg-white shadow-xs-skeumorphic before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0%",
            modern: "bg-primary shadow-xs-skeumorphic ring-1 ring-inset",
            "modern-neue": [
                "bg-primary_alt ring-1 ring-inset before:absolute before:inset-1",
                "before:shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1),0px_3px_3px_0px_rgba(0,0,0,0.09),1px_8px_5px_0px_rgba(0,0,0,0.05),2px_21px_6px_0px_rgba(0,0,0,0),0px_0px_0px_1px_rgba(0,0,0,0.08),1px_13px_5px_0px_rgba(0,0,0,0.01),0px_-2px_2px_0px_rgba(0,0,0,0.13)_inset] before:ring-1 before:ring-secondary_alt",
            ].join(" "),
            outline:
                "before:absolute before:rounded-full before:border-2 after:absolute after:rounded-full after:border-2",
        },
    },
    compoundVariants: [
        // Sizing variants for the main container
        { size: "sm", className: "size-8" },
        { size: "md", className: "size-10" },
        { size: "lg", className: "size-12" },
        { size: "xl", className: "size-14" },
        { variant: "outline", size: "sm", className: "size-4" },
        { variant: "outline", size: "md", className: "size-5" },
        { variant: "outline", size: "lg", className: "size-6" },
        { variant: "outline", size: "xl", className: "size-7" },

        // Icon sizing variants
        { size: ["sm", "md"], className: "*:data-icon:size-4" },
        { size: ["lg", "xl"], className: "*:data-icon:size-5" },
        { variant: "outline", className: "*:data-icon:size-full" },

        // Theme-specific sizing for pseudo-elements
        { variant: "gradient", size: "sm", className: "after:size-6" },
        { variant: "gradient", size: "md", className: "after:size-7" },
        { variant: "gradient", size: "lg", className: "after:size-8" },
        { variant: "gradient", size: "xl", className: "after:size-10" },

        { variant: "dark", size: "sm", className: "rounded-md before:rounded-[5px]" },
        { variant: "dark", size: "md", className: "rounded-lg before:rounded-[7px]" },
        { variant: "dark", size: "lg", className: "rounded-[10px] before:rounded-[9px]" },
        { variant: "dark", size: "xl", className: "rounded-xl before:rounded-[11px]" },

        { variant: "modern", size: "sm", className: "rounded-md" },
        { variant: "modern", size: "md", className: "rounded-lg" },
        { variant: "modern", size: "lg", className: "rounded-[10px]" },
        { variant: "modern", size: "xl", className: "rounded-xl" },

        { variant: "modern-neue", size: "sm", className: "rounded-[8px] before:rounded-[4px]" },
        { variant: "modern-neue", size: "md", className: "rounded-[10px] before:rounded-[6px]" },
        { variant: "modern-neue", size: "lg", className: "rounded-[12px] before:rounded-[8px]" },
        { variant: "modern-neue", size: "xl", className: "rounded-[14px] before:rounded-[10px]" },

        { variant: "outline", size: "sm", className: "before:size-6 after:size-8.5" },
        { variant: "outline", size: "md", className: "before:size-7 after:size-9.5" },
        { variant: "outline", size: "lg", className: "before:size-8 after:size-10.5" },
        { variant: "outline", size: "xl", className: "before:size-9 after:size-11.5" },

        // Color variants (grouped by variant)
        {
            variant: "light",
            color: "brand",
            className: "bg-brand-secondary text-featured-icon-light-fg-brand",
        },
        {
            variant: "light",
            color: "gray",
            className: "bg-tertiary text-featured-icon-light-fg-gray",
        },
        {
            variant: "light",
            color: "error",
            className: "bg-error-secondary text-featured-icon-light-fg-error",
        },
        {
            variant: "light",
            color: "warning",
            className: "bg-warning-secondary text-featured-icon-light-fg-warning",
        },
        {
            variant: "light",
            color: "success",
            className: "bg-success-secondary text-featured-icon-light-fg-success",
        },

        {
            variant: "gradient",
            color: "brand",
            className:
                "before:border-utility-brand-200 before:bg-utility-brand-50 after:bg-brand-solid",
        },
        {
            variant: "gradient",
            color: "gray",
            className:
                "before:border-utility-gray-200 before:bg-utility-gray-50 after:bg-secondary-solid",
        },
        {
            variant: "gradient",
            color: "error",
            className:
                "before:border-utility-error-200 before:bg-utility-error-50 after:bg-error-solid",
        },
        {
            variant: "gradient",
            color: "warning",
            className:
                "before:border-utility-warning-200 before:bg-utility-warning-50 after:bg-warning-solid",
        },
        {
            variant: "gradient",
            color: "success",
            className:
                "before:border-utility-success-200 before:bg-utility-success-50 after:bg-success-solid",
        },

        {
            variant: "dark",
            color: "brand",
            className: "bg-brand-solid before:border-utility-brand-200/12",
        },
        {
            variant: "dark",
            color: "gray",
            className: "bg-secondary-solid before:border-utility-gray-200/12",
        },
        {
            variant: "dark",
            color: "error",
            className: "bg-error-solid before:border-utility-error-200/12",
        },
        {
            variant: "dark",
            color: "warning",
            className: "bg-warning-solid before:border-utility-warning-200/12",
        },
        {
            variant: "dark",
            color: "success",
            className: "bg-success-solid before:border-utility-success-200/12",
        },

        { variant: "modern", color: "gray", className: "text-fg-secondary ring-primary" },
        { variant: "modern-neue", color: "gray", className: "text-fg-secondary ring-primary" },

        {
            variant: "outline",
            color: "brand",
            className:
                "text-fg-brand-primary before:border-fg-brand-primary/30 after:border-fg-brand-primary/10",
        },
        {
            variant: "outline",
            color: "gray",
            className: "text-fg-tertiary before:border-fg-tertiary/30 after:border-fg-tertiary/10",
        },
        {
            variant: "outline",
            color: "error",
            className:
                "text-fg-error-primary before:border-fg-error-primary/30 after:border-fg-error-primary/10",
        },
        {
            variant: "outline",
            color: "warning",
            className:
                "text-fg-warning-primary before:border-fg-warning-primary/30 after:border-fg-warning-primary/10",
        },
        {
            variant: "outline",
            color: "success",
            className:
                "text-fg-success-primary before:border-fg-success-primary/30 after:border-fg-success-primary/10",
        },
    ],
    defaultVariants: {
        size: "sm",
        color: "brand",
        variant: "light",
    },
});

interface FeaturedIconProps extends VariantProps<typeof featuredIconVariants> {
    ref?: Ref<HTMLDivElement>;
    children?: ReactNode;
    className?: string;
    icon?: FC<{ className?: string }> | ReactNode;
}

export const FeaturedIcon = (props: FeaturedIconProps) => {
    const { size = "sm", variant = "light", color = "brand", icon: Icon, ...otherProps } = props;

    return (
        <div
            {...otherProps}
            data-featured-icon
            className={cn(featuredIconVariants({ size, variant, color }), props.className)}
        >
            {isReactComponent(Icon) && <Icon data-icon className="z-1" />}
            {isValidElement(Icon) && <div className="z-1">{Icon}</div>}

            {props.children}
        </div>
    );
};
