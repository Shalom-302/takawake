"use client";

import * as React from "react";
import { type ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { type InputProps, BaseInputVariants, Input } from "./input";
import { FormFieldWrapper, type FormFieldWrapperProps } from "../form";
import { type FieldPath, type FieldValues } from "react-hook-form";

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

const getInputGroupPadding = (
    size: BaseInputVariants["size"] = "sm",
    hasLeading: boolean,
    hasTrailing: boolean,
    hasPrefix: boolean
): string => {
    const paddings = {
        sm: {
            withLeading: "group-has-[select]:px-2.5 group-has-[select]:pl-2.5",
            withTrailing: hasPrefix
                ? "group-has-[select]:pr-6 group-has-[select]:pl-0"
                : "group-has-[select]:pr-6 group-has-[select]:pl-3",
            normal: "px-3",
        },
        md: {
            withLeading: "group-has-[select]:px-3 group-has-[select]:pl-3",
            withTrailing: hasPrefix
                ? "group-has-[select]:pr-6 group-has-[select]:pl-0"
                : "group-has-[select]:pr-6 group-has-[select]:pl-3.5",
            normal: "px-3.5",
        },
    };

    const classes = [];

    if (hasLeading) {
        classes.push(paddings[size!].withLeading);
    }
    if (hasTrailing) {
        classes.push(paddings[size!].withTrailing);
    }
    if (!hasLeading && !hasTrailing) {
        classes.push(paddings[size!].normal);
    }

    return classes.join(" ");
};

const getInputWrapperClasses = (
    hasLeading: boolean,
    hasTrailing: boolean,
    className?: string
): string => {
    return cn(
        "z-10 flex-1",
        hasLeading && "rounded-l-none",
        hasTrailing && "rounded-r-none",
        // Select-specific styles
        "group-has-[select]:bg-transparent group-has-[select]:shadow-none group-has-[select]:ring-0 group-has-[select]:focus-within:ring-0",
        "group-disabled:group-has-[select]:bg-transparent",
        className
    );
};

const getPrefixPadding = (size: BaseInputVariants["size"] = "sm") => {
    return size === "md" ? "pl-3.5" : "pl-3";
};

// === INPUT GROUP COMPONENT ===
interface InputGroupProps extends Omit<InputProps, "leftIcon" | "rightIcon"> {
    /** A prefix text that is displayed in the same box as the input. */
    prefix?: string;
    /** A left addon that is displayed with visual separation from the input. */
    leftAddon?: ReactNode;
    /** A right addon that is displayed with visual separation from the input. */
    rightAddon?: ReactNode;
    containerClassName?: string;
}

function InputGroup({
    prefix,
    size = "sm",
    leftAddon,
    rightAddon,
    disabled,
    wrapperClassName,
    containerClassName,
    ...props
}: InputGroupProps) {
    const isInvalid = props["aria-invalid"] === true;

    // Determine component state
    const groupState = disabled ? "disabled" : isInvalid ? "error" : "default";
    const hasLeading = !!leftAddon;
    const hasTrailing = !!rightAddon;

    // Calculate padding for the input based on addons
    const inputPadding = getInputGroupPadding(size, hasLeading, hasTrailing, !!prefix);

    return (
        <div
            data-input-size={size}
            data-input-wrapper
            className={cn(inputGroupVariants({ state: groupState }), containerClassName)}
        >
            {/* Leading Addon */}
            {leftAddon && <section data-leading={hasLeading || undefined}>{leftAddon}</section>}

            {/* Prefix text inside input */}
            {prefix && (
                <span className={cn("my-auto pr-2", getPrefixPadding(size))}>
                    <p className={cn("text-md text-tertiary", disabled && "text-disabled")}>
                        {prefix}
                    </p>
                </span>
            )}

            {/* Main Input */}
            <Input
                size={size}
                disabled={disabled}
                inputClassName={inputPadding}
                wrapperClassName={getInputWrapperClasses(hasLeading, hasTrailing, wrapperClassName)}
                tooltipClassName={cn(hasTrailing && !hasLeading && "group-has-[select]:right-0")}
                {...props}
            />

            {/* Right Addon */}
            {rightAddon && <section data-trailing={hasTrailing || undefined}>{rightAddon}</section>}
        </div>
    );
}

// === INPUT PREFIX COMPONENT ===
interface InputAffixProps extends React.HTMLAttributes<HTMLSpanElement> {
    isDisabled?: boolean;
}

function InputAffix({ isDisabled, children, className, ...props }: InputAffixProps) {
    return (
        <span
            {...props}
            className={cn(
                "flex text-md text-tertiary shadow-xs ring-1 ring-border-primary ring-inset items-center justify-center",
                // Styles when the prefix is within an `InputGroup`
                "in-data-input-wrapper:in-data-leading:-mr-px in-data-input-wrapper:in-data-leading:rounded-l-lg",
                "in-data-input-wrapper:in-data-trailing:-ml-px in-data-input-wrapper:in-data-trailing:rounded-r-lg",
                "in-data-input-wrapper:in-data-[input-size=md]:py-2.5 in-data-input-wrapper:in-data-[input-size=md]:pr-3 in-data-input-wrapper:in-data-[input-size=md]:pl-3.5 in-data-input-wrapper:in-data-[input-size=sm]:px-3 in-data-input-wrapper:in-data-[input-size=sm]:py-2",
                isDisabled && "border-disabled bg-disabled_subtle text-disabled",
                "in-data-input-wrapper:group-disabled:bg-disabled_subtle in-data-input-wrapper:group-disabled:text-disabled in-data-input-wrapper:group-disabled:ring-border-disabled",
                className
            )}
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
