import * as React from "react";

import { cn } from "@/lib/utils/cn";
import { cva, VariantProps } from "class-variance-authority";
import { Tooltip } from "../tootilp";
import { HelpCircle, InfoCircle } from "@untitled-ui/icons-react";
import { FormFieldWrapper, FormFieldWrapperProps } from "../form";
import { type FieldPath, type FieldValues } from "react-hook-form";

const baseInputVariants = cva(
    "peer m-0 w-full bg-transparent text-md text-primary ring-0 outline-hidden placeholder:text-placeholder autofill:rounded-lg autofill:text-primary ",
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

export type BaseInputVariants = VariantProps<typeof baseInputVariants>;

interface BaseInputProps extends Omit<React.ComponentProps<"input">, "size">, BaseInputVariants {}

function BaseInput({ className, size, type, ...props }: BaseInputProps) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(baseInputVariants({ size }), className)}
            {...props}
        />
    );
}

// === INPUT WRAPPER VARIANTS ===
const inputWrapperVariants = cva(
    "relative flex w-full flex-row place-content-center place-items-center rounded-lg bg-primary shadow-xs ring-1 ring-inset transition-shadow duration-100 ease-linear",
    {
        variants: {
            state: {
                default: "ring-primary focus-within:ring-2 focus-within:ring-brand",
                error: "ring-error_subtle focus-within:ring-2 focus-within:ring-error",
                disabled: "cursor-not-allowed bg-disabled_subtle ring-disabled",
            },
        },
        defaultVariants: {
            state: "default",
        },
    }
);

export interface InputProps extends Omit<BaseInputProps, "className"> {
    /** Tooltip message on hover. */
    tooltip?: string;
    /** Icon component to display on the left side of the input. */
    leftIcon?: React.ComponentType<React.HTMLAttributes<HTMLOrSVGElement>>;
    /** Icon component to display on the right side of the input. */
    rightIcon?: React.ComponentType<React.HTMLAttributes<HTMLOrSVGElement>>;
    /** Class name for the input wrapper. */
    inputWrapperClassName?: string;
    /** Class name for the input . */
    inputClassName?: string;
    /** Class name for the icon. */
    iconClassName?: string;
    /** Class name for the tooltip. */
    tooltipClassName?: string;
}

function Input({
    size = "sm",
    type = "text",
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    tooltip,
    inputWrapperClassName,
    inputClassName,
    iconClassName,
    tooltipClassName,
    ...props
}: InputProps) {
    const isInvalid = props["aria-invalid"] === true;
    const disabled = props.disabled;
    const wrapperState = disabled ? "disabled" : isInvalid ? "error" : "default";
    const hasLeftIcon = !!LeftIcon;
    const hasRightIcon = !!RightIcon || !!tooltip || isInvalid;
    return (
        <div className={cn(inputWrapperVariants({ state: wrapperState }), inputWrapperClassName)}>
            <BaseInput
                type={type}
                size={size}
                className={cn(
                    size === "sm" ? hasLeftIcon && "pl-10" : hasRightIcon && "pr-9",
                    size === "md" ? hasLeftIcon && "pl-10.5" : hasRightIcon && "pr-9.5",
                    inputClassName
                )}
                {...props}
            />

            {LeftIcon && (
                <LeftIcon
                    className={cn(
                        "pointer-events-none absolute size-5 text-fg-quaternary peer-disabled:text-fg-disabled",
                        size === "sm" ? "left-3" : "left-3.5",
                        iconClassName
                    )}
                />
            )}

            {isInvalid ? (
                <InfoCircle
                    className={cn(
                        "pointer-events-none absolute size-5 text-fg-error-secondary",
                        size === "sm" ? "right-3" : "right-3.5",
                        iconClassName
                    )}
                />
            ) : tooltip ? (
                <Tooltip
                    trigger={
                        <HelpCircle
                            className={cn(
                                "absolute size-5 text-fg-quaternary hover:text-fg-quaternary_hover transition duration-200 peer-focus:text-fg-quaternary_hover peer-disabled:text-fg-disabled",
                                size === "sm" ? "right-3" : "right-3.5"
                            )}
                        />
                    }
                    title={tooltip}
                    contentClassName={tooltipClassName}
                />
            ) : (
                RightIcon &&
                !isInvalid && (
                    <RightIcon
                        className={cn(
                            "pointer-events-none absolute size-5 text-fg-quaternary peer-disabled:text-fg-disabled",
                            size === "sm" ? "right-3" : "right-3.5",
                            iconClassName
                        )}
                    />
                )
            )}
        </div>
    );
}

// === FORM INTEGRATION ===
export interface InputFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldWrapperProps<TFieldValues, TName>, "children">,
        Omit<InputProps, "defaultValue" | "name"> {
    isRequired?: boolean;
}

function InputForm<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
    isRequired,
    control,
    name,
    label,
    description,
    ...inputProps
}: InputFormProps<TFieldValues, TName>) {
    return (
        <FormFieldWrapper
            control={control}
            name={name}
            label={label}
            description={description}
            isRequired={isRequired}
        >
            {field => <Input {...field} {...inputProps} />}
        </FormFieldWrapper>
    );
}

export { InputForm, Input };
