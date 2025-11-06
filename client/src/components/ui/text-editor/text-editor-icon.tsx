import * as TogglePrimitive from "@radix-ui/react-toggle";
import { Tooltip } from "../tooltip";
import {
    AlignCenter,
    AlignJustify,
    AlignLeft01,
    AlignRight,
    Attachment01,
    Bold01,
    CodeSnippet02,
    Dotpoints01,
    Image01,
    Italic01,
    Link01,
    PlaySquare,
    Underline01,
} from "@untitled-ui/icons-react";
// import { cva, VariantProps } from "class-variance-authority";

type TextEditorIconProps = {
    type:
        | "bold"
        | "italic"
        | "underline"
        | "dot-points"
        | "left-align"
        | "center-align"
        | "right-align"
        | "justify"
        | "link"
        | "insert-image"
        | "attach-file"
        | "insert-code"
        | "text-color"
        | "generate"
        | "more"
        | "insert-video";
    isActive?: boolean;
    onClick?: () => void;
    disabled?: boolean;
};

export function TextEditorIcon({ type, isActive, onClick, disabled }: TextEditorIconProps) {
    const icon = (() => {
        switch (type) {
            case "bold":
                return <Bold01 />;
            case "italic":
                return <Italic01 />;
            case "underline":
                return <Underline01 />;
            case "dot-points":
                return <Dotpoints01 />;
            case "left-align":
                return <AlignLeft01 />;
            case "center-align":
                return <AlignCenter />;
            case "right-align":
                return <AlignRight />;
            case "justify":
                return <AlignJustify />;
            case "link":
                return <Link01 />;
            case "insert-image":
                return <Image01 />;
            case "insert-video":
                return <PlaySquare />;
            case "attach-file":
                return <Attachment01 />;
            case "insert-code":
                return <CodeSnippet02 />;
            default:
                return null;
        }
    })();

    return (
        <Tooltip
            trigger={
                <TogglePrimitive.Root
                    pressed={isActive}
                    onPressedChange={onClick}
                    disabled={disabled}
                    className="rounded-md size-8 p-1.5 hover:bg-primary_hover [&_svg]:size-5 [&_svg]:text-fg-quaternary [&_svg]:hover:text-fg-quaternary_hover data-[state=on]:bg-primary_hover data-[state=on]:[&_svg]:text-fg-secondary transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50"
                >
                    {icon}
                </TogglePrimitive.Root>
            }
            title={`${type.split("-").join(" ")}`}
            titleClassName="first-letter:uppercase"
        />
    );
}
