import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { cn } from "@/lib/utils/cn";
import { cva, VariantProps } from "class-variance-authority";

const HIGHLIGHT_COLORS = [
    { name: "Yellow", value: "#fef08a", bgClass: "bg-yellow-200" },
    { name: "Green", value: "#bbf7d0", bgClass: "bg-green-200" },
    { name: "Blue", value: "#bfdbfe", bgClass: "bg-blue-200" },
    { name: "Pink", value: "#fbcfe8", bgClass: "bg-pink-200" },
    { name: "Purple", value: "#e9d5ff", bgClass: "bg-purple-200" },
];

type TextHighlightProps = {
    onColorSelect: (color: string) => void;
    currentColor?: string;
};

export function TextHighlight({ onColorSelect }: TextHighlightProps) {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    className={cn(
                        "inline-flex items-center justify-center rounded-md",
                        "h-8 w-8 p-1.5",
                        "transition-colors duration-150",
                        "hover:bg-gray-50",
                        "[&_svg]:h-5 [&_svg]:w-5 [&_svg]:text-gray-500",
                        "hover:[&_svg]:text-gray-700"
                    )}
                >
                    <ColorSelect />
                </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="z-50 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
                    sideOffset={5}
                >
                    <div className="flex gap-2">
                        {HIGHLIGHT_COLORS.map(color => (
                            <DropdownMenu.Item
                                key={color.value}
                                onSelect={() => onColorSelect(color.value)}
                                className={cn(
                                    "h-6 w-6 rounded cursor-pointer",
                                    "hover:ring-2 hover:ring-gray-400 hover:ring-offset-2",
                                    "focus:outline-none",
                                    color.bgClass
                                )}
                            />
                        ))}
                    </div>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

const colorVariants = cva(
    "size-5 rounded-full data-[state=on]:outline-[1.5px] data-[state=on]:outline-utility-gray-900 data-[state=on]:outline-offset-2",
    {
        variants: {
            color: {
                black: "bg-utility-gray-900 border border-black/10 ",
            },
        },
        defaultVariants: {
            color: "black",
        },
    }
);

function ColorSelect({ color }: VariantProps<typeof colorVariants>) {
    return <div className={colorVariants({ color })} />;
}
