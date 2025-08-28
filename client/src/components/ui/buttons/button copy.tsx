import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

const buttonVariants = cva(
    "group relative inline-flex h-max items-center justify-center whitespace-nowrap font-semibold rounded-md outline-brand transition-all shrink-0 before:absolute focus-visible:outline-2 focus-visible:outline-offset-2 [&_svg]:shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 disabled:cursor-not-allowed disabled:text-fg-disabled disabled:[&_svg]:text-fg-disabled_subtle  aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive ",

    {
        variants: {
            variant: {
                primary:
                    "bg-brand-solid text-white shadow-xs-skeumorphic ring-1 ring-transparent ring-inset hover:bg-brand-solid_hover data-loading:bg-brand-solid_hover disabled:bg-disabled disabled:shadow-xs disabled:ring-disabled_subtle [&_svg]:text-button-primary-icon hover:[&_svg]:text-button-primary-icon_hover",
                secondary:
                    "bg-primary text-secondary shadow-xs-skeumorphic ring-1 ring-primary ring-inset hover:bg-primary_hover hover:text-secondary_hover data-loading:bg-primary_hover disabled:shadow-xs disabled:ring-disabled_subtle [&_svg]:text-fg-quaternary hover:[&_svg]:text-fg-quaternary_hover",
                tertiary:
                    "text-tertiary hover:bg-primary_hover hover:text-tertiary_hover data-loading:bg-primary_hover [&_svg]:text-fg-quaternary hover:[&_svg]:text-fg-quaternary_hover",
                "link-gray":
                    "justify-normal rounded p-0! text-tertiary hover:text-tertiary_hover underline decoration-transparent underline-offset-2 hover:decoration-current [&_svg]:text-fg-quaternary hover:[&_svg]:text-fg-quaternary_hover",
                "link-color":
                    "justify-normal rounded p-0! text-brand-secondary hover:text-brand-secondary_hover underline decoration-transparent underline-offset-2 hover:decoration-current [&_svg]:text-fg-brand-secondary_alt hover:[&_svg]:text-fg-brand-secondary_hover",
                "primary-destructive":
                    "bg-error-solid text-white shadow-xs-skeumorphic ring-1 ring-transparent outline-error ring-inset before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0% disabled:bg-disabled disabled:shadow-xs disabled:ring-disabled_subtle [&_svg]:text-button-destructive-primary-icon hover:[&_svg]:text-button-destructive-primary-icon_hover",
            },
            size: {
                sm: "gap-1 px-3 py-2 text-sm ",
                md: "gap-1 px-3.5 py-2.5 text-sm ",
                lg: "gap-1.5 px-4 py-2.5 text-md ",
                xl: "gap-1.5 px-4.5 py-3 text-md ",
                "icon-sm": "size-9 p-2",
                "icon-md": "size-10 p-2.5",
                "icon-lg": "size-11 p-3",
                "icon-xl": "size-12 p-3.5",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "sm",
        },
    }
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    isLoading = false,
    ...props
}: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
        isLoading?: boolean;
    }) {
    const Comp = asChild ? Slot : "button";
    return (
        <Comp
            data-slot="button"
            data-loading={isLoading ? true : undefined}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg
                        fill="none"
                        data-icon="loading"
                        viewBox="0 0 20 20"
                        className="pointer-events-none size-5 shrink-0 transition-inherit-all"
                    >
                        {/* Background circle */}
                        <circle
                            className="stroke-current opacity-30"
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            strokeWidth="2"
                        />
                        {/* Spinning circle */}
                        <circle
                            className="origin-center animate-spin stroke-current"
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            strokeWidth="2"
                            strokeDasharray="12.5 50"
                            strokeLinecap="round"
                        />
                    </svg>
                    {!size?.includes("icon-") && <span>{"Soumission..."}</span>}
                </>
            ) : (
                props.children
            )}
        </Comp>
    );
}

export { Button, buttonVariants };
