"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Switch as ShadcnSwitch } from "@/components/ui/switch";

const switchVariants = cva(
    "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
                primary: "data-[state=checked]:bg-primary data-[state=unchecked]:bg-primary/30",
                secondary:
                    "data-[state=checked]:bg-secondary data-[state=unchecked]:bg-secondary/30",
                accent: "data-[state=checked]:bg-accent data-[state=unchecked]:bg-accent/30",
                success: "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-green-500/30",
                warning:
                    "data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-yellow-500/30",
                danger: "data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-red-500/30",
                info: "data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-blue-500/30",
            },
            size: {
                sm: "h-4 w-8",
                default: "h-6 w-11",
                lg: "h-8 w-14",
            },
            thumbVariant: {
                default: "[&>span]:bg-background",
                contrast:
                    "[&>span]:data-[state=checked]:bg-white [&>span]:data-[state=unchecked]:bg-gray-300",
                colorful:
                    "[&>span]:data-[state=checked]:bg-white [&>span]:data-[state=unchecked]:bg-background",
            },
            thumbSize: {
                sm: "[&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-4",
                default: "[&>span]:h-5 [&>span]:w-5 [&>span]:data-[state=checked]:translate-x-5",
                lg: "[&>span]:h-7 [&>span]:w-7 [&>span]:data-[state=checked]:translate-x-6",
            },
            withIcon: {
                true: "relative [&>span]:flex [&>span]:items-center [&>span]:justify-center",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            thumbVariant: "default",
            thumbSize: "default",
        },
    }
);

export interface SwitchProps
    extends React.ComponentPropsWithoutRef<typeof ShadcnSwitch>,
        VariantProps<typeof switchVariants> {
    thumbIcon?: React.ReactNode;
}

const Switch = React.forwardRef<React.ElementRef<typeof ShadcnSwitch>, SwitchProps>(
    ({ className, variant, size, thumbVariant, thumbSize, withIcon, thumbIcon, ...props }, ref) => {
        // Créer un nouveau composant avec le thumb personnalisé
        const CustomSwitch = React.forwardRef<
            React.ElementRef<typeof ShadcnSwitch>,
            React.ComponentPropsWithoutRef<typeof ShadcnSwitch>
        >(({ className: innerClassName, ...innerProps }, innerRef) => (
            <ShadcnSwitch className={cn(innerClassName)} ref={innerRef} {...innerProps}>
                {/* Remplacer le thumb par défaut */}
                <span
                    className={cn(
                        "pointer-events-none block rounded-full shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0"
                    )}
                >
                    {thumbIcon}
                </span>
            </ShadcnSwitch>
        ));
        CustomSwitch.displayName = "CustomSwitch";

        // Si nous avons une icône, utiliser le switch personnalisé, sinon utiliser le switch standard
        const SwitchComponent = withIcon ? CustomSwitch : ShadcnSwitch;

        return (
            <SwitchComponent
                className={cn(
                    switchVariants({ variant, size, thumbVariant, thumbSize, withIcon }),
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Switch.displayName = "Switch";

// Interface pour le composant SimplifiedSwitch
export interface SimplifiedSwitchProps extends SwitchProps {
    label?: React.ReactNode;
    description?: React.ReactNode;
    labelPosition?: "right" | "left";
    labelClassName?: string;
    descriptionClassName?: string;
    containerClassName?: string;
}

// Composant SimplifiedSwitch avec API simplifiée
export function SimplifiedSwitch({
    label,
    description,
    labelPosition = "right",
    labelClassName,
    descriptionClassName,
    containerClassName,
    id,
    variant,
    size,
    thumbVariant,
    thumbSize,
    withIcon,
    thumbIcon,
    className,
    ...props
}: SimplifiedSwitchProps) {
    // Générer un ID unique
    const uniqueId = React.useId();
    // Utiliser l'ID fourni ou l'ID généré
    const switchId = id || uniqueId;

    // Déterminer les classes de taille pour le label
    const labelSizeClass = size === "sm" ? "text-sm" : size === "lg" ? "text-base" : "text-sm";

    return (
        <div
            className={cn(
                "flex items-center gap-2",
                labelPosition === "left" ? "flex-row-reverse" : "flex-row",
                containerClassName
            )}
        >
            <Switch
                id={switchId}
                variant={variant}
                size={size}
                thumbVariant={thumbVariant}
                thumbSize={thumbSize}
                withIcon={withIcon}
                thumbIcon={thumbIcon}
                className={className}
                {...props}
            />
            {(label || description) && (
                <div className="grid gap-1.5 leading-none">
                    {label && (
                        <label
                            htmlFor={switchId}
                            className={cn(
                                "cursor-pointer font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                                labelSizeClass,
                                labelClassName
                            )}
                        >
                            {label}
                        </label>
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

// Réexporter SimplifiedSwitch comme alias pour une meilleure lisibilité dans les imports
export { SimplifiedSwitch as Switch };
