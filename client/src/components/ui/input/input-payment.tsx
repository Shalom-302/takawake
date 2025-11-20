import * as React from "react";
import { cn } from "@/lib/utils/cn";
import {
    AmexIcon,
    DiscoverIcon,
    MastercardIcon,
    UnionPayIcon,
    VisaIcon,
} from "@/components/icons/_old/payment-icons";
import { FormFieldWrapper, FormFieldWrapperProps } from "../form";
import { type FieldPath, type FieldValues } from "react-hook-form";
import { HelpCircle, InfoCircle } from "@untitled-ui/icons-react";
import { Tooltip } from "../tooltip";

const cardTypes = [
    {
        name: "Visa",
        pattern: /^4[0-9]{3,}$/,
        card: "visa",
        icon: VisaIcon,
    },
    {
        name: "MasterCard",
        pattern: /^5[1-5][0-9]{2,}$/,
        card: "mastercard",
        icon: MastercardIcon,
    },
    {
        name: "American Express",
        pattern: /^3[47][0-9]{2,}$/,
        card: "amex",
        icon: AmexIcon,
    },
    {
        name: "Discover",
        pattern: /^6(?:011|5[0-9]{2}|4[4-9][0-9])[0-9]{12}$/,
        card: "discover",
        icon: DiscoverIcon,
    },
    {
        name: "UnionPay",
        pattern: /^(62|88)[0-9]{14,17}$/,
        card: "unionpay",
        icon: UnionPayIcon,
    },
    {
        name: "Unknown",
        pattern: /.*/,
        card: "unknown",
        icon: MastercardIcon,
    },
];

/**
 * Detect the card type based on the card number.
 */
const detectCardType = (number: string) => {
    const sanitizedNumber = number.replace(/\D/g, "");
    const card = cardTypes.find(cardType => cardType.pattern.test(sanitizedNumber));
    return card || cardTypes[cardTypes.length - 1];
};

/**
 * Format the card number in groups of 4 digits.
 */
export const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, "");
    const match = cleaned.match(/\d{1,4}/g);
    if (match) {
        return match.join(" ");
    }
    return cleaned;
};

const paymentInputWrapperVariants =
    "relative flex w-full flex-row place-content-center place-items-center rounded-lg bg-primary shadow-xs ring-1 ring-inset transition-shadow duration-100 ease-linear";

const getWrapperStateClass = (isInvalid: boolean, disabled?: boolean) => {
    if (disabled) return "cursor-not-allowed bg-disabled_subtle ring-disabled";
    if (isInvalid) return "ring-error_subtle focus-within:ring-2 focus-within:ring-error";
    return "ring-primary focus-within:ring-2 focus-within:ring-brand";
};

export interface PaymentInputProps
    extends Omit<React.ComponentProps<"input">, "size" | "onChange"> {
    /** Value of the input (controlled) */
    value?: string;
    /** Default value (uncontrolled) */
    defaultValue?: string;
    /** Callback when value changes */
    onChange?: (value: string) => void;
    /** Class name for the input wrapper */
    inputWrapperClassName?: string;
    /** Class name for the input */
    inputClassName?: string;
    /** Class name for the icon */
    iconClassName?: string;
    /** Size variant */
    size?: "sm" | "md";
    /** Tooltip message on hover. */
    tooltip?: string;
    /** Class name for the tooltip. */
    tooltipClassName?: string;
}

function PaymentInput({
    value: controlledValue,
    defaultValue,
    onChange,
    inputWrapperClassName,
    inputClassName,
    iconClassName,
    size = "sm",
    maxLength = 19,
    tooltip,
    tooltipClassName,
    ...props
}: PaymentInputProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "");
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, "");

        if (!isControlled) {
            setInternalValue(rawValue);
        }

        onChange?.(rawValue);
    };

    const isInvalid = props["aria-invalid"] === true;
    const disabled = props.disabled;
    const card = detectCardType(value);
    const CardIcon = card.icon;

    return (
        <div
            className={cn(
                paymentInputWrapperVariants,
                getWrapperStateClass(isInvalid, disabled),
                inputWrapperClassName
            )}
        >
            <input
                type="text"
                inputMode="numeric"
                data-slot="input"
                className={cn(
                    "peer m-0 w-full bg-transparent text-md text-primary ring-0 outline-hidden placeholder:text-placeholder autofill:rounded-lg autofill:text-primary",
                    size === "sm" ? "px-3 py-2 pl-13" : "px-3.5 py-2.5 pl-13.5",
                    inputClassName
                )}
                value={formatCardNumber(value)}
                onChange={handleChange}
                maxLength={maxLength}
                {...props}
            />

            <CardIcon
                className={cn(
                    "pointer-events-none absolute h-6 w-8.5 peer-disabled:opacity-50",
                    size === "sm" ? "left-2.5" : "left-3",
                    iconClassName
                )}
            />
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
            ) : null}
        </div>
    );
}

// === FORM INTEGRATION ===
export interface PaymentInputFormProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<FormFieldWrapperProps<TFieldValues, TName>, "children">,
        Omit<PaymentInputProps, "defaultValue" | "name"> {
    isRequired?: boolean;
}

function PaymentInputForm<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
    isRequired,
    control,
    name,
    label,
    description,
    ...inputProps
}: PaymentInputFormProps<TFieldValues, TName>) {
    return (
        <FormFieldWrapper
            control={control}
            name={name}
            label={label}
            description={description}
            isRequired={isRequired}
        >
            {field => <PaymentInput {...field} {...inputProps} />}
        </FormFieldWrapper>
    );
}

export { PaymentInputForm, PaymentInput };
