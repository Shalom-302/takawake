import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { cva, VariantProps } from "class-variance-authority";
import { Tooltip } from "../tootilp";
import { HelpCircle } from "@untitled-ui/icons-react";
import { FormFieldWrapper, FormFieldWrapperProps } from "../form";
import { type FieldPath, type FieldValues } from "react-hook-form";

// === RESIZE HANDLE SVG ===
const getResizeHandleBg = (color: string) => {
    return `url(data:image/svg+xml;base64,${btoa(`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2L2 10" stroke="${color}" stroke-linecap="round"/><path d="M11 7L7 11" stroke="${color}" stroke-linecap="round"/></svg>`)})`;
};

// === BASE TEXTAREA VARIANTS ===
const baseTextAreaVariants = cva(
    "w-full bg-transparent text-md text-primary ring-0 outline-hidden placeholder:text-placeholder autofill:rounded-lg autofill:text-primary field-sizing-content min-h-[5.5rem] resize-y",
    {
        variants: {
            size: {
                sm: "px-3 py-2",
                md: "px-3.5 py-3",
            },
        },
        defaultVariants: {
            size: "sm",
        },
    }
);

export type BaseTextAreaVariants = VariantProps<typeof baseTextAreaVariants>;

interface BaseTextAreaProps
    extends Omit<React.ComponentProps<"textarea">, "size">,
        BaseTextAreaVariants {}

function BaseTextArea({ className, size, style, ...props }: BaseTextAreaProps) {
    const customStyle = {
        "--resize-handle-bg": getResizeHandleBg("#D5D7DA"),
        "--resize-handle-bg-dark": getResizeHandleBg("#373A41"),
        ...style,
    } as React.CSSProperties;

    return (
        <textarea
            data-slot="textarea"
            className={cn(
                baseTextAreaVariants({ size }),
                // Custom resize handle styling
                "[&::-webkit-resizer]:bg-[image:var(--resize-handle-bg)] [&::-webkit-resizer]:bg-contain",
                "dark:[&::-webkit-resizer]:bg-[image:var(--resize-handle-bg-dark)]",
                className
            )}
            style={customStyle}
            {...props}
        />
    );
}

// === TEXTAREA WRAPPER VARIANTS ===
const textAreaWrapperVariants = cva(
    "relative flex w-full rounded-lg bg-primary shadow-xs ring-1 ring-inset transition-shadow duration-100 ease-linear",
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

// === MAIN TEXTAREA COMPONENT ===
export interface TextAreaProps extends BaseTextAreaProps {
    /** Tooltip message on hover. */
    tooltip?: string;
    /** Class name for the textarea wrapper. */
    wrapperClassName?: string;
    /** Class name for the tooltip. */
    tooltipClassName?: string;
}

function TextArea({
    size = "sm",
    tooltip,
    wrapperClassName,
    tooltipClassName,
    className,
    ...props
}: TextAreaProps) {
    const isInvalid = props["aria-invalid"] === true;
    const disabled = props.disabled;

    // Determine wrapper state
    const wrapperState = disabled ? "disabled" : isInvalid ? "error" : "default";

    return (
        <div className={cn(textAreaWrapperVariants({ state: wrapperState }), wrapperClassName)}>
            <BaseTextArea
                size={size}
                className={cn(
                    size === "sm" ? "pr-9" : "9.5",
                    size === "md" ? "pr-10" : "10.5",
                    className
                )}
                {...props}
            />

            {tooltip && (
                <Tooltip
                    trigger={
                        <HelpCircle
                            className={cn(
                                "absolute size-5 text-fg-quaternary hover:text-fg-quaternary_hover transition duration-200 peer-focus:text-fg-quaternary_hover peer-disabled:text-fg-disabled",
                                size === "sm" ? "top-2 right-3" : "top-3 right-3.5"
                            )}
                        />
                    }
                    content={tooltip}
                    contentClassName={tooltipClassName}
                />
            )}
        </div>
    );
}

// === FORM INTEGRATION ===
export interface TextAreaFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldWrapperProps<TFieldValues, TName>, "children">,
        Omit<TextAreaProps, "defaultValue" | "name"> {}

function TextAreaForm<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
    isRequired,
    control,
    name,
    label,
    description,
    ...textAreaProps
}: TextAreaFormProps<TFieldValues, TName>) {
    return (
        <FormFieldWrapper
            control={control}
            name={name}
            label={label}
            description={description}
            isRequired={isRequired}
        >
            {field => <TextArea {...field} {...textAreaProps} />}
        </FormFieldWrapper>
    );
}

export { TextAreaForm, TextArea };
