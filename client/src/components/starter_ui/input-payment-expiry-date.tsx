import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { inputVariants } from "./input";
import { usePaymentInputs } from "react-payment-inputs";

function InputPaymentExpiryDate({
    className,
    variant,
    customSize,
    id,
    expiryDate,
    setExpiryDate,
    ...props
}: React.ComponentProps<"input"> &
    VariantProps<typeof inputVariants> & {
        className?: string;
        id: string;
        expiryDate?: string;
        setExpiryDate: React.Dispatch<React.SetStateAction<undefined>> | null;
    }) {
    const { getExpiryDateProps } = usePaymentInputs();

    const handleChangeExpiryDate = (e: any) => {
        if (setExpiryDate) {
            setExpiryDate(e.target.value);
        }
    };

    return (
        <>
            <div
                className={cn(
                    inputVariants({ variant, customSize, className }),
                    "relative flex border"
                )}
            >
                <input
                    className={cn("h-full w-full focus:outline-none placeholder:text-sm", `px-3`)}
                    {...getExpiryDateProps({ onChange: handleChangeExpiryDate })}
                    {...props}
                />
            </div>
        </>
    );
}

InputPaymentExpiryDate.displayName = "InputPaymentExpiryDate";

export { InputPaymentExpiryDate };
