import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { type VariantProps } from "class-variance-authority";
import { inputVariants } from "./input";
import { usePaymentInputs } from "react-payment-inputs";

function InputPaymentCvc({
    className,
    variant,
    customSize,
    id,
    cvc,
    setCvc,
    ...props
}: React.ComponentProps<"input"> &
    VariantProps<typeof inputVariants> & {
        className?: string;
        id: string;
        cvc?: string;
        setCvc: React.Dispatch<React.SetStateAction<undefined>> | null;
    }) {
    const { getCVCProps } = usePaymentInputs();

    const handleChangeCVC = (e: any) => {
        if (setCvc) {
            setCvc(e.target.value);
        }
    };

    return (
        <>
            <div
                className={cn(
                    inputVariants({ variant, customSize, className }),
                    "relative flex border "
                )}
            >
                <input
                    className={cn("h-full w-full focus:outline-none placeholder:text-sm", `px-3`)}
                    {...getCVCProps({ onChange: handleChangeCVC })}
                    {...props}
                />
            </div>
        </>
    );
}

InputPaymentCvc.displayName = "InputPaymentCvc";

export { InputPaymentCvc };
