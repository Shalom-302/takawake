"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
    Controller,
    FormProvider,
    useFormContext,
    useFormState,
    type FormProviderProps,
    type ControllerProps,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";

import Label from "@/components/starter_ui/label";
import { cn } from "@/lib/utils/cn";
import Typography from "./typography";

export function Form<
    TFieldValues extends FieldValues,
    TContext = unknown,
    TTransformedValues extends FieldValues | undefined = undefined,
>({ ...props }: FormProviderProps<TFieldValues, TContext, TTransformedValues>) {
    return <FormProvider {...props} />;
}

type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    ...props
}: ControllerProps<TFieldValues, TName>) => {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    );
};
Form.Field = FormField;

const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext);
    const itemContext = React.useContext(FormItemContext);
    const { getFieldState } = useFormContext();
    const formState = useFormState({ name: fieldContext.name });
    const fieldState = getFieldState(fieldContext.name, formState);

    if (!fieldContext) {
        throw new Error("useFormField should be used within <FormField>");
    }

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

type FormItemContextValue = {
    id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
    const id = React.useId();

    return (
        <FormItemContext.Provider value={{ id }}>
            <div data-slot="form-item" className={cn("grid", className)} {...props} />
        </FormItemContext.Provider>
    );
}
Form.Item = FormItem;

function FormLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
    const { error, formItemId } = useFormField();

    return (
        <Label
            data-slot="form-label"
            data-error={!!error}
            className={className}
            htmlFor={formItemId}
            {...props}
        />
    );
}
Form.Label = FormLabel;

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    return (
        <Slot
            data-slot="form-control"
            id={formItemId}
            aria-describedby={
                !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`
            }
            aria-invalid={!!error}
            {...props}
        />
    );
}
Form.Control = FormControl;

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
    const { formDescriptionId } = useFormField();

    return (
        <Typography
            variant={"text-sm"}
            as={"p"}
            data-slot="form-description"
            id={formDescriptionId}
            className={cn("text-tertiary", className)}
            {...props}
        />
    );
}
Form.Description = FormDescription;

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message ?? "") : props.children;

    if (!body) {
        return null;
    }

    return (
        <Typography
            variant={"text-sm"}
            as={"p"}
            data-slot="form-message"
            id={formMessageId}
            className={cn("text-[var(--text-color-error-primary)]", className)}
            {...props}
        >
            {body}
        </Typography>
    );
}
Form.Message = FormMessage;
