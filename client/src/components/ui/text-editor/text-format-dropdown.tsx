import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Type01, ChevronDown } from "@untitled-ui/icons-react";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

const TEXT_FORMATS = [
    { name: "Normal", level: 0 },
    { name: "Heading 1", level: 1 },
    { name: "Heading 2", level: 2 },
    { name: "Heading 3", level: 3 },
] as const;

type TextFormatDropdownProps = {
    editor: Editor;
};

export function TextFormatDropdown({ editor }: TextFormatDropdownProps) {
    const getCurrentFormat = () => {
        if (editor.isActive("heading", { level: 1 })) return "Heading 1";
        if (editor.isActive("heading", { level: 2 })) return "Heading 2";
        if (editor.isActive("heading", { level: 3 })) return "Heading 3";
        return "Normal";
    };

    const handleFormatChange = (level: number) => {
        if (level === 0) {
            editor.chain().focus().setParagraph().run();
        } else {
            editor
                .chain()
                .focus()
                .setHeading({ level: level as 1 | 2 | 3 })
                .run();
        }
    };

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    className={cn(
                        "inline-flex items-center gap-2 rounded-md",
                        "h-8 px-3 py-1.5",
                        "text-sm font-medium text-gray-700",
                        "transition-colors duration-150",
                        "hover:bg-gray-50",
                        "[&_svg]:h-4 [&_svg]:w-4"
                    )}
                >
                    <Type01 />
                    <span>{getCurrentFormat()}</span>
                    <ChevronDown />
                </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="z-50 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                    sideOffset={5}
                >
                    {TEXT_FORMATS.map(format => (
                        <DropdownMenu.Item
                            key={format.name}
                            onSelect={() => handleFormatChange(format.level)}
                            className={cn(
                                "px-3 py-2 text-sm text-gray-700",
                                "cursor-pointer outline-none",
                                "hover:bg-gray-50",
                                "data-[highlighted]:bg-gray-50"
                            )}
                        >
                            {format.name}
                        </DropdownMenu.Item>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
