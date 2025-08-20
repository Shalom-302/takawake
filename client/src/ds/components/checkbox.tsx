"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Variants pour Checkbox
const checkboxVariants = cva(
    "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
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
            rounded: {
                default: "rounded-[4px]",
                full: "rounded-full",
                none: "rounded-none",
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
            rounded: "default",
            state: "default",
        },
    }
);

// Interface pour les props du Checkbox
export interface CheckboxProps
    extends React.ComponentPropsWithoutRef<typeof ShadcnCheckbox>,
        VariantProps<typeof checkboxVariants> {}

// Composant Checkbox avec variants
const Checkbox = React.forwardRef<React.ElementRef<typeof ShadcnCheckbox>, CheckboxProps>(
    ({ className, variant, size, rounded, state, ...props }, ref) => (
        <ShadcnCheckbox
            ref={ref}
            className={cn(checkboxVariants({ variant, size, rounded, state }), className)}
            {...props}
        />
    )
);
Checkbox.displayName = "Checkbox";

// Interface pour le composant SimplifiedCheckbox
export interface SimplifiedCheckboxProps extends CheckboxProps {
    label?: React.ReactNode;
    description?: React.ReactNode;
    labelPosition?: "right" | "left";
    labelClassName?: string;
    descriptionClassName?: string;
    containerClassName?: string;
}

// Composant SimplifiedCheckbox avec API simplifiée
export function SimplifiedCheckbox({
    label,
    description,
    labelPosition = "right",
    labelClassName,
    descriptionClassName,
    containerClassName,
    id,
    variant,
    size,
    rounded,
    state,
    className,
    ...props
}: SimplifiedCheckboxProps) {
    // Générer un ID unique si aucun n'est fourni
    const checkboxId = id || React.useId();

    // Déterminer les classes de taille pour le label
    const labelSizeClass = size === "sm" ? "text-sm" : size === "lg" ? "text-base" : "text-sm";

    return (
        <div
            className={cn(
                "flex items-start gap-2",
                labelPosition === "left" ? "flex-row-reverse" : "flex-row",
                containerClassName
            )}
        >
            <Checkbox
                id={checkboxId}
                variant={variant}
                size={size}
                rounded={rounded}
                state={state}
                className={className}
                {...props}
            />
            {(label || description) && (
                <div className="grid gap-1.5 leading-none">
                    {label && (
                        <Label
                            htmlFor={checkboxId}
                            className={cn(
                                "cursor-pointer font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                                labelSizeClass,
                                labelClassName
                            )}
                        >
                            {label}
                        </Label>
                    )}
                    {description && (
                        <p className={cn("text-sm text-muted-foreground", descriptionClassName)}>
                            {description}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// Réexporter SimplifiedCheckbox comme alias pour une meilleure lisibilité dans les imports
export { SimplifiedCheckbox as Checkbox };
