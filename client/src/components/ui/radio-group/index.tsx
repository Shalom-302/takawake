"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import {
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField,
} from "@/components/ui/form";
import { type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils/cn";
import { cva } from "class-variance-authority";

interface RadioGroupSize {
    size?: "sm" | "md";
}

const radioItemVariants = cva(
    [
        "flex shrink-0 cursor-pointer appearance-none items-center justify-center rounded-full bg-primary ring-1 ring-primary ring-inset",
        "data-[state=checked]:enabled:bg-brand-solid data-[state=checked]:enabled:ring-bg-brand-solid",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        "disabled:cursor-not-allowed disabled:bg-disabled_subtle disabled:ring-disabled",
    ],
    {
        variants: {
            size: {
                sm: "size-4",
                md: "size-5",
            },
        },
        defaultVariants: {
            size: "sm",
        },
    }
);

const radioIndicatorVariants = cva(
    "rounded-full bg-fg-white transition-inherit-all data-[state=unchecked]:opacity-0 data-[disabled]:bg-fg-disabled_subtle data-[state=checked]:opacity-100 ",
    {
        variants: {
            size: {
                sm: "size-1.5",
                md: "size-2",
            },
        },
        defaultVariants: {
            size: "sm",
        },
    }
);

export interface RadioGroupProps extends Omit<RadioGroupRootProps, "children"> {
    items: RadioItemProps[];
}

export function RadioGroup({ items, size = "sm", ...props }: RadioGroupProps) {
    return (
        <RadioGroupRoot size={size} {...props}>
            {items.map(item => (
                <RadioItem
                    key={item.value}
                    value={item.value}
                    size={size}
                    label={item.label}
                    description={item.description}
                    disabled={item.disabled}
                />
            ))}
        </RadioGroupRoot>
    );
}

export interface RadioGroupRootProps
    extends React.ComponentProps<typeof RadioGroupPrimitive.Root>,
        RadioGroupSize {
    children: React.ReactNode;
}

function RadioGroupRoot({ className, size = "sm", ...props }: RadioGroupRootProps) {
    return (
        <RadioGroupPrimitive.Root
            className={cn("flex flex-col", size === "sm" ? "gap-2" : "gap-3", className)}
            {...props}
        />
    );
}

export interface RadioItemProps
    extends React.ComponentProps<typeof RadioGroupPrimitive.Item>,
        RadioGroupSize {
    label?: React.ReactNode;
    description?: React.ReactNode;
}

function RadioItem({
    className,
    size = "sm",
    label,
    description,
    disabled,
    ...props
}: RadioItemProps) {
    return (
        <label
            className={cn(
                "flex items-start w-fit",
                size === "sm" ? "gap-2" : "gap-3",
                disabled && "cursor-not-allowed"
            )}
        >
            <RadioGroupPrimitive.Item
                className={cn(
                    radioItemVariants({ size }),
                    (label || description) && "mt-0.5",
                    className
                )}
                disabled={disabled}
                {...props}
            >
                <RadioGroupPrimitive.Indicator className={cn(radioIndicatorVariants({ size }))} />
            </RadioGroupPrimitive.Item>

            {(label || description) && (
                <div className={cn("flex flex-col", size === "md" && "gap-0.5")}>
                    {label && (
                        <p
                            className={cn(
                                "text-secondary select-none",
                                size === "sm" ? "text-sm font-medium" : "text-md font-medium"
                            )}
                        >
                            {label}
                        </p>
                    )}
                    {description && (
                        <span
                            className={cn("text-tertiary", size === "sm" ? "text-sm" : "text-md")}
                        >
                            {description}
                        </span>
                    )}
                </div>
            )}
        </label>
    );
}

export const RadioGroupCustom = {
    Root: RadioGroupRoot,
    Item: RadioItem,
};

export interface RadioGroupFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render">,
        Omit<
            RadioGroupRootProps,
            "name" | "defaultValue" | "value" | "onValueChange" | "children"
        > {
    groupLabel?: string;
    groupLabelTooltip?: string;
    groupDescription?: string;
    isRequired?: boolean;
    wrapperClassName?: string;
    options: RadioItemProps[];
}

export function RadioGroupForm<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    groupLabel,
    groupLabelTooltip,
    groupDescription,
    isRequired,
    size = "sm",
    wrapperClassName,
    className,
    name,
    control,
    options,
    ...props
}: RadioGroupFormProps<TFieldValues, TName>) {
    return (
        <FormField
            name={name}
            control={control}
            {...props}
            render={({ field }) => (
                <FormItem className={wrapperClassName}>
                    {groupLabel && (
                        <FormLabel isRequired={isRequired} labelTooltip={groupLabelTooltip}>
                            {groupLabel}
                        </FormLabel>
                    )}
                    {groupDescription && (
                        <FormDescription
                            className={cn("text-tertiary", size === "sm" ? "text-sm" : "text-md")}
                        >
                            {groupDescription}
                        </FormDescription>
                    )}
                    <FormControl>
                        <RadioGroupRoot
                            size={size}
                            className={className}
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={field.disabled}
                        >
                            {options.map(option => (
                                <RadioItem
                                    key={option.value}
                                    value={option.value}
                                    size={size}
                                    label={option.label}
                                    description={option.description}
                                    disabled={option.disabled || field.disabled}
                                />
                            ))}
                        </RadioGroupRoot>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
