import { cn } from "@/lib/utils/cn";
import { Popover } from "../popover";
import { useState } from "react";

const TEXT_COLORS = [
    { name: "Black", value: "#000000", class: "bg-utility-gray-900" },
    { name: "Gray", value: "#6B7280", class: "bg-utility-gray-500" },
    { name: "Red", value: "#DC2626", class: "bg-utility-red-600" },
    { name: "Orange", value: "#EA580C", class: "bg-utility-orange-600" },
    { name: "Yellow", value: "#CA8A04", class: "bg-utility-yellow-600" },
    { name: "Green", value: "#16A34A", class: "bg-utility-green-600" },
    { name: "Blue", value: "#2563EB", class: "bg-utility-blue-600" },
    { name: "Purple", value: "#9333EA", class: "bg-utility-purple-600" },
    { name: "Pink", value: "#DB2777", class: "bg-utility-pink-600" },
];

type TextColorProps = {
    onColorSelect: (color: string) => void;
    currentColor?: string;
};

export function TextColor({ onColorSelect, currentColor }: TextColorProps) {
    const [selected, setSelected] = useState(false);
    const handleClick = () => {};

    return (
        <Popover
            open={selected}
            onOpenChange={setSelected}
            trigger={
                <button
                    type="button"
                    className={cn(
                        "inline-flex items-center justify-center rounded-sm",
                        "size-8 p-1.5",
                        "text-fg-quaternary",
                        "transition-colors duration-150",
                        "hover:bg-primary_hover hover:text-fg-quaternary_hover"
                    )}
                    onClick={handleClick}
                >
                    <div
                        className={cn(
                            "size-5 bg-utility-gray-900 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900",
                            selected && "ring-2 ring-gray-900 ring-offset-2"
                        )}
                    />
                </button>
            }
            content={
                <div className="grid grid-cols-3 gap-1.5 p-3">
                    {TEXT_COLORS.map(color => (
                        <button
                            key={color.value}
                            onClick={() => onColorSelect(color.value)}
                            className={cn(
                                "size-5 rounded-full cursor-pointer",
                                "hover:ring-2 hover:ring-gray-900 hover:ring-offset-2",
                                "focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2",
                                "transition-all duration-150",
                                color.class,
                                currentColor === color.value && "ring-2 ring-gray-900 ring-offset-2"
                            )}
                            // className={`size-7 rounded-full cursor-pointer transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            //     color.class
                            // } ${
                            //     currentColor === color.value
                            //         ? "ring-2 ring-blue-600 ring-offset-2"
                            //         : ""
                            // }`}
                        />
                    ))}
                </div>
            }
            contentClassName="w-32"
        />
    );
}
