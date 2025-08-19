import * as React from "react";
import "react-phone-number-input/style.css";

import { cn } from "@/lib/utils/cn";
import { type VariantProps } from "class-variance-authority";
import PhoneInput from "react-phone-number-input";
import { inputVariants } from "./input";

function InputPhoneNumber({
    className,
    variant,
    customSize,
    placeholder = "Renseigner un numéro de téléphone",
    value,
    setValue,
}: React.ComponentProps<"input"> &
    VariantProps<typeof inputVariants> & {
        className?: string;
        placeholder?: string;
        value: string;
        setValue: any;
    }) {
    return (
        <>
            <PhoneInput
                placeholder={placeholder}
                value={value}
                onChange={setValue}
                name="p-number"
                className={cn(
                    inputVariants({ variant, customSize, className }),
                    "relative flex px-3 focus:outline-none"
                )}
                defaultCountry="CI" // ou "CI", selon ta cible
                international={true} // important pour forcer le format avec +xxx
                countryCallingCodeEditable={false} // optionnel, pour verrouiller le préfixe
            />
        </>
    );
}

InputPhoneNumber.displayName = "InputPhoneNumber";

export { InputPhoneNumber };
