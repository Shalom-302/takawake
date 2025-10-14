"use client";

import type { ComponentPropsWithRef, RefAttributes } from "react";
import { createContext, useContext, useId } from "react";
// Les imports suivants dépendent de votre configuration de projet.
// Ils sont laissés tels quels car c'est la version finale de votre composant.
import { OTPInput, OTPInputContext } from "input-otp";
import { FormFieldWrapper, type FormFieldWrapperProps } from "@/components/ui/form";
import type { FieldValues, FieldPath } from "react-hook-form";
import { cn } from "@/lib/utils/cn";

// ============================================================================
// Context (Partagé pour la taille et l'état 'disabled')
// ============================================================================

type InputOTPContextType = {
    size: "sm" | "md" | "lg";
    disabled: boolean;
    id: string;
};

const InputOTPContext = createContext<InputOTPContextType | undefined>(undefined);

export const useInputOTPContext = () => {
    const context = useContext(InputOTPContext);

    if (!context) {
        throw new Error("useInputOTPContext must be used within InputOTP");
    }

    return context;
};

// ============================================================================
// Root Component (Conteneur principal et fournisseur de contexte)
// ============================================================================

interface InputOTPRootProps extends ComponentPropsWithRef<"div"> {
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
}

const InputOTPRoot = ({
    className,
    size = "md",
    disabled = false,
    ...props
}: InputOTPRootProps) => {
    const id = useId();

    return (
        <InputOTPContext.Provider value={{ size, disabled, id }}>
            <div role="group" className={cn("flex h-max flex-col gap-1.5", className)} {...props} />
        </InputOTPContext.Provider>
    );
};

// ============================================================================
// Group Component (Wrapper pour le composant headless OTPInput)
// ============================================================================

type InputOTPGroupProps = ComponentPropsWithRef<typeof OTPInput> & {
    width?: number;
    inputClassName?: string;
};

const InputOTPGroup = ({
    inputClassName,
    containerClassName,
    width,
    maxLength = 4,
    ...props
}: InputOTPGroupProps) => {
    const { id, size, disabled } = useInputOTPContext();

    const heights = {
        sm: "h-16.5",
        md: "h-20.5",
        lg: "h-24.5",
    };

    return (
        <OTPInput
            {...props}
            size={width}
            maxLength={maxLength}
            disabled={disabled}
            id={"input-otp-" + id}
            aria-label="Enter your pin"
            aria-labelledby={"input-otp-label-" + id}
            aria-describedby={"input-otp-description-" + id}
            containerClassName={cn(
                "flex items-center gap-3",
                size === "sm" && "gap-2",
                heights[size],
                containerClassName
            )}
            className={cn("w-full! disabled:cursor-not-allowed", inputClassName)}
        />
    );
};

// ============================================================================
// Slot Component (Rendu visuel d'un chiffre)
// ============================================================================

const sizes = {
    sm: "size-16 px-2 py-0.5 text-display-lg font-medium",
    md: "size-20 px-2 py-2.5 text-display-lg font-medium",
    lg: "size-24 px-2 py-3 text-display-xl font-medium",
};

const InputOTPSlot = ({
    index,
    className,
    ...props
}: ComponentPropsWithRef<"div"> & { index: number }) => {
    const { size, disabled } = useInputOTPContext();
    const { slots, isFocused } = useContext(OTPInputContext);
    const slot = slots[index];

    return (
        <div
            {...props}
            aria-label={`Enter digit ${index + 1} of ${slots.length}`}
            className={cn(
                "relative flex items-center justify-center rounded-xl bg-primary text-center text-placeholder_subtle shadow-xs ring-1 ring-primary transition-[box-shadow,background-color] duration-100 ease-linear ring-inset",
                sizes[size],
                isFocused &&
                    slot?.isActive &&
                    "ring-2 ring-brand outline-2 outline-offset-2 outline-brand",
                slot?.char && "text-brand-tertiary_alt ring-2 ring-brand",
                disabled && "bg-disabled_subtle text-fg-disabled_subtle ring-disabled",
                className
            )}
        >
            {/* Affichage du caractère, du curseur ou d'un 0 (placeholder) */}
            {slot?.char ? slot.char : slot?.hasFakeCaret ? <FakeCaret size={size} /> : 0}
        </div>
    );
};

// ============================================================================
// FakeCaret Component (Curseur clignotant pour le slot actif)
// ============================================================================

