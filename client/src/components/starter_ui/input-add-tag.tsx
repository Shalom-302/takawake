import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { inputVariants } from "./input";
import Badge from "./badge";
import { XCloseIcon } from "../icons";

type InputAddTagProps = React.ComponentProps<"input"> &
    VariantProps<typeof inputVariants> & {
        className?: string;
        centerContentInInput?: boolean;
        tags: string[];
        setTags: React.Dispatch<React.SetStateAction<string[]>>;
        icon?: null | { position: "left" | "right"; icon: React.ReactNode };
    };

function InputAddTag({
    className,
    variant,
    customSize,
    icon,
    tags,
    setTags,
    centerContentInInput = false,
    ...props
}: InputAddTagProps) {
    const [inputValue, setInputValue] = React.useState("");
    //

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setInputValue("");
        }
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    return (
        <>
            <div
                className={cn(
                    inputVariants({ variant, customSize, className }),
                    {
                        "flex-row-reverse": icon && icon.position === "right",
                    },
                    "relative flex border"
                )}
            >
                {icon && (
                    <div
                        className={cn(
                            "h-full text-[var(--fg-quaternary)] px-2 flex items-center justify-center shrink-0",
                            {
                                "left-0": icon.position === "left",
                                "right-0": icon.position === "right",
                            }
                        )}
                    >
                        {icon.icon}
                    </div>
                )}

                <input
                    {...props}
                    className={cn(
                        "h-full w-full focus:outline-none placeholder:text-sm",
                        icon
                            ? icon.position === "left"
                                ? "pr-3"
                                : icon.position === "right"
                                  ? "pl-3"
                                  : ""
                            : "px-3",
                        {
                            "text-center": centerContentInInput,
                        }
                    )}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                        <Badge key={index} variant={"badge-modern"} size={"lg"} className="px-2">
                            {tag}
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={() => removeTag(index)}
                                className=" hover:text-[var(--bg-error-solid)] cursor-pointer"
                            >
                                <XCloseIcon size={14} />
                            </span>
                        </Badge>
                    ))}
                </div>
            )}
        </>
    );
}

InputAddTag.displayName = "InputAddTag";
export { InputAddTag };
