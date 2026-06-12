"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { Tooltip } from "@/components/ui/tooltip";
import { HelpCircle, InfoCircle } from "@untitled-ui/icons-react";
import { FormFieldWrapper, FormFieldWrapperProps } from "@/components/ui/form";
import { type FieldPath, type FieldValues } from "react-hook-form";
import { Kbd } from "../kbd";

export const baseInputVariants = cva(
    "peer m-0 w-full bg-transparent text-md text-primary ring-0 outline-hidden placeholder:text-placeholder autofill:rounded-lg autofill:text-primary",
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

export interface BaseInputProps
    extends Omit<React.ComponentProps<"input">, "size">,
        BaseInputVariants {}

export const BaseInput = ({ className, size, type = "text", ...props }: BaseInputProps) => {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(baseInputVariants({ size }), className)}
            {...props}
        />
    );
};

// ============================================
// 2. INPUT WRAPPER (conteneur avec bordure et états)
// ============================================
const inputWrapperVariants = cva(
    "relative flex w-full place-content-center place-items-center rounded-lg bg-primary shadow-xs ring-1 ring-inset transition-shadow duration-100 ease-linear",
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

// ============================================
// 3. INPUT (standalone avec icônes et tooltip)
// ============================================
// ============================================
// 3. INPUT (standalone avec icônes et tooltip)
// ============================================
export interface InputProps extends Omit<BaseInputProps, "className"> {
    /** Tooltip message on hover. */
    tooltip?: string;
    /** Icon component to display on the left side of the input. */
    leftIcon?: React.FC<React.HTMLAttributes<HTMLOrSVGElement>>;
    /** Icon component to display on the right side of the input. */
    rightIcon?: React.FC<React.HTMLAttributes<HTMLOrSVGElement>>;
    /** Keyboard shortcut to display. */
    shortcut?: string | boolean;
    /** Class name for the input wrapper. */
    inputWrapperClassName?: string;
    /** Class name for the input. */
    inputClassName?: string;
    /** Class name for the icon. */
    iconClassName?: string;
    /** Class name for the tooltip. */
    tooltipClassName?: string;
    /** Class name for the shortcut. */
    shortcutClassName?: string;
}

export function Input({
    size = "sm",
    type = "text",
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    tooltip,
    shortcut,
    inputWrapperClassName,
    inputClassName,
    iconClassName,
    tooltipClassName,
    shortcutClassName,
    ...props
}: InputProps) {
    const isInvalid = props["aria-invalid"] === true;
    const disabled = props.disabled;
    const wrapperState = disabled ? "disabled" : isInvalid ? "error" : "default";

    const hasLeftIcon = !!LeftIcon;
    const hasRightIcon = !!RightIcon || !!tooltip || isInvalid;
    const hasShortcut = !!shortcut;

    return (
        <div className={cn(inputWrapperVariants({ state: wrapperState }), inputWrapperClassName)}>
            <BaseInput
                type={type}
                size={size}
                className={cn(
                    hasLeftIcon && (size === "sm" ? "pl-10" : "pl-10.5"),
                    hasRightIcon && (size === "sm" ? "pr-10" : "pr-10.5"),
                    // Ajouter du padding pour le shortcut
                    hasShortcut && (size === "sm" ? "pr-16" : "pr-17"),
                    inputClassName
                )}
                {...props}
            />

            {/* Left Icon */}
            {LeftIcon && (
                <LeftIcon
                    className={cn(
                        "pointer-events-none absolute size-5 text-gray-400 peer-disabled:text-gray-300",
                        size === "sm" ? "left-3" : "left-3.5",
                        iconClassName
                    )}
                />
            )}

            {/* Right Icon (priority: error > tooltip > custom) */}
            {isInvalid ? (
                <InfoCircle
                    className={cn(
                        "pointer-events-none absolute size-5 text-red-500",
                        size === "sm" ? "right-3" : "right-3.5",
                        iconClassName
                    )}
                />
            ) : tooltip ? (
                <div className={cn("absolute", size === "sm" ? "right-3" : "right-3.5")}>
                    <Tooltip
                        trigger={
                            <HelpCircle
                                className={cn(
                                    "size-5 text-gray-400 hover:text-gray-500 transition duration-200 peer-focus:text-gray-500 peer-disabled:text-gray-300"
                                )}
                            />
                        }
                        title={tooltip}
                        contentClassName={tooltipClassName}
                    />
                </div>
            ) : (
                RightIcon && (
                    <RightIcon
                        className={cn(
                            "pointer-events-none absolute size-5 text-gray-400 peer-disabled:text-gray-300",
                            size === "sm" ? "right-3" : "right-3.5",
                            iconClassName
                        )}
                    />
                )
            )}

            {/* Shortcut */}
            {shortcut && (
                <div
                    className={cn(
                        "pointer-events-none absolute inset-y-0.5 right-0.5 z-10 flex items-center rounded-r-[inherit] bg-linear-to-r from-transparent to-primary to-40% pl-8",
                        size === "sm" ? "pr-2.5" : "pr-3"
                    )}
                >
                    <Kbd aria-hidden="true" className={shortcutClassName}>
                        {typeof shortcut === "string" ? shortcut : "⌘K"}
                    </Kbd>
                </div>
            )}
        </div>
    );
}
// ============================================
// 4. FORM INTEGRATION
// ============================================
export interface InputFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldWrapperProps<TFieldValues, TName>, "children">,
        Omit<InputProps, "defaultValue" | "name"> {
    isRequired?: boolean;
}

export function InputForm<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
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
