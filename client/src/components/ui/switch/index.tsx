"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import {
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField,
} from "@/components/ui/form";
import { type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";

const switchRootVariants = cva(
    "cursor-pointer rounded-full outline-focus-ring transition duration-150 ease-linear disabled:cursor-not-allowed disabled:bg-disabled focus-visible:outline-2 focus-visible:outline-offset-2",
    {
        variants: {
            variant: {
                default:
                    "bg-tertiary data-[state=checked]:bg-brand-solid hover:data-[state=checked]:bg-brand-solid_hover",
                slim: "bg-tertiary data-[state=checked]:bg-brand-solid hover:data-[state=checked]:bg-brand-solid_hover ring-1 ring-secondary ring-inset data-[state=checked]:ring-transparent",
            },
            size: {
                sm: "h-5 w-9 p-0.5",
                md: "h-6 w-11 p-0.5",
            },
        },
        compoundVariants: [
            {
                variant: "slim",
                size: "sm",
                class: "h-4 w-8 p-0",
            },
            {
                variant: "slim",
                size: "md",
                class: "h-5 w-10 p-0",
            },
        ],
        defaultVariants: {
            variant: "default",
            size: "sm",
        },
    }
);

const switchThumbVariants = cva(
    "pointer-events-none block rounded-full bg-fg-white shadow-sm transition-transform duration-150 ease-in-out disabled:bg-toggle-button-fg_disabled data-[state=unchecked]:translate-x-0",
    {
        variants: {
            variant: {
                default: "",
                slim: "shadow-xs border border-toggle-border data-[state=checked]:border-toggle-slim-border_pressed hover:data-[state=checked]:border-toggle-slim-border_pressed-hover",
            },
            size: {
                sm: "size-4 data-[state=checked]:translate-x-4",
                md: "size-5 data-[state=checked]:translate-x-5",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "sm",
        },
    }
);

interface SwitchProps
    extends React.ComponentProps<typeof SwitchPrimitive.Root>,
        VariantProps<typeof switchRootVariants> {}

export function Switch({ className, size, variant, ...props }: SwitchProps) {
    return (
        <SwitchPrimitive.Root
            className={cn(switchRootVariants({ variant, size }), className)}
            {...props}
        >
            <SwitchPrimitive.Thumb className={cn(switchThumbVariants({ variant, size }))} />
        </SwitchPrimitive.Root>
    );
}

export interface SwitchFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render">,
        Omit<SwitchProps, "name" | "defaultValue" | "checked" | "onCheckedChange"> {
    label?: string;
    labelTooltip?: string;
    description?: string;
    isRequired?: boolean;
    wrapperClassName?: string;
}

export function SwitchForm<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    label,
    labelTooltip,
    description,
    isRequired,
    size = "sm",
    wrapperClassName,
    className,
    name,
    control,
    variant,
    ...props
}: SwitchFormProps<TFieldValues, TName>) {
    return (
        <FormField
            name={name}
            control={control}
            {...props}
            render={({ field }) => (
                <FormItem>
                    <div
                        className={cn(
                            "flex w-max items-start",
                            size === "sm" ? "gap-2" : "gap-3",
                            wrapperClassName
                        )}
                    >
                        <FormControl>
                            <Switch
                                size={size}
                                className={cn(variant === "slim" && "mt-0.5", className)}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={field.disabled}
                            />
                        </FormControl>

                        {(label || description) && (
                            <div className={cn("flex flex-col", size === "md" && "gap-0.5")}>
                                {label && (
                                    <FormLabel isRequired={isRequired} labelTooltip={labelTooltip}>
                                        {label}
                                    </FormLabel>
                                )}
                                {description && (
                                    <FormDescription
                                        className={cn(
                                            "text-tertiary",
                                            size === "sm" ? "text-sm" : "text-md"
                                        )}
                                        onClick={event => event.stopPropagation()}
                                    >
                                        {description}
                                    </FormDescription>
                                )}
                            </div>
                        )}
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
