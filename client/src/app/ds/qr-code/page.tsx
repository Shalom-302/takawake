import { CodeBlock } from "@/components/ui/code-block";
import { QRCode, GradientScan } from "@/components/ui/qr-code";
import { ArrowLeft } from "@untitled-ui/icons-react";
import Link from "next/link";

export default function QRCodePage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <Link href="/ds" className="hover:underline mb-4 inline-block">
                    <ArrowLeft className="inline size-4 mr-1" /> Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2 text-primary">QR Code</h1>
                <p className="text-tertiary mt-2">
                    A customizable QR code component built with <code>qr-code-styling</code>.
                    Supports different sizes, embedded logos, and decorative scanning effects.
                </p>
            </div>

            {/* Basic Examples */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">1. Basic Usage</h2>
                <p className="text-sm text-tertiary mb-6">
                    Generate a simple QR code by providing a <code>value</code> to encode.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 flex justify-center gap-10 flex-wrap mb-4">
                    <QRCode value="https://www.untitledui.com/" size="md" />
                    <QRCode value="https://www.untitledui.com/" size="lg" />
                </div>

                <CodeBlock
                    code={`import { QRCode } from "@/components/ui/qr-code";

<QRCode value="https://www.untitledui.com/" size="md" />
<QRCode value="https://www.untitledui.com/" size="lg" />`}
                />
            </section>

            {/* Gradient Scan Example */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">
                    2. Gradient Scan Effect
                </h2>
                <p className="text-sm text-tertiary mb-6">
                    Combine <code>QRCode</code> with <code>GradientScan</code> to simulate a
                    scanning animation overlay.
                </p>

                <div className="border border-gray-200 rounded-lg p-8 flex justify-center mb-4">
                    <div className="relative h-28 flex w-full items-center justify-center max-w-60 aspect-square">
                        <QRCode value="https://www.untitledui.com/" size="md" />
                        <GradientScan />
                    </div>
                </div>

                <CodeBlock
                    code={`<div className="relative flex w-full items-center justify-center max-w-60 aspect-square">
  <QRCode value="https://www.untitledui.com/" size="md" />
  <GradientScan />
</div>`}
                />
            </section>

            {/* Custom Options Example */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-primary pb-2">3. Custom Options</h2>
                <p className="text-sm text-tertiary mb-6">
                    Use the <code>options</code> prop to customize dot colors, corners, or embed an
                    image (e.g., your logo).
                </p>

                <div className="border border-gray-200 rounded-lg p-8 flex justify-center mb-4">
                    <QRCode
                        size="lg"
                        value="https://www.untitledui.com/"
                        options={{
                            image: "/logo.svg",
                            imageOptions: { imageSize: 0.5, margin: 2 },
                            dotsOptions: { color: "#53389e" },
                            cornersSquareOptions: { color: "#53389e" },
                            cornersDotOptions: { color: "#53389e" },
                        }}
                    />
                </div>

                <CodeBlock
                    code={`<QRCode
  size="lg"
  value="https://www.untitledui.com/"
  options={{
    image: "/untitledui-logomark.png",
    imageOptions: { imageSize: 0.5, margin: 2 },
    dotsOptions: { color: "#53389e" },
    cornersSquareOptions: { color: "#53389e" },
    cornersDotOptions: { color: "#53389e" },
  }}
/>`}
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
                                <td className="py-2 px-4 font-mono">value</td>
                                <td className="py-2 px-4 font-mono">string</td>
                                <td className="py-2 px-4 font-mono">—</td>
                                <td className="py-2 px-4">
                                    The value or URL to encode in the QR code.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">options?</td>
                                <td className="py-2 px-4 font-mono">
                                    <a
                                        href="https://www.npmjs.com/package/qr-code-styling"
                                        target="_blank"
                                        className="text-blue-600 underline"
                                    >
                                        QRCodeStylingOptions
                                    </a>
                                </td>
                                <td className="py-2 px-4 font-mono">—</td>
                                <td className="py-2 px-4">
                                    Additional customization options for styling dots, corners, or
                                    images.
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-4 font-mono">size?</td>
                                <td className="py-2 px-4 font-mono">{`"md" | "lg"`}</td>
                                <td className="py-2 px-4 font-mono">{`"md"`}</td>
                                <td className="py-2 px-4">The size of the rendered QR code.</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 font-mono">className?</td>
                                <td className="py-2 px-4 font-mono">string</td>
                                <td className="py-2 px-4 font-mono">—</td>
                                <td className="py-2 px-4">
                                    Optional additional class names for styling.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
