"use client";

import React from "react";
import {
    Bold,
    Italic,
    Underline,
    Link as LinkIcon,
    List,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Undo,
    Redo,
} from "lucide-react";
import clsx from "clsx";
import type { Editor } from "@tiptap/react";

type Props = {
    editor: Editor | null;
};

const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
    children,
    className,
    ...props
}) => (
    <button
        {...props}
        className={clsx(
            "inline-flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800",
            className
        )}
    >
        {children}
    </button>
);

export const EditorToolbar: React.FC<Props> = ({ editor }) => {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap gap-2 p-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <IconButton onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Bold">
                <Bold size={16} />
            </IconButton>

            <IconButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                aria-label="Italic"
            >
                <Italic size={16} />
            </IconButton>

            <IconButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                aria-label="Underline"
            >
                <Underline size={16} />
            </IconButton>

            <IconButton
                onClick={() => {
                    const previous = editor.getAttributes("link").href;
                    const url = window.prompt("URL", previous ?? "");
                    if (url === null) return;
                    if (url === "") {
                        editor.chain().focus().extendMarkRange("link").unsetLink().run();
                        return;
                    }
                    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                }}
                aria-label="Link"
            >
                <LinkIcon size={16} />
            </IconButton>

            <IconButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                aria-label="Bullet list"
            >
                <List size={16} />
            </IconButton>

            <IconButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                aria-label="Ordered list"
            >
                <List size={16} />
            </IconButton>

            <IconButton
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                aria-label="Align left"
            >
                <AlignLeft size={16} />
            </IconButton>
            <IconButton
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                aria-label="Align center"
            >
                <AlignCenter size={16} />
            </IconButton>
            <IconButton
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                aria-label="Align right"
            >
                <AlignRight size={16} />
            </IconButton>

            <IconButton onClick={() => editor.chain().focus().undo().run()} aria-label="Undo">
                <Undo size={16} />
            </IconButton>
            <IconButton onClick={() => editor.chain().focus().redo().run()} aria-label="Redo">
                <Redo size={16} />
            </IconButton>
        </div>
    );
};

export default EditorToolbar;
