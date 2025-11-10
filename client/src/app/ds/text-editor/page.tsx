"use client";
import { CodeBlock } from "@/components/ui/code-block";
import TextEditor from "@/components/ui/text-editor";
import { ArrowLeft } from "@untitled-ui/icons-react";
import Link from "next/link";
import { useState } from "react";

export default function TextEditorPage() {
    const [content1, setContent1] = useState(
        "<p>Sélectionnez du texte pour le formater! Vous pouvez utiliser <strong>gras</strong>, <em>italique</em>, et <u>souligné</u>.</p>"
    );
    const [content2, setContent2] = useState(
        "<p>We need another and a wiser and perhaps a more mystical concept of animals. Remote from universal nature, and living by complicated artifice, man in civilization surveys the creature through the glass of his knowledge and sees thereby a feather magnified and the whole image in distortion.</p>"
    );

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <Link href="/ds" className="hover:underline mb-4 inline-block">
                    <ArrowLeft className="inline size-4 mr-1" /> Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2 text-primary">Text Editor</h1>
                <p className="text-tertiary mt-2">
                    A rich text editor component built with TipTap v3 and Tailwind CSS. Supports
                    text formatting, colors, alignment, lists, links, and custom fonts.
                </p>
            </div>

            {/* Basic Editor - Small Variant */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">
                    1. Basic Editor (Small)
                </h2>
                <p className="text-sm text-tertiary mb-6">
                    The simplest variant with essential formatting tools: bold, italic, underline,
                    text color, alignment, and bullet lists.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4">
                    <TextEditor
                        initialContent={content1}
                        onChange={setContent1}
                        variant="default-sm"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                        {content1.replace(/<[^>]*>/g, "").length} characters
                    </p>
                </div>

                <CodeBlock
                    code={`import TextEditor from "@/components/ui/text-editor";
import { useState } from "react";

const [content, setContent] = useState("<p>Start typing...</p>");

<TextEditor
    initialContent={content}
    onChange={setContent}
    variant="default-sm"
/>`}
                />
            </div>

            {/* Medium Editor with Font Controls */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">
                    2. Editor with Font Controls (Medium)
                </h2>
                <p className="text-sm text-tertiary mb-6">
                    Extended variant that includes font family and font size selectors, plus link
                    insertion capabilities.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4">
                    <TextEditor
                        initialContent={content2}
                        onChange={setContent2}
                        variant="default-md"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                        {content2.replace(/<[^>]*>/g, "").length} characters left
                    </p>
                </div>

                <CodeBlock
                    code={`import TextEditor from "@/components/ui/text-editor";

<TextEditor
    initialContent="<p>Your content here</p>"
    onChange={(html) => console.log(html)}
    variant="default-md"
/>`}
                />
            </div>

            {/* Floating Toolbar - Small */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">
                    3. Floating Toolbar (Small)
                </h2>
                <p className="text-sm text-tertiary mb-6">
                    A compact floating toolbar that appears above the editor with a subtle shadow
                    and rounded corners.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4 bg-gray-50">
                    <TextEditor
                        initialContent="<p>This editor has a floating toolbar. Try selecting some text to format it with <strong>bold</strong>, <em>italic</em>, or change its <span style='color: #2563EB;'>color</span>!</p>"
                        variant="floatting-sm"
                    />
                </div>

                <CodeBlock
                    code={`import TextEditor from "@/components/ui/text-editor";

<TextEditor
    initialContent="<p>Your content</p>"
    variant="floatting-sm"
/>`}
                />
            </div>

            {/* Floating Toolbar - Medium */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">
                    4. Floating Toolbar (Medium)
                </h2>
                <p className="text-sm text-tertiary mb-6">
                    Full-featured floating toolbar with all formatting options including links and
                    images.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4 bg-gray-50">
                    <TextEditor
                        initialContent="<p>This is the most complete variant with floating toolbar. You can add <a href='https://example.com'>links</a>, change fonts, adjust sizes, and more!</p>"
                        variant="floatting-md"
                    />
                </div>

                <CodeBlock
                    code={`import TextEditor from "@/components/ui/text-editor";

<TextEditor
    initialContent="<p>Your content</p>"
    variant="floatting-md"
/>`}
                />
            </div>

            {/* Read-only Mode */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">5. Read-only Mode</h2>
                <p className="text-sm text-tertiary mb-6">
                    Display formatted content without allowing edits. Perfect for showing previews
                    or published content.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4">
                    <TextEditor
                        initialContent="<p>This editor is in <strong>read-only mode</strong>. You cannot edit this text, but all formatting is preserved and displayed correctly.</p>"
                        variant="default-sm"
                        editable={false}
                    />
                </div>

                <CodeBlock
                    code={`import TextEditor from "@/components/ui/text-editor";

<TextEditor
    initialContent="<p>Read-only content</p>"
    variant="default-sm"
    editable={false}
/>`}
                />
            </div>

            {/* Custom Placeholder */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">
                    6. Custom Placeholder
                </h2>
                <p className="text-sm text-tertiary mb-6">
                    Customize the placeholder text that appears when the editor is empty.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4">
                    <TextEditor
                        initialContent=""
                        variant="default-md"
                        placeholder="Write your amazing story here..."
                    />
                </div>

                <CodeBlock
                    code={`import TextEditor from "@/components/ui/text-editor";

<TextEditor
    initialContent=""
    variant="default-md"
    placeholder="Write your amazing story here..."
/>`}
                />
            </div>

            {/* HTML Output Preview */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">
                    7. Real-time HTML Output
                </h2>
                <p className="text-sm text-tertiary mb-6">
                    The editor provides real-time HTML output through the onChange callback.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 mb-4 space-y-4">
                    <TextEditor
                        initialContent={content1}
                        onChange={setContent1}
                        variant="default-sm"
                    />
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold mb-2 text-gray-700">HTML Output:</h3>
                        <pre className="bg-white p-3 rounded text-xs overflow-x-auto border border-gray-200">
                            {content1}
                        </pre>
                    </div>
                </div>

                <CodeBlock
                    code={`import TextEditor from "@/components/ui/text-editor";
import { useState } from "react";

const [content, setContent] = useState("<p>Initial content</p>");

<TextEditor
    initialContent={content}
    onChange={setContent}
    variant="default-sm"
/>

<pre>{content}</pre> // Display the HTML output`}
                />
            </div>

            {/* API Reference */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">API Reference</h2>

                <h3 className="text-xl font-medium mt-6 mb-3 text-gray-700">TextEditor Props</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-gray-700">
                                <th className="py-2 px-4 text-left font-medium">Prop</th>
                                <th className="py-2 px-4 text-left font-medium">Type</th>
                                <th className="py-2 px-4 text-left font-medium">Default</th>
                                <th className="py-2 px-4 text-left font-medium">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">initialContent?</td>
                                <td className="py-2 px-4 font-mono">string</td>
                                <td className="py-2 px-4 font-mono">&quot;&quot;</td>
                                <td className="py-2 px-4">Initial HTML content of the editor.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">onChange?</td>
                                <td className="py-2 px-4 font-mono">(html: string) =&gt; void</td>
                                <td className="py-2 px-4 font-mono">—</td>
                                <td className="py-2 px-4">Callback fired when content changes.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">variant?</td>
                                <td className="py-2 px-4 font-mono">
                                    &quot;default-sm&quot; | &quot;default-md&quot; |
                                    &quot;floatting-sm&quot; | &quot;floatting-md&quot;
                                </td>
                                <td className="py-2 px-4 font-mono">&quot;default-sm&quot;</td>
                                <td className="py-2 px-4">
                                    Visual variant with different toolbar options.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">placeholder?</td>
                                <td className="py-2 px-4 font-mono">string</td>
                                <td className="py-2 px-4 font-mono">
                                    &quot;Commencez à écrire...&quot;
                                </td>
                                <td className="py-2 px-4">
                                    Placeholder text when editor is empty.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">editable?</td>
                                <td className="py-2 px-4 font-mono">boolean</td>
                                <td className="py-2 px-4 font-mono">true</td>
                                <td className="py-2 px-4">
                                    Whether the editor content is editable.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">className?</td>
                                <td className="py-2 px-4 font-mono">string</td>
                                <td className="py-2 px-4 font-mono">—</td>
                                <td className="py-2 px-4">
                                    Additional CSS classes for the editor container.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Variants Comparison */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">
                    Variants Comparison
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-gray-700">
                                <th className="py-2 px-4 text-left font-medium">Feature</th>
                                <th className="py-2 px-4 text-center font-medium">default-sm</th>
                                <th className="py-2 px-4 text-center font-medium">default-md</th>
                                <th className="py-2 px-4 text-center font-medium">floatting-sm</th>
                                <th className="py-2 px-4 text-center font-medium">floatting-md</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4">Bold, Italic, Underline</td>
                                <td className="py-2 px-4 text-center">✓</td>
                                <td className="py-2 px-4 text-center">✓</td>
                                <td className="py-2 px-4 text-center">✓</td>
                                <td className="py-2 px-4 text-center">✓</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4">Text Color</td>
                                <td className="py-2 px-4 text-center">✓</td>
                                <td className="py-2 px-4 text-center">✓</td>
                                <td className="py-2 px-4 text-center">✓</td>
                                <td className="py-2 px-4 text-center">✓</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4">Text Alignment</td>
                                <td className="py-2 px-4 text-center">✓</td>
                                <td className="py-2 px-4 text-center">✓</td>
                                <td className="py-2 px-4 text-center">✓</td>
                                <td className="py-2 px-4 text-center">✓</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4">Bullet Lists</td>
                                <td className="py-2 px-4 text-center">✓</td>
                                <td className="py-2 px-4 text-center">✓</td>
                                <td className="py-2 px-4 text-center">✓</td>
                                <td className="py-2 px-4 text-center">✓</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4">Font Family Selector</td>
                                <td className="py-2 px-4 text-center">—</td>
                                <td className="py-2 px-4 text-center">✓</td>
                                <td className="py-2 px-4 text-center">—</td>
                                <td className="py-2 px-4 text-center">✓</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4">Font Size Selector</td>
                                <td className="py-2 px-4 text-center">—</td>
                                <td className="py-2 px-4 text-center">✓</td>
                                <td className="py-2 px-4 text-center">—</td>
                                <td className="py-2 px-4 text-center">✓</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4">Link Insertion</td>
                                <td className="py-2 px-4 text-center">—</td>
                                <td className="py-2 px-4 text-center">✓</td>
                                <td className="py-2 px-4 text-center">—</td>
                                <td className="py-2 px-4 text-center">✓</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4">Floating Toolbar</td>
                                <td className="py-2 px-4 text-center">—</td>
                                <td className="py-2 px-4 text-center">—</td>
                                <td className="py-2 px-4 text-center">✓</td>
                                <td className="py-2 px-4 text-center">✓</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Extensions Used */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">
                    TipTap Extensions Used
                </h2>
                <p className="text-sm text-tertiary mb-6">
                    The editor is built using the following TipTap v3 extensions:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">StarterKit</h4>
                        <p className="text-sm text-gray-600">
                            Base functionality including paragraphs, headings, and basic formatting.
                        </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Underline</h4>
                        <p className="text-sm text-gray-600">
                            Adds underline text formatting capability.
                        </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">TextAlign</h4>
                        <p className="text-sm text-gray-600">
                            Left, center, and right text alignment options.
                        </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Link</h4>
                        <p className="text-sm text-gray-600">Insert and edit hyperlinks.</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">TextStyle & Color</h4>
                        <p className="text-sm text-gray-600">
                            Apply custom colors to text selections.
                        </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">FontFamily</h4>
                        <p className="text-sm text-gray-600">
                            Change font family (Inter, Comic Sans, Serif).
                        </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">FontSize (Custom)</h4>
                        <p className="text-sm text-gray-600">
                            Custom extension for font size control (12px-22px).
                        </p>
                    </div>
                </div>
            </div>

            {/* Installation */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">Installation</h2>
                <p className="text-sm text-tertiary mb-6">
                    Install the required dependencies for the text editor:
                </p>

                <CodeBlock
                    code={`npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-link @tiptap/extension-text-style @tiptap/extension-color @tiptap/extension-font-family @tiptap/core @radix-ui/react-toolbar`}
                />

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                        💡 <strong>Note:</strong> Make sure you&apos;re using TipTap v3.x for
                        compatibility. Set{" "}
                        <code className="bg-blue-100 px-1.5 py-0.5 rounded">
                            immediatelyRender: false
                        </code>{" "}
                        in the editor config to avoid SSR hydration issues with Next.js.
                    </p>
                </div>
            </div>
        </div>
    );
}
