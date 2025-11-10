"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { useEffect } from "react";
import { TextEditorToolbar } from "./text-editor-toolbar";
import { TextStyle } from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";

const FontSize = Extension.create({
    name: "fontSize",

    addOptions() {
        return {
            types: ["textStyle"],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize || null,
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setFontSize:
                (fontSize: string) =>
                ({ chain }) => {
                    return chain().setMark("textStyle", { fontSize }).run();
                },
            unsetFontSize:
                () =>
                ({ chain }) => {
                    return chain().setMark("textStyle", { fontSize: null }).run();
                },
        };
    },
});

type TextEditorProps = {
    initialContent?: string;
    onChange?: (html: string) => void;
    variant?: "default-sm" | "default-md" | "floatting-sm" | "floatting-md";
    placeholder?: string;
    editable?: boolean;
    className?: string;
};

export default function TextEditor({
    initialContent = "",
    onChange,
    variant = "default-sm",
    editable = true,
    className = "",
}: TextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                // heading: {
                //     levels: [1, 2, 3],
                // },
            }),
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
                alignments: ["left", "center", "right", "justify"],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-600 underline hover:text-blue-800",
                },
            }),
            TextStyle,
            Color,
            FontFamily.configure({
                types: ["textStyle"],
            }),
            FontSize.configure({
                types: ["textStyle"],
            }),
        ],
        content: initialContent,
        editable,
        editorProps: {
            attributes: {
                class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
            },
        },
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
    });

    // Synchroniser le contenu initial si la prop change
    useEffect(() => {
        if (editor && initialContent !== editor.getHTML()) {
            editor.commands.setContent(initialContent);
        }
    }, [initialContent, editor]);

    // Mettre à jour l'état editable
    useEffect(() => {
        if (editor) {
            editor.setEditable(editable);
        }
    }, [editable, editor]);

    useEffect(() => {
        return () => {
            editor?.destroy();
        };
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className={`${className}`}>
            <TextEditorToolbar editor={editor} variant={variant} />
            <EditorContent
                editor={editor}
                className="bg-primary p-5 rounded-xl border border-secondary_alt focus-within:border-brand-solid focus-within:border-2 shadow-xs mt-3 mb-8"
            />
        </div>
    );
}
