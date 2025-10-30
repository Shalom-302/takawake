import { CodeBlock } from "@/components/ui/code-block";
import { Illustration } from "@/components/illustrations";
import { ArrowLeft } from "@untitled-ui/icons-react";
import Link from "next/link";

export default function IllustrationsPage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <Link href="/ds" className="hover:underline mb-4 inline-block">
                    <ArrowLeft className="inline size-4 mr-1" /> Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2 text-primary">Illustrations</h1>
                <p className="text-tertiary mt-2">
                    A collection of reusable SVG illustrations for UI states, empty pages, and
                    visual context.
                </p>
            </div>

            {/* Box Illustrations */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">
                    1. Box Illustrations
                </h2>
                <p className="text-sm text-tertiary mb-6">
                    A set of box-themed illustrations, available in three sizes: <code>sm</code>,{" "}
                    <code>md</code>, and <code>lg</code>.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 flex justify-center gap-8 flex-wrap mb-4">
                    <Illustration type="box" size="sm" />
                    <Illustration type="box" size="md" />
                    <Illustration type="box" size="lg" />
                </div>

                <CodeBlock
                    code={`import { Illustration } from "@/components/illustrations";

<Illustration type="box" size="sm" />
<Illustration type="box" size="md" />
<Illustration type="box" size="lg" />`}
                />
            </section>

            {/* Cloud Illustrations */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">
                    2. Cloud Illustrations
                </h2>
                <p className="text-sm text-tertiary mb-6">
                    Cloud-style illustrations to represent storage, upload, or connectivity
                    concepts.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 flex justify-center gap-8 flex-wrap mb-4">
                    <Illustration type="cloud" size="sm" />
                    <Illustration type="cloud" size="md" />
                    <Illustration type="cloud" size="lg" />
                </div>

                <CodeBlock
                    code={`<Illustration type="cloud" size="sm" />
<Illustration type="cloud" size="md" />
<Illustration type="cloud" size="lg" />`}
                />
            </section>

            {/* Credit Card Illustrations */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">
                    3. Credit Card Illustrations
                </h2>
                <p className="text-sm text-tertiary mb-6">
                    Useful for payment screens, checkout states, or billing pages.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 flex justify-center gap-8 flex-wrap mb-4">
                    <Illustration type="credit-card" size="sm" />
                    <Illustration type="credit-card" size="md" />
                    <Illustration type="credit-card" size="lg" />
                </div>

                <CodeBlock
                    code={`<Illustration type="credit-card" size="sm" />
<Illustration type="credit-card" size="md" />
<Illustration type="credit-card" size="lg" />`}
                />
            </section>

            {/* Documents Illustrations */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">
                    4. Documents Illustrations
                </h2>
                <p className="text-sm text-tertiary mb-6">
                    Perfect for file management, upload, or empty document states.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 flex justify-center gap-8 flex-wrap mb-4">
                    <Illustration type="documents" size="sm" />
                    <Illustration type="documents" size="md" />
                    <Illustration type="documents" size="lg" />
                </div>

                <CodeBlock
                    code={`<Illustration type="documents" size="sm" />
<Illustration type="documents" size="md" />
<Illustration type="documents" size="lg" />`}
                />
            </section>

            {/* API Reference */}
            <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">API Reference</h2>
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
                                <td className="py-2 px-4 font-mono">type</td>
                                <td className="py-2 px-4 font-mono">
                                    &quot;box&quot; | &quot;cloud&quot; | &quot;credit-card&quot; |
                                    &quot;documents&quot;
                                </td>
                                <td className="py-2 px-4 font-mono">—</td>
                                <td className="py-2 px-4">Defines which illustration to render.</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">size?</td>
                                <td className="py-2 px-4 font-mono">
                                    &quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;
                                </td>
                                <td className="py-2 px-4 font-mono">&quot;md&quot;</td>
                                <td className="py-2 px-4">
                                    Controls the rendered size of the illustration.
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 font-mono">className?</td>
                                <td className="py-2 px-4 font-mono">string</td>
                                <td className="py-2 px-4 font-mono">—</td>
                                <td className="py-2 px-4">
                                    Optional class names to customize styles.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
