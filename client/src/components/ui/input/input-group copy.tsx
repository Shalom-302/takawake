"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";
import { BaseInput, type BaseInputProps } from "@/components/ui/input";
import { BaseTextarea, type BaseTextareaProps } from "@/components/ui/textarea";
import { FormFieldWrapper, FormFieldWrapperProps } from "@/components/ui/form";
import { type FieldPath, type FieldValues } from "react-hook-form";

// ============================================
// MAIN INPUT GROUP WRAPPER
// ============================================

type BaseInputGroupProps = {
    /** Size of the input control */
    size?: "sm" | "md";
    /** Content for left addon (inline-start) */
    leftAddon?: React.ReactNode;
    /** Content for right addon (inline-end) */
    rightAddon?: React.ReactNode;
    /** Content for top addon (block-start) */
    topAddon?: React.ReactNode;
    /** Content for bottom addon (block-end) */
    bottomAddon?: React.ReactNode;
    /** Prefix text/icon content */
    prefix?: React.ReactNode;
};
export type InputGroupProps = BaseInputGroupProps & BaseInputProps;

export function InputGroup({
    size = "sm",
    leftAddon,
    rightAddon,
    topAddon,
    bottomAddon,
    prefix,
    className,
    type = "text",
    ...inputProps
}: InputGroupProps) {
    return (
        <InputGroupRoot className={className}>
            {/* Top Addon */}
            {topAddon && <InputGroupAddon align="block-start">{topAddon}</InputGroupAddon>}

            {/* Left Addon */}
            {leftAddon && <InputGroupAddon align="inline-start">{leftAddon}</InputGroupAddon>}

            {/* Prefix */}
            {prefix && <InputGroupText>{prefix}</InputGroupText>}

            {/* BaseInput/BaseTextarea Control */}
            {type === "textarea" ? (
                <InputGroupTextarea size={size} {...(inputProps as BaseTextareaProps)} />
            ) : (
                <InputGroupInput size={size} {...(inputProps as BaseInputProps)} />
            )}

            {/* Right Addon */}
            {rightAddon && <InputGroupAddon align="inline-end">{rightAddon}</InputGroupAddon>}

            {/* Bottom Addon */}
            {bottomAddon && <InputGroupAddon align="block-end">{bottomAddon}</InputGroupAddon>}
        </InputGroupRoot>
    );
}

function InputGroupRoot({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="input-group"
            data-input-wrapper
            role="group"
            className={cn(
                "group/input-group relative flex w-full items-center rounded-lg bg-primary shadow-xs transition-shadow duration-100 ease-linear outline-none",
                "min-w-0 has-[>textarea]:h-auto",

                // Ring states (cohérent avec inputVariants)
                "ring-1 ring-inset ring-primary",
                "has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-brand",

                // Error state
                "has-[[data-slot][aria-invalid=true]]:ring-error_subtle has-[[data-slot][aria-invalid=true]:focus-visible]:ring-2 has-[[data-slot][aria-invalid=true]:focus-visible]:ring-error",

                // Disabled state
                "has-[[data-slot=input-group-control]:disabled]:bg-disabled_subtle has-[[data-slot=input-group-control]:disabled]:ring-disabled has-[[data-slot=input-group-control]:disabled]:cursor-not-allowed",

                // Variants based on alignment
                "has-[>[data-align=inline-start]]:[&>input]:pl-2",
                "has-[>[data-align=inline-end]]:[&>input]:pr-2",
                "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
                "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",

                className
            )}
            {...props}
        />
    );
}

const inputGroupAddonVariants = cva(
    "text-tertiary flex h-auto cursor-text items-center justify-center gap-2 text-sm font-medium select-none [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[calc(var(--radius)-5px)] group-has-[[data-slot=input-group-control]:disabled]/input-group:opacity-50",
    {
        variants: {
            align: {
                "inline-start":
                    "order-first pl-3 py-2 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
                "inline-end":
                    "order-last pr-3 py-2 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]",
                "block-start":
                    "order-first w-full justify-start px-3.5 pt-2.5 pb-1.5 group-has-[>textarea]/input-group:pt-2",
                "block-end":
                    "order-last w-full justify-start px-3.5 pb-2.5 pt-1.5 group-has-[>textarea]/input-group:pb-2",
            },
        },
        defaultVariants: {
            align: "inline-start",
        },
    }
);

