"use client";

import * as React from "react";
import { type ReactNode } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { type InputProps, BaseInputVariants, Input } from "./input";
import { FormFieldWrapper, type FormFieldWrapperProps } from "../form";
import { type FieldPath, type FieldValues } from "react-hook-form";

// === INPUT GROUP WRAPPER VARIANTS ===
const inputGroupVariants = cva(
    "group relative flex h-max w-full flex-row justify-center rounded-lg bg-primary transition-all duration-100 ease-linear",
    {
        variants: {
            state: {
                default:
                    "has-[select]:shadow-xs has-[select]:ring-1 has-[select]:ring-border-primary has-[select]:ring-inset has-[select]:has-[input:focus]:ring-2 has-[select]:has-[input:focus]:ring-border-brand",
                disabled:
                    "cursor-not-allowed has-[select]:bg-disabled_subtle has-[select]:ring-border-disabled",
                error: "has-[select]:ring-border-error_subtle has-[select]:has-[input:focus]:ring-border-error",
            },
        },
        defaultVariants: {
            state: "default",
        },
    }
);

// === HELPER FUNCTIONS ===
const getInputGroupPadding = (
    size: BaseInputVariants["size"] = "sm",
    hasLeftAddon: boolean,
    hasRightAddon: boolean,
    hasPrefix: boolean,
    hasTooltip: boolean
): string => {
    const paddings = {
        sm: {
            withLeftAddon: "px-2.5 pl-2.5",
            withRightAddon: hasPrefix ? "pr-9 pl-7" : "pr-9 pl-3",
            normal: "px-3",
        },
        md: {
            withLeftAddon: "px-3 pl-3",
            withRightAddon: hasPrefix ? "pr-6 pl-7.5" : "pr-6 pl-3.5",
            normal: "px-3.5",
        },
    };

    if (hasLeftAddon && hasRightAddon) return "px-2";
    if (hasLeftAddon) return paddings[size!].withLeftAddon;
    if (hasRightAddon) return paddings[size!].withRightAddon;

    return paddings[size!].normal;
};

const getInputWrapperClasses = (
    hasLeftAddon: boolean,
    hasRightAddon: boolean,
    className?: string
): string => {
    return cn(
        "z-10 flex-1",
        hasLeftAddon && "rounded-l-none",
        hasRightAddon && "rounded-r-none",
        // Select-specific styles
        "group-has-[select]:bg-transparent group-has-[select]:shadow-none group-has-[select]:ring-0 group-has-[select]:focus-within:ring-0",
        "group-disabled:group-has-[select]:bg-transparent",
        className
    );
};

// === INPUT GROUP COMPONENT ===
interface InputGroupProps extends Omit<InputProps, "iconLeft" | "iconRight"> {
    /** A leading addon (button, select, etc.) */
    leftAddon?: ReactNode;
    /** A trailing addon */
    rightAddon?: ReactNode;
    /** Inline affix (ex: @, $) */
    leftInputAffix?: ReactNode;
    /** Inline suffix */
    rightInputAffix?: ReactNode;
    containerClassName?: string;
}

function InputGroup({
    prefix,
    size = "sm",
    leftAddon,
    rightAddon,
    leftInputAffix,
    rightInputAffix,
    disabled,
    wrapperClassName,
    containerClassName,
    ...props
}: InputGroupProps) {
    const isInvalid = props["aria-invalid"] === true;

    // Determine component state
    const groupState = disabled ? "disabled" : isInvalid ? "error" : "default";
    const hasLeftAddon = !!leftAddon || !!leftInputAffix;
    const hasRightAddon = !!rightAddon || !!rightInputAffix || !!props.tooltip;

    // Calculate padding for the input based on addons
    const inputPadding = getInputGroupPadding(size, hasLeftAddon, hasRightAddon, !!prefix);

    return (
        <div
            data-input-size={size}
            data-input-wrapper
            className={cn(inputGroupVariants({ state: groupState }), containerClassName)}
        >
            {/* Left Addon */}
            {leftAddon && <section data-leftaddon>{leftAddon}</section>}

            {/* Left Affix */}
            {leftInputAffix && (
                <InputAffix size={size} position="left" isDisabled={disabled}>
                    {leftInputAffix}
                </InputAffix>
            )}

            {/* Main Input */}
            <Input
                size={size}
                prefix={prefix}
                disabled={disabled}
                inputClassName={inputPadding}
                wrapperClassName={getInputWrapperClasses(
                    hasLeftAddon,
                    hasRightAddon,
                    wrapperClassName
                )}
                tooltipClassName={cn(
                    hasRightAddon && !hasLeftAddon && "group-has-[select]:right-0"
                )}
                {...props}
            />

            {/* Right Affix */}
            {rightInputAffix && (
                <InputAffix size={size} position="right" isDisabled={disabled}>
                    {rightInputAffix}
                </InputAffix>
            )}

            {/* Right Addon */}
            {rightAddon && <section data-rightaddon>{rightAddon}</section>}
        </div>
    );
}

// === INPUT AFFIX COMPONENT ===

const inputAffixVariants = cva(
    "flex text-md shadow-xs ring-1 ring-inset text-tertiary ring-border-primary items-center justify-center",
    {
        variants: {
            size: {
                sm: "px-3 py-2",
                md: "px-3.5 py-2.5",
            },
            position: {
                left: "rounded-l-lg -mr-px border-r-0",
                right: "rounded-r-lg -ml-px border-l-0",
            },
        },
        defaultVariants: {
            size: "sm",
        },
    }
);
type InputAffixVariants = VariantProps<typeof inputAffixVariants>;
interface InputAffixProps extends React.HTMLAttributes<HTMLSpanElement>, InputAffixVariants {
    isDisabled?: boolean;
}

function InputAffix({
    className,
    size = "sm",
    position,
    isDisabled,
    children,
    ...props
}: InputAffixProps) {
    return (
        <span
            className={cn(
                inputAffixVariants({
                    size,
                    position,
                }),
                isDisabled && "text-disabled ring-border-disabled bg-disabled_subtle",
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}

// === FORM INTEGRATION ===
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
    ...inputGroupProps
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
                {field => <InputGroup {...field} {...inputGroupProps} />}
            </FormFieldWrapper>
        </div>
    );
}

export { InputGroupForm, InputGroup, InputAffix };
