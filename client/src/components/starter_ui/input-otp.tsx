"use client";
import React, { useRef, useState } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils/cn";

type InputOTPProps = {
    length: number;
    onChange?: (value: string) => void;
    className?: string;
};

export const InputOTP: React.FC<InputOTPProps> = ({ length, onChange, className }) => {
    const [otpValues, setOtpValues] = useState<string[]>(Array(length).fill(""));
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    // Mettre à jour un chiffre à l’index donné
    const handleChange = (index: number, val: string) => {
        if (!/^[0-9]?$/.test(val)) return; // Accepter uniquement un chiffre ou vide

        const newOtp = [...otpValues];
        newOtp[index] = val;
        setOtpValues(newOtp);

        const finalValue = newOtp.join("");
        onChange?.(finalValue);

        // Focus vers la case suivante
        if (val && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    // Gérer effacement et navigation au clavier
    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            const prev = inputsRef.current[index - 1];
            prev?.focus();
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputsRef.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    return (
        <div className="flex gap-2">
            {Array.from({ length }).map((_, i) => (
                <Input
                    key={i}
                    name="aaa"
                    id={`otp-${i}`}
                    maxLength={1}
                    value={otpValues[i]}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(e, i)}
                    ref={el => {
                        inputsRef.current[i] = el;
                    }}
                    customSize="md"
                    className={cn(className)}
                    centerContentInInput={true}
                />
            ))}
        </div>
    );
};
