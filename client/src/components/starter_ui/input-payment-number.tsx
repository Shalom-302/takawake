import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { inputVariants } from "./input";
import { usePaymentInputs } from "react-payment-inputs";
import images, { type CardImages } from "react-payment-inputs/images";
import { CreditCardOneIcon } from "../icons";

function InputPaymentNumber({
    className,
    variant,
    customSize,
    cardNumber,
    setCardNumber,
    ...props
}: React.ComponentProps<"input"> &
    VariantProps<typeof inputVariants> & {
        className?: string;
        cardNumber?: string;
        expiryDate?: string;
        cvc?: string;
        setCardNumber: React.Dispatch<React.SetStateAction<undefined>> | null;
    }) {
    const { meta, getCardNumberProps, getCardImageProps } = usePaymentInputs();

    const handleChangeCardNumber = (e: any) => {
        if (setCardNumber) {
            setCardNumber(e.target.value);
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
                {meta.cardType ? (
                    <div
                        className={cn(
                            "h-full text-[var(--fg-quaternary)] px-2 flex items-center justify-center shrink-0 right-0"
                        )}
                    >
                        <svg
                            className="overflow-hidden rounded-sm"
                            {...getCardImageProps({
                                images: images as unknown as CardImages,
                            })}
                            width={20}
                        />
                    </div>
                ) : (
                    <div
                        className={cn(
                            "h-full text-[var(--fg-quaternary)] px-2 flex items-center justify-center shrink-0 right-0"
                        )}
                    >
                        <CreditCardOneIcon size={20} />
                    </div>
                )}
                <input
                    className={cn("h-full w-full focus:outline-none placeholder:text-sm", `pr-3`)}
                    {...getCardNumberProps({ onChange: handleChangeCardNumber })}
                    {...props}
                    placeholder="Numéro de carte"
                />
            </div>
        </>
    );
}

InputPaymentNumber.displayName = "InputPaymentNumber";

export { InputPaymentNumber };
