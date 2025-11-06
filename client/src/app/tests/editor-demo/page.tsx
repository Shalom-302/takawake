"use client";

import { TextEditorIcon } from "@/components/ui/text-editor/text-editor-icon";

// import React, { useEffect, useState } from "react";
// import Editor from "@/components/editor/Editor";
// import RichTextDisplay from "@/components/editor/RichTextDisplay";

export default function EditorDemoPage() {
    // const [content, setContent] = useState<string>("");

    // useEffect(() => {
    //     const saved = localStorage.getItem("editor:demo");
    //     if (saved) setContent(saved);
    // }, []);

    // const handleSave = () => {
    //     localStorage.setItem("editor:demo", content);
    //     alert("Saved to localStorage (editor:demo)");
    // };

    // const handleClear = () => {
    //     localStorage.removeItem("editor:demo");
    //     setContent("");
    // };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Editor demo</h1>
            <div className="flex gap-4">
                <TextEditorIcon type="bold" /> <TextEditorIcon type="link" />
                <TextEditorIcon type="italic" />
            </div>

            {/* <Editor
                content={content}
                onUpdate={html => setContent(html)}
                placeholder="Write something rich..."
            />

            <div className="flex gap-2 mt-4">
                <button className="px-3 py-2 rounded bg-sky-600 text-white" onClick={handleSave}>
                    Save
                </button>
                <button className="px-3 py-2 rounded border" onClick={handleClear}>
                    Clear
                </button>
            </div>

            <h2 className="text-xl font-medium mt-6 mb-2">Preview</h2>
            <div className="p-4 border rounded">
                <RichTextDisplay html={content} className="prose dark:prose-invert max-w-none" />
            </div> */}
        </div>
    );
}
