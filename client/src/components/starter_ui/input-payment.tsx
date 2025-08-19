import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { inputVariants } from "./input";
import { usePaymentInputs } from "react-payment-inputs";
import images, { type CardImages } from "react-payment-inputs/images";
import { CreditCardOneIcon } from "../icons";

function InputPayment({
    className,
    variant,
    customSize,
    id,
    cardNumber,
    expiryDate,
    cvc,
    setCardNumber,
    setExpiryDate,
    setCvc,
    ...props
}: React.ComponentProps<"input"> &
    VariantProps<typeof inputVariants> & {
        className?: string;
        id: string;
        cardNumber?: string;
        expiryDate?: string;
        cvc?: string;
        setCardNumber: React.Dispatch<React.SetStateAction<undefined>>;
        setExpiryDate: React.Dispatch<React.SetStateAction<undefined>>;
        setCvc: React.Dispatch<React.SetStateAction<undefined>>;
    }) {
    const { meta, getCardNumberProps, getExpiryDateProps, getCVCProps, getCardImageProps } =
        usePaymentInputs();

    const handleChangeCardNumber = (e: any) => {
        setCardNumber(e.target.value);
    };

    const handleChangeExpiryDate = (e: any) => {
        setExpiryDate(e.target.value);
    };
    const handleChangeCVC = (e: any) => {
        setCvc(e.target.value);
    };

    return (
        <section className="flex items-center gap-2">
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
                    // {...props}
                    placeholder="Numéro de carte"
                />
            </div>

            <div className={cn("flex items-center gap-2")}>
                <div
                    className={cn(
                        inputVariants({ variant, customSize, className }),
                        "relative flex border max-w-[120px]"
                    )}
                >
                    <input
                        className={cn(
                            "h-full w-full focus:outline-none placeholder:text-sm",
                            `px-3`
                        )}
                        {...getExpiryDateProps({ onChange: handleChangeExpiryDate })}
                        // {...props}
                    />
                </div>
                <div
                    className={cn(
                        inputVariants({ variant, customSize, className }),
                        "relative flex border max-w-[100px] "
                    )}
                >
                    <input
                        className={cn(
                            "h-full w-full focus:outline-none placeholder:text-sm",
                            `px-3`
                        )}
                        {...getCVCProps({ onChange: handleChangeCVC })}
                        // {...props}
                    />
                </div>
            </div>
        </section>
    );
}

InputPayment.displayName = "InputPayment";

export { InputPayment };
