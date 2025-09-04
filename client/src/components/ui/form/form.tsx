"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
    Controller,
    FormProvider,
    useFormContext,
    useFormState,
    type ControllerProps,
    type ControllerRenderProps,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";

import { cn } from "@/lib/utils/cn";
import { Label } from "@/components/ui/label";

// === FORM PROVIDER ===
const Form = FormProvider;

// === FORM FIELD CONTEXT ===
type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

// === FORM FIELD COMPONENT ===
export type FormFieldProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ControllerProps<TFieldValues, TName>;

const FormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    ...props
}: FormFieldProps<TFieldValues, TName>) => {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    );
};

// === FORM FIELD HOOK ===
const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext);
    const itemContext = React.useContext(FormItemContext);
    const { getFieldState } = useFormContext();

    if (!fieldContext) {
        throw new Error("useFormField should be used within <FormField>");
    }

    const formState = useFormState({ name: fieldContext.name });
    const fieldState = getFieldState(fieldContext.name, formState);

    const { id } = itemContext;

    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    };
};

// === FORM ITEM CONTEXT ===
type FormItemContextValue = {
    id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

// === FORM ITEM COMPONENT ===

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
    const id = React.useId();

    return (
        <FormItemContext.Provider value={{ id }}>
            <div data-slot="form-item" className={cn("grid gap-2", className)} {...props} />
        </FormItemContext.Provider>
    );
}

// === FORM LABEL COMPONENT ===
interface FormLabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
    isRequired?: boolean;
    hideRequiredIndicator?: boolean;
}

function FormLabel({
    className,
    isRequired,
    hideRequiredIndicator,
    children,
    ...props
}: FormLabelProps) {
    const { formItemId } = useFormField();

    return (
        <Label
            data-slot="form-label"
            isRequired={isRequired && !hideRequiredIndicator}
            className={className}
            htmlFor={formItemId}
            {...props}
        >
            {children}
        </Label>
    );
}

// === FORM CONTROL COMPONENT ===
function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    return (
        <Slot
            data-slot="form-control"
            id={formItemId}
            aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
            aria-invalid={!!error}
            {...props}
        />
    );
}

// === FORM DESCRIPTION COMPONENT ===

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
    const { formDescriptionId } = useFormField();
    return (
        <p
            data-slot="form-description"
            id={formDescriptionId}
            className={cn("text-sm text-tertiary", className)}
            {...props}
        />
    );
}

// === FORM MESSAGE COMPONENT ===

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message ?? "") : props.children;

    if (!body) {
        return null;
    }

    return (
        <p
            data-slot="form-message"
            id={formMessageId}
            className={cn("text-sm text-error-primary", className)}
            {...props}
        >
            {body}
        </p>
    );
}

// === FORM FIELD WRAPPER ===
export interface FormFieldWrapperProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
    label?: string;
    description?: string;
    isRequired?: boolean;
    hideRequiredIndicator?: boolean;
    children: (field: ControllerRenderProps<TFieldValues, TName>) => React.ReactNode;
}

function FormFieldWrapper<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
    name,
    label,
    description,
    control,
    rules,
    defaultValue,
    isRequired,
    hideRequiredIndicator,
    children,
}: FormFieldWrapperProps<TFieldValues, TName>) {
    // Merge isRequired into rules if provided
    const mergedRules = React.useMemo(() => {
        if (isRequired && rules) {
            return { ...rules, required: rules.required || "Ce champ est requis" };
        }
        if (isRequired && !rules) {
            return { required: "Ce champ est requis" };
        }
        return rules;
    }, [isRequired, rules]);

    return (
        <FormField
            name={name}
            control={control}
            rules={mergedRules}
            defaultValue={defaultValue}
            render={({ field }) => (
                <FormItem>
                    {label && (
                        <FormLabel
                            isRequired={isRequired}
                            hideRequiredIndicator={hideRequiredIndicator}
                        >
                            {label}
                        </FormLabel>
                    )}
                    <FormControl>{children(field)}</FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

// === EXPORTS ===
export {
    FormFieldWrapper,
    useFormField,
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField,
};
