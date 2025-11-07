"use client";

// import TextEditor from "@/components/ui/text-editor";
// import { TextEditorIcon } from "@/components/ui/text-editor/text-editor-icon";
import { TextEditorToolbar } from "@/components/ui/text-editor/text-editor-toolbar";
// import { useState } from "react";

export default function EditorDemoPage() {
    // const [content, setContent] = useState<string>("<p>Hello!</p>");

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Editor demo</h1>
            {/* <div className="flex gap-4">
                <TextEditorIcon type="bold" /> <TextEditorIcon type="link" />
                <TextEditorIcon type="italic" />
            </div> */}
            <TextEditorToolbar />

            {/* <TextEditor initialContent={content} onChange={html => setContent(html)} /> */}
        </div>
    );
}
