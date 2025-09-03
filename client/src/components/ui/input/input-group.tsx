"use client";

import * as React from "react";
import { type ReactNode } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { type InputProps, Input } from "./input";
import { FormFieldWrapper, type FormFieldWrapperProps } from "../form";
import { type FieldPath, type FieldValues } from "react-hook-form";

interface InputGroupProps extends Omit<InputProps, "iconLeft" | "iconRight"> {
    /** A prefix text that is displayed in the same box as the input */
    prefix?: string;
    /** A leading addon that is displayed with visual separation from the input */
    leftAddon?: ReactNode;
    /** A trailing addon that is displayed with visual separation from the input */
    rightAddon?: ReactNode;
    /** Container class name */
    containerClassName?: string;
    /** Whether to hide required indicator from label */
    hideRequiredIndicator?: boolean;
}

function InputGroup({ prefix, size, leftAddon, rightAddon, disabled, ...props }: InputGroupProps) {
    const hasLeftAddon = !!leftAddon;
    const hasRightAddon = !!rightAddon;
    const hasPrefix = !!prefix;
    const selectPaddingVariants = cva("", {
        variants: {
            size: {
                sm: "",
                md: "",
            },
            hasLeftAddon: {
                true: "",
                false: "",
            },
            hasRightAddon: {
                true: "",
                false: "",
            },
            hasPrefix: {
                true: "",
                false: "",
            },
        },
        compoundVariants: [
            {
                size: "sm",
                hasLeftAddon: true,
                className: "group-has-[&>select]:px-2.5 group-has-[&>select]:pl-2.5",
            },
            {
                size: "sm",
                hasRightAddon: true,
                hasPrefix: true,
                className: "group-has-[&>select]:pr-6 group-has-[&>select]:pl-0",
            },
            {
                size: "sm",
                hasRightAddon: true,
                hasPrefix: false,
                className: "group-has-[&>select]:pr-6 group-has-[&>select]:pl-3",
            },
            {
                size: "md",
                hasLeftAddon: true,
                className: "group-has-[&>select]:px-3 group-has-[&>select]:pl-3",
            },
            {
                size: "md",
                hasRightAddon: true,
                hasPrefix: true,
                className: "group-has-[&>select]:pr-6 group-has-[&>select]:pl-0",
            },
            {
                size: "md",
                hasRightAddon: true,
                hasPrefix: false,
                className: "group-has-[&>select]:pr-6 group-has-[&>select]:pl-3",
            },
        ],
        defaultVariants: {
            size: "md",
            hasLeftAddon: false,
            hasRightAddon: false,
            hasPrefix: false,
        },
    });
    const inputClass = cn(
        selectPaddingVariants({ size: "sm", hasLeftAddon, hasRightAddon, hasPrefix })
    );

    const prefixClass = size === "sm" ? "pl-3" : "pl-3.5";
    return (
        <div
            data-input-size={size}
            data-input-wrapper
            className={cn(
                "group relative flex h-max w-full flex-row justify-center rounded-lg bg-primary transition-all duration-100 ease-linear",

                // Only apply focus ring when child is select and input is focused
                "has-[&>select]:shadow-xs has-[&>select]:ring-1 has-[&>select]:ring-border-primary has-[&>select]:ring-inset has-[&>select]:has-[input:focus]:ring-2 has-[&>select]:has-[input:focus]:ring-border-brand",
                disabled &&
                    "cursor-not-allowed has-[&>select]:bg-disabled_subtle has-[&>select]:ring-border-disabled",
                props["aria-invalid"] &&
                    "has-[&>select]:ring-border-error_subtle has-[&>select]:has-[input:focus]:ring-border-error"
            )}
        >
            {/* Left Addon */}
            {leftAddon && (
                <section data-leftaddon={leftAddon ? true : undefined}>{leftAddon}</section>
            )}

            {prefix && (
                <span className={cn("my-auto grow pr-2", prefixClass)}>
                    <p className={cn("text-md text-tertiary", disabled && "text-disabled")}>
                        {prefix}
                    </p>
                </span>
            )}

            <Input
                size={size}
                className={inputClass}
                wrapperClassName={cn(
                    "z-10",
                    leftAddon && "rounded-l-none",
                    rightAddon && "rounded-r-none",
                    // When select element is passed as a child
                    "group-has-[&>select]:bg-transparent group-has-[&>select]:shadow-none group-has-[&>select]:ring-0 group-has-[&>select]:focus-within:ring-0",
                    // In `Input` component, there is "group-disabled" class so here we need to use "group-disabled:group-has-[&>select]" to avoid conflict
                    "group-disabled:group-has-[&>select]:bg-transparent"
                )}
                tooltipClassName={cn(rightAddon && !leftAddon && "group-has-[&>select]:right-0")}
                {...props}
            />

            {/* Right Addon */}
            {rightAddon && (
                <section data-rightaddon={rightAddon ? true : undefined}>{rightAddon}</section>
            )}
        </div>
    );
}

const inputPrefixVariants = cva(
    [
        "flex text-md shadow-xs ring-1 ring-inset text-tertiary ring-border-primary",
        "disabled:text-disabled disabled:ring-border-disabled disabled:bg-disabled_subtle",
        // Styles basés sur la position dans le InputGroup
        "in-data-input-wrapper:in-data-[leftaddon=true]:-mr-px in-data-input-wrapper:in-data-[left-addon=true]:rounded-l-lg",
        "in-data-input-wrapper:in-data-[rightaddon=true]:-ml-px in-data-input-wrapper:in-data-[right-addon=true]:rounded-r-lg",
    ],
    {
        variants: {
            size: {
                sm: "px-3 py-2",
                md: "px-3.5 py-2.5",
            },
        },
        defaultVariants: {
            size: "sm",
        },
    }
);

interface InputPrefixProps
    extends React.HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof inputPrefixVariants> {
    isDisabled?: boolean;
}

function InputPrefix({ className, size = "sm", children, ...props }: InputPrefixProps) {
    return (
        <span
            className={inputPrefixVariants({
                size,
                className,
            })}
            {...props}
        >
            {children}
        </span>
    );
}

export interface InputGroupFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldWrapperProps<TFieldValues, TName>, "children">,
        Omit<InputGroupProps, "defaultValue" | "name"> {}

function InputGroupForm<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    control,
    name,
    label,
    description,
    isRequired,
    containerClassName,
    children,
    ...props
}: InputGroupFormProps<TFieldValues, TName>) {
    return (
        <div className={cn("w-full", containerClassName)}>
            <FormFieldWrapper
                control={control}
                name={name}
                label={label}
                description={description}
                isRequired={isRequired}
            >
                {field => (
                    <InputGroup {...field} {...props}>
                        {children}
                    </InputGroup>
                )}
            </FormFieldWrapper>
        </div>
    );
}

export { InputGroupForm, InputGroup, InputPrefix };
