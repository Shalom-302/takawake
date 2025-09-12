"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
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
import { cva, VariantProps } from "class-variance-authority";

const checkboxVariants = cva(
    [
        "flex size-4 shrink-0 cursor-pointer appearance-none items-center justify-center rounded bg-primary ring-1 ring-primary ring-inset",
        "data-[state=checked]:bg-brand-solid data-[state=checked]:ring-bg-brand-solid",
        "data-[state=indeterminate]:bg-brand-solid data-[state=indeterminate]:ring-bg-brand-solid",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        "disabled:cursor-not-allowed disabled:bg-disabled_subtle disabled:ring-disabled",
    ],
    {
        variants: {
            size: {
                sm: "size-4 rounded-xs",
                md: "size-5 rounded-sm",
            },
        },
        defaultVariants: {
            size: "sm",
        },
    }
);

export type CheckboxVariantProps = VariantProps<typeof checkboxVariants>;

export interface CheckboxProps
    extends React.ComponentProps<typeof CheckboxPrimitive.Root>,
        CheckboxVariantProps {}

export function Checkbox({ size, className, ...props }: CheckboxProps) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(checkboxVariants({ size }), className)}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="flex items-center justify-center text-current transition-none"
            >
                {props.checked === "indeterminate" ? (
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 14 14"
                        fill="none"
                        className={cn(
                            "pointer-events-none h-3 w-2.5 text-fg-white transition-inherit-all",
                            size === "md" && "size-3.5",
                            props.disabled && "text-fg-disabled_subtle"
                        )}
                    >
                        <path
                            d="M2.91675 7H11.0834"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                ) : (
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 14 14"
                        fill="none"
                        className={cn(
                            "pointer-events-none size-3 text-fg-white transition-inherit-all",
                            size === "md" && "size-3.5",
                            props.disabled && props.checked && "text-fg-disabled_subtle"
                        )}
                    >
                        <path
                            d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

export interface CheckboxFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render">,
        Omit<
            CheckboxProps,
            "name" | "defaultValue" | "defaultChecked" | "checked" | "onCheckedChange"
        > {
    label?: string;
    labelTooltip?: string;
    description?: string;
    isRequired?: boolean;
    wrapperClassName?: string;
}

export function CheckboxForm<
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
    ...props
}: CheckboxFormProps<TFieldValues, TName>) {
    return (
        <FormField
            name={name}
            control={control}
            {...props}
            render={({ field }) => (
                <FormItem>
                    <div
                        className={cn(
                            "flex items-start",
                            size === "sm" ? "gap-2" : "gap-3",
                            wrapperClassName
                        )}
                    >
                        <FormControl>
                            <Checkbox
                                size={size}
                                className={cn((label || description) && "mt-0.5", className)}
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
                                        onClick={e => e.stopPropagation()}
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
