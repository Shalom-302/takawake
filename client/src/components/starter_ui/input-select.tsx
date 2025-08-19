import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { inputVariants } from "./input";
import { Dropdown, DropdownItem } from "./dropdown";
import { ChevronDownIcon } from "../icons";

type optionType = {
    id: number;
    label: string;
};

function InputSelect({
    className,
    variant,
    customSize,
    optionBoxPosition = "right",
    centerContentInInput = false,
    options,
    onChange,
    ...props
}: Omit<React.ComponentProps<"input">, "onChange"> &
    VariantProps<typeof inputVariants> & {
        className?: string;
        options: optionType[];
        centerContentInInput?: boolean;
        optionBoxPosition: "left" | "right";
        onChange?: (e: React.ChangeEvent<HTMLInputElement> & { target: { value: string } }) => void;
    }) {
    const [inputValue, setInputValue] = React.useState("");
    const [selectedOption, setSelectedOption] = React.useState<optionType | null>(options[0]);

    // Retourne la valeur finale à transmettre au parent
    const getComposedValue = React.useCallback(() => {
        const label = selectedOption?.label || "";
        return optionBoxPosition === "left"
            ? `${label}${label ? "" : ""}${inputValue}`.trim()
            : `${inputValue}${label ? "" : ""}${label}`.trim();
    }, [inputValue, selectedOption, optionBoxPosition]);

    // Appelle le onChange parent avec la valeur formatée
    const triggerChange = React.useCallback(() => {
        if (!onChange) return;
        const composedValue = getComposedValue();
        const syntheticEvent = {
            ...new Event("change"),
            target: { value: composedValue },
        } as unknown as React.ChangeEvent<HTMLInputElement> & {
            target: { value: string };
        };

        onChange(syntheticEvent);
    }, [getComposedValue, onChange]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleOptionChange = (option: optionType) => {
        setSelectedOption(option);
    };

    // Compose à chaque modification
    React.useEffect(() => {
        triggerChange();
    }, [inputValue, selectedOption]);

    return (
        <div
            className={cn(
                inputVariants({ variant, customSize, className }),
                {
                    "flex-row-reverse": optionBoxPosition === "right",
                },
                "relative flex border"
            )}
        >
            <div
                className={cn(
                    "h-full text-[var(--fg-quaternary)] px-2 flex items-center justify-center shrink-0",
                    {
                        "left-0": optionBoxPosition === "left",
                        "right-0": optionBoxPosition === "right",
                    }
                )}
            >
                <Dropdown
                    dropdownTrigger={
                        <div className="flex items-center gap-1">
                            <span className="block">{selectedOption?.label || <>&nbsp;</>}</span>
                            <ChevronDownIcon size={14} />
                        </div>
                    }
                    triggerMode="click"
                    triggerClassNames="ring-transparent"
                >
                    <div className="p-2 w-auto min-w-[100px]">
                        {options?.map(el => (
                            <DropdownItem key={el?.id} asChild>
                                <button
                                    type="button"
                                    className="w-full cursor-pointer"
                                    onClick={() => handleOptionChange(el)}
                                >
                                    <span className="text-sm whitespace-nowrap block">
                                        {el?.label}
                                    </span>
                                </button>
                            </DropdownItem>
                        ))}
                    </div>
                </Dropdown>
            </div>

            <input
                className={cn(
                    "h-full w-full focus:outline-none placeholder:text-sm",
                    optionBoxPosition === "left"
                        ? "pr-3"
                        : optionBoxPosition === "right"
                          ? "pl-3"
                          : "px-3",
                    {
                        "text-center": centerContentInInput,
                    }
                )}
                value={inputValue}
                onChange={handleInputChange}
                {...props}
            />
        </div>
    );
}

InputSelect.displayName = "InputSelect";
export { InputSelect };
