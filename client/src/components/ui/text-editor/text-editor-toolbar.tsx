import { Editor } from "@tiptap/react";
import { TextEditorIcon } from "./text-editor-icon";
import { TextFormatDropdown } from "./text-format-dropdown";
import { TextHighlight } from "./text-highlight";

type TextEditorToolbarProps = {
    editor: Editor;
    variant?: "simple" | "advanced";
};

export function TextEditorToolbar({ editor, variant = "simple" }: TextEditorToolbarProps) {
    const insertLink = () => {
        const url = window.prompt("Enter URL:");
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    if (variant === "simple") {
        return (
            <div className="flex items-center gap-1 border-b border-gray-200 p-2">
                <TextEditorIcon
                    type="bold"
                    isActive={editor.isActive("bold")}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                />
                <TextEditorIcon
                    type="italic"
                    isActive={editor.isActive("italic")}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                />
                <TextEditorIcon
                    type="underline"
                    isActive={editor.isActive("underline")}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                />

                <div className="mx-1 h-6 w-px bg-gray-200" />

                <TextEditorIcon
                    type="dot-points"
                    isActive={editor.isActive("bulletList")}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                />

                <div className="mx-1 h-6 w-px bg-gray-200" />

                <TextEditorIcon
                    type="left-align"
                    isActive={editor.isActive({ textAlign: "left" })}
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                />
                <TextEditorIcon
                    type="center-align"
                    isActive={editor.isActive({ textAlign: "center" })}
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                />
                <TextEditorIcon
                    type="right-align"
                    isActive={editor.isActive({ textAlign: "right" })}
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 p-2">
            <TextFormatDropdown editor={editor} />

            <div className="mx-1 h-6 w-px bg-gray-200" />

            <TextEditorIcon
                type="bold"
                isActive={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <TextEditorIcon
                type="italic"
                isActive={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <TextEditorIcon
                type="underline"
                isActive={editor.isActive("underline")}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            />

            <div className="mx-1 h-6 w-px bg-gray-200" />

            <TextHighlight
                onColorSelect={color => editor.chain().focus().setHighlight({ color }).run()}
            />

            <div className="mx-1 h-6 w-px bg-gray-200" />

            <TextEditorIcon
                type="dot-points"
                isActive={editor.isActive("bulletList")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            />

            <div className="mx-1 h-6 w-px bg-gray-200" />

            <TextEditorIcon
                type="left-align"
                isActive={editor.isActive({ textAlign: "left" })}
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
            />
            <TextEditorIcon
                type="center-align"
                isActive={editor.isActive({ textAlign: "center" })}
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
            />
            <TextEditorIcon
                type="right-align"
                isActive={editor.isActive({ textAlign: "right" })}
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
            />
            <TextEditorIcon
                type="justify"
                isActive={editor.isActive({ textAlign: "justify" })}
                onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            />

            <div className="mx-1 h-6 w-px bg-gray-200" />

            <TextEditorIcon type="link" isActive={editor.isActive("link")} onClick={insertLink} />
            <TextEditorIcon
                type="insert-image"
                onClick={() => alert("Image upload not implemented")}
            />
            <TextEditorIcon
                type="insert-video"
                onClick={() => alert("Video upload not implemented")}
            />
            <TextEditorIcon
                type="attach-file"
                onClick={() => alert("File upload not implemented")}
            />
            <TextEditorIcon
                type="insert-code"
                isActive={editor.isActive("code")}
                onClick={() => editor.chain().focus().toggleCode().run()}
            />
        </div>
    );
}
