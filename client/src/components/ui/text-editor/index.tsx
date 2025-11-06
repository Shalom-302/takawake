import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { cn } from "@/lib/utils/cn";

type TextEditorProps = {
    content?: string;
    onChange?: (content: string) => void;
    variant?: "simple" | "advanced";
    size?: "sm" | "md";
    placeholder?: string;
    className?: string;
};

export function TextEditor({
    content = "",
    onChange,
    variant = "simple",
    size = "md",
    className,
}: TextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-600 underline cursor-pointer",
                },
            }),
            Highlight.configure({
                multicolor: true,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm max-w-none focus:outline-none",
                    size === "sm" ? "min-h-[150px] p-3" : "min-h-[250px] p-4"
                ),
            },
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div
            className={cn(
                "overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm",
                className
            )}
        >
            <TextEditorToolbar editor={editor} variant={variant} />
            <EditorContent editor={editor} />
        </div>
    );
}