const FakeCaret = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
    return (
        <div
            className={cn(
                "pointer-events-none h-[1em] w-0.5 animate-caret-blink bg-fg-brand-primary",
                size === "lg" ? "text-display-xl font-medium" : "text-display-lg font-medium"
            )}
        />
    );
};

// ============================================================================
// Separator Component (Séparateur entre les groupes de slots)
// ============================================================================

const InputOTPSeparator = ({ className, ...props }: ComponentPropsWithRef<"div">) => {
    return (
        <div
            role="separator"
            className={cn(
                "text-center text-display-xl font-medium text-placeholder_subtle",
                className
            )}
            {...props}
        >
            -
        </div>
    );
};

// ============================================================================
// Simplified InputOTP Component (Composable pour une utilisation rapide)
// ============================================================================

type InputOTPProps = Omit<InputOTPGroupProps, "children" | "size" | "maxLength"> & {
    slots?: number;
    maxLength?: number;
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    separator?: boolean | number[];
};

export const InputOTP = ({
    slots = 6,
    size = "md",
    disabled = false,
    separator = false,
    maxLength = slots,
    containerClassName,
    inputClassName,
}: InputOTPProps & RefAttributes<HTMLInputElement>) => {
    const renderSlots = () => {
        const elements: React.ReactNode[] = [];

        for (let i = 0; i < slots; i++) {
            elements.push(<InputOTPSlot key={i} index={i} />);

            // Ajout du séparateur
            if (separator) {
                if (Array.isArray(separator)) {
                    // Positions personnalisées
                    if (separator.includes(i + 1) && i < slots - 1) {
                        elements.push(<InputOTPSeparator key={`sep-${i}`} />);
                    }
                } else if (separator === true) {
                    // Séparateur au milieu si slots pair
                    if (i === Math.floor(slots / 2) - 1 && slots % 2 === 0) {
                        elements.push(<InputOTPSeparator key={`sep-${i}`} />);
                    }
                }
            }
        }

        return elements;
    };

    return (
        <InputOTPRoot size={size} disabled={disabled}>
            <InputOTPGroup
                maxLength={maxLength ?? slots}
                containerClassName={containerClassName}
                inputClassName={inputClassName}
            >
                {renderSlots()}
            </InputOTPGroup>
        </InputOTPRoot>
    );
};

// ============================================================================
// Form Integration Component (Wrapper pour React Hook Form)
// ============================================================================
type InputOTPFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<FormFieldWrapperProps<TFieldValues, TName>, "children"> & {
    slots?: number;
    size?: "sm" | "md" | "lg";
    separator?: boolean | number[];
    maxLength?: number;
    disabled?: boolean;
    renderSlots?: (slots: number) => React.ReactNode;
    inputClassName?: string;
    containerClassName?: string;
    containerProps?: Omit<InputOTPRootProps, "size" | "disabled" | "children">;
};

export function InputOTPForm<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    name,
    control,
    rules,
    defaultValue,
    label,
    labelTooltip,
    description,
    isRequired,
    slots = 6,
    size = "md",
    separator = false,
    maxLength,
    disabled = false,
    renderSlots,
    inputClassName,
    containerClassName,
    containerProps,
    ...rest
}: InputOTPFormProps<TFieldValues, TName>) {
    return (
        <FormFieldWrapper
            name={name}
            control={control}
            rules={rules}
            defaultValue={defaultValue}
            label={label}
            labelTooltip={labelTooltip}
            description={description}
            isRequired={isRequired}
        >
            {field => {
                // Si renderSlots est fourni, utiliser la composition manuelle (permet des séparateurs personnalisés)
                if (renderSlots) {
                    return (
                        <InputOTPRoot size={size} disabled={disabled} {...containerProps}>
                            <InputOTPGroup
                                maxLength={maxLength ?? slots}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                inputClassName={inputClassName}
                                containerClassName={containerClassName}
                                {...rest}
                            >
                                {renderSlots(slots)}
                            </InputOTPGroup>
                        </InputOTPRoot>
                    );
                }

                // Sinon, utiliser le composant InputOTP simplifié
                return (
                    <InputOTP
                        slots={slots}
                        size={size}
                        disabled={disabled}
                        separator={separator}
                        maxLength={maxLength ?? slots}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        inputClassName={inputClassName}
                        containerClassName={containerClassName}
                        {...rest}
                    />
                );
            }}
        </FormFieldWrapper>
    );
}

// ============================================================================
// Compound Component Exports
// ============================================================================

export const InputOTPCustom = {
    Root: InputOTPRoot,
    Group: InputOTPGroup,
    Slot: InputOTPSlot,
    Separator: InputOTPSeparator,
};
