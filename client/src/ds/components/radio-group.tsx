"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import {
    RadioGroup as ShadcnRadioGroup,
    RadioGroupItem as ShadcnRadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label/label";

// Variants pour RadioGroup
const radioGroupVariants = cva("grid gap-3", {
    variants: {
        layout: {
            vertical: "grid-flow-row",
            horizontal: "grid-flow-col",
            grid: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
        },
        size: {
            default: "",
            sm: "gap-2",
            lg: "gap-4",
        },
    },
    defaultVariants: {
        layout: "vertical",
        size: "default",
    },
});

// Variants pour RadioGroupItem
const radioGroupItemVariants = cva(
    "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "",
                outline: "border-2",
                filled: "bg-muted/50",
            },
            size: {
                default: "size-4",
                sm: "size-3.5",
                lg: "size-5",
            },
            state: {
                default: "",
                error: "border-destructive focus-visible:ring-destructive/50",
                success: "border-success focus-visible:ring-success/50",
                warning: "border-warning focus-visible:ring-warning/50",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            state: "default",
        },
    }
);

// Interfaces pour les props
export interface RadioGroupProps
    extends React.ComponentPropsWithoutRef<typeof ShadcnRadioGroup>,
        VariantProps<typeof radioGroupVariants> {}

export interface RadioGroupItemProps
    extends React.ComponentPropsWithoutRef<typeof ShadcnRadioGroupItem>,
        VariantProps<typeof radioGroupItemVariants> {}

// Composants avec variants
const RadioGroup = React.forwardRef<React.ElementRef<typeof ShadcnRadioGroup>, RadioGroupProps>(
    ({ className, layout, size, ...props }, ref) => (
        <ShadcnRadioGroup
            ref={ref}
            className={cn(radioGroupVariants({ layout, size }), className)}
            {...props}
        />
    )
);
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
    React.ElementRef<typeof ShadcnRadioGroupItem>,
    RadioGroupItemProps
>(({ className, variant, size, state, ...props }, ref) => (
    <ShadcnRadioGroupItem
        ref={ref}
        className={cn(radioGroupItemVariants({ variant, size, state }), className)}
        {...props}
    />
));
RadioGroupItem.displayName = "RadioGroupItem";

// Type pour les options de radio
export interface RadioOption {
    value: string;
    label: React.ReactNode;
    description?: React.ReactNode;
    disabled?: boolean;
}

// Interface pour le composant SimplifiedRadioGroup
export interface SimplifiedRadioGroupProps {
    options: RadioOption[];
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    // Props pour le style
    layout?: VariantProps<typeof radioGroupVariants>["layout"];
    size?: VariantProps<typeof radioGroupVariants>["size"];
    variant?: VariantProps<typeof radioGroupItemVariants>["variant"];
    itemSize?: VariantProps<typeof radioGroupItemVariants>["size"];
    state?: VariantProps<typeof radioGroupItemVariants>["state"];
    // Classes personnalisées
    className?: string;
    itemClassName?: string;
    labelClassName?: string;
    descriptionClassName?: string;
}

// Composant SimplifiedRadioGroup avec API simplifiée
export function SimplifiedRadioGroup({
    options,
    defaultValue,
    value,
    onValueChange,
    name,
    required,
    disabled,
    layout,
    size,
    variant,
    itemSize,
    state,
    className,
    itemClassName,
    labelClassName,
    descriptionClassName,
}: SimplifiedRadioGroupProps) {
    // Déterminer les classes de taille pour le label
    const labelSizeClass =
        itemSize === "sm" ? "text-sm" : itemSize === "lg" ? "text-base" : "text-sm";

    return (
        <RadioGroup
            defaultValue={defaultValue}
            value={value}
            onValueChange={onValueChange}
            name={name}
            required={required}
            disabled={disabled}
            layout={layout}
            size={size}
            className={className}
        >
            {options.map(option => {
                const id = `radio-${name}-${option.value}`;
                return (
                    <div key={option.value} className="flex items-start space-x-2">
                        <RadioGroupItem
                            id={id}
                            value={option.value}
                            disabled={option.disabled || disabled}
                            variant={variant}
                            size={itemSize}
                            state={state}
                            className={itemClassName}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label
                                htmlFor={id}
                                className={cn(
                                    "cursor-pointer font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                                    labelSizeClass,
                                    labelClassName
                                )}
                            >
                                {option.label}
                            </Label>
                            {option.description && (
                                <p
                                    className={cn(
                                        "text-sm text-muted-foreground",
                                        descriptionClassName
                                    )}
                                >
                                    {option.description}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </RadioGroup>
    );
}

// Export des composants
export { RadioGroup, RadioGroupItem };

// Réexporter SimplifiedRadioGroup comme alias pour une meilleure lisibilité dans les imports
export { SimplifiedRadioGroup as SimpleRadioGroup };
