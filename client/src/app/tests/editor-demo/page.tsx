"use client";

import TextEditor from "@/components/ui/text-editor";

import { useState } from "react";

export default function EditorDemoPage() {
    const [content, setContent] = useState("<p>Sélectionnez du texte pour le formater!</p>");

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Éditeur de texte TipTap</h1>
                    <p className="text-gray-600">
                        Éditeur de texte riche avec mise en forme, couleurs et alignement
                    </p>
                </div>

                <TextEditor initialContent={content} onChange={setContent} variant="default-sm" />

                <TextEditor
                    initialContent="<p>Éditeur avec plus d'options (MD)</p>"
                    variant="default-md"
                />
                <TextEditor
                    initialContent="<p>Éditeur avec plus d'options (MD)</p>"
                    variant="floatting-sm"
                />
                <TextEditor
                    initialContent="<p>Éditeur avec plus d'options (MD)</p>"
                    variant="floatting-md"
                />

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">Contenu HTML généré:</h3>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">{content}</pre>
                </div>
            </div>
        </div>
    );
}
