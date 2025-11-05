"use client";

import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorToolbar } from "./EditorToolbar";

type Props = {
    content?: string;
    onUpdate?: (html: string) => void;
    placeholder?: string;
};

export const Editor: React.FC<Props> = ({
    content = "",
    onUpdate,
    placeholder = "Start typing...",
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({ openOnClick: true }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Placeholder.configure({ placeholder }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onUpdate?.(editor.getHTML());
        },
    });

    // Ensure editor updates when content prop changes
    useEffect(() => {
        if (!editor) return;
        if (content !== editor.getHTML()) {
            editor.commands.setContent(content, false);
        }
    }, [content, editor]);

    return (
        <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <EditorToolbar editor={editor} />
            <div className="p-4">
                <EditorContent
                    editor={editor}
                    className="prose dark:prose-invert max-w-none min-h-[200px] focus:outline-none"
                />
            </div>
        </div>
    );
};

export default Editor;