function InputGroupAddon({
    className,
    align = "inline-start",
    ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
    return (
        <div
            role="group"
            data-slot="input-group-addon"
            data-align={align}
            data-left={align === "inline-start" || undefined}
            data-right={align === "inline-end" || undefined}
            className={cn(inputGroupAddonVariants({ align }), className)}
            onClick={e => {
                if ((e.target as HTMLElement).closest("button")) {
                    return;
                }
                e.currentTarget.parentElement?.querySelector("input")?.focus();
            }}
            {...props}
        />
    );
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
    return (
        <span
            className={cn(
                "text-tertiary flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5",
                className
            )}
            {...props}
        />
    );
}

function InputGroupInput({ className, size = "sm", ...props }: BaseInputProps) {
    return (
        <BaseInput data-slot="input-group-control" size={size} className={className} {...props} />
    );
}

function InputGroupTextarea({ className, size = "sm", ...props }: BaseTextareaProps) {
    return (
        <BaseTextarea
            data-slot="input-group-control"
            size={size}
            className={className}
            {...props}
        />
    );
}

// ============================================
// COMPOSABLE PARTS (for advanced usage)
// ============================================
export const InputGroupCustom = {
    Root: InputGroupRoot,
    Addon: InputGroupAddon,
    Text: InputGroupText,
    BaseInput: InputGroupInput,
    BaseTextarea: InputGroupTextarea,
};

// ============================================
// FORM INTEGRATION
// ============================================
type BaseInputGroupFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<FormFieldWrapperProps<TFieldValues, TName>, "children"> &
    Omit<BaseInputGroupProps, "inputProps"> & {
        isRequired?: boolean;
    };

export type InputGroupFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = BaseInputGroupFormProps<TFieldValues, TName> &
    (
        | {
              type?: "input";
              inputProps?: Omit<BaseInputProps, "defaultValue" | "name">;
          }
        | {
              type: "textarea";
              inputProps?: Omit<BaseTextareaProps, "defaultValue" | "name">;
          }
    );

export function InputGroupForm<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    isRequired,
    control,
    name,
    label,
    labelTooltip,
    description,
    type = "input",
    size = "sm",
    leftAddon,
    rightAddon,
    topAddon,
    bottomAddon,
    prefix,
    inputProps,
}: InputGroupFormProps<TFieldValues, TName>) {
    return (
        <FormFieldWrapper
            control={control}
            name={name}
            label={label}
            labelTooltip={labelTooltip}
            description={description}
            isRequired={isRequired}
        >
            {field => (
                <InputGroupRoot>
                    {/* Top Addon */}
                    {topAddon && <InputGroupAddon align="block-start">{topAddon}</InputGroupAddon>}

                    {/* Left Addon */}
                    {leftAddon && (
                        <InputGroupAddon align="inline-start">{leftAddon}</InputGroupAddon>
                    )}

                    {/* Prefix */}
                    {prefix && <InputGroupText>{prefix}</InputGroupText>}

                    {/* Input/Textarea Control */}
                    {type === "textarea" ? (
                        <InputGroupTextarea
                            size={size}
                            {...field}
                            {...(inputProps as BaseTextareaProps)}
                        />
                    ) : (
                        <InputGroupInput
                            size={size}
                            {...field}
                            {...(inputProps as BaseInputProps)}
                        />
                    )}

                    {/* Right Addon */}
                    {rightAddon && (
                        <InputGroupAddon align="inline-end">{rightAddon}</InputGroupAddon>
                    )}

                    {/* Bottom Addon */}
                    {bottomAddon && (
                        <InputGroupAddon align="block-end">{bottomAddon}</InputGroupAddon>
                    )}
                </InputGroupRoot>
            )}
        </FormFieldWrapper>
    );
}
