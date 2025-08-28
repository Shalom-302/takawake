import React from "react";
import Link from "next/link";
import { ProgressBar, ProgressBarCircle } from "@/components/ui/progress-indicators";
import { CodeBlock } from "@/ds/components/code-block";
import { ProgressBarHalfCircle } from "@/components/ui/progress-indicators/progress-circle";

export default function ProgressPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Progress Indicators</h1>
                <p className="text-muted-foreground mt-2">
                    A visual indicator showing the completion status of a task or operation.
                </p>
            </div>

            {/* Base Example */}
            <div className="mb-10 ">
                <h2 className="text-xl font-semibold mb-4">Base Example</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <div className="w-full max-w-md py-8">
                            <ProgressBar value={45} />
                        </div>
                    </div>
                    <CodeBlock className="mt-2 max-w-md" code={`<ProgressBar value={45} />`} />
                </div>
            </div>

            {/* Text right */}
            <div className="mb-10 ">
                <h2 className="text-xl font-semibold mb-4">Text right</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <div className="w-full max-w-md py-8">
                            <ProgressBar value={45} labelPosition="right" />
                        </div>
                    </div>
                    <CodeBlock
                        className="mt-2 max-w-md"
                        code={`<ProgressBar value={45} labelPosition="right" />`}
                    />
                </div>
            </div>
            {/* Text bottom */}
            <div className="mb-10 ">
                <h2 className="text-xl font-semibold mb-4">Text bottom</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <div className="w-full max-w-md py-8">
                            <ProgressBar value={20} labelPosition="bottom" />
                        </div>
                    </div>
                    <CodeBlock
                        className="mt-2 max-w-md"
                        code={`<ProgressBar value={20} labelPosition="bottom" />`}
                    />
                </div>
            </div>

            {/* Text top floating */}
            <div className="mb-10 ">
                <h2 className="text-xl font-semibold mb-4">Text top floating</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <div className="w-full max-w-md py-8">
                            <ProgressBar value={20} labelPosition="top-floating" />
                        </div>
                    </div>
                    <CodeBlock
                        className="mt-2 max-w-md"
                        code={`<ProgressBar value={20} labelPosition="top-floating" />`}
                    />
                </div>
            </div>

            {/* Text bottom floating */}
            <div className="mb-10 ">
                <h2 className="text-xl font-semibold mb-4">Text bottom floating</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <div className="w-full max-w-md py-8">
                            <ProgressBar value={80} labelPosition="bottom-floating" />
                        </div>
                    </div>
                    <CodeBlock
                        className="mt-2 max-w-md"
                        code={`<ProgressBar value={80} labelPosition="bottom-floating" />`}
                    />
                </div>
            </div>
            {/* Circle progress bar */}
            <div className="mb-10 ">
                <h2 className="text-xl font-semibold mb-4">Circle progress bar</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <div className="flex flex-col items-start gap-10 md:flex-row">
                            <ProgressBarCircle size="xxs" value={40} />
                            <ProgressBarCircle size="xs" value={40} />
                            <ProgressBarCircle size="sm" value={40} />
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-4 mt-2">
                        <CodeBlock
                            className="max-w-md flex-1"
                            code={`<ProgressBarCircle size="xxs" value={40} />`}
                        />
                        <CodeBlock
                            className="max-w-md flex-1"
                            code={`<ProgressBarCircle size="xs" value={40} />`}
                        />
                        <CodeBlock
                            className="max-w-md flex-1"
                            code={`<ProgressBarCircle size="sm" value={40} />`}
                        />
                    </div>
                </div>
            </div>

            {/* Circle progress bar label */}
            <div className="mb-10 ">
                <h2 className="text-xl font-semibold mb-4">Circle progress bar label</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <div className="flex flex-col items-start gap-10 md:flex-row">
                            <ProgressBarCircle size="xxs" value={40} label="Progrès" />
                            <ProgressBarCircle size="xs" value={40} label="Progrès" />
                            <ProgressBarCircle size="sm" value={40} label="Progrès" />
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-4 mt-2">
                        <CodeBlock
                            className="max-w-md flex-1"
                            code={`<ProgressBarCircle size="xxs" value={40} label="Progrès" />`}
                        />
                        <CodeBlock
                            className="max-w-md flex-1"
                            code={`<ProgressBarCircle size="xs" value={40} label="Progrès" />`}
                        />
                        <CodeBlock
                            className="max-w-md flex-1"
                            code={`<ProgressBarCircle size="sm" value={40} label="Progrès" />`}
                        />
                    </div>
                </div>
            </div>

            {/* Half circle progress bar */}
            <div className="mb-10 ">
                <h2 className="text-xl font-semibold mb-4">Half circle progress bar</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <div className="flex flex-col items-start gap-10 md:flex-row">
                            <ProgressBarHalfCircle size="xxs" value={60} />
                            <ProgressBarHalfCircle size="xs" value={60} />
                            <ProgressBarHalfCircle size="sm" value={60} />
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-4 mt-2">
                        <CodeBlock
                            className="max-w-md flex-1"
                            code={`<ProgressBarHalfCircle size="xxs" value={60} />`}
                        />
                        <CodeBlock
                            className="max-w-md flex-1"
                            code={`<ProgressBarHalfCircle size="xs" value={60} />`}
                        />
                        <CodeBlock
                            className="max-w-md flex-1"
                            code={`<ProgressBarHalfCircle size="sm" value={60} />`}
                        />
                    </div>
                </div>
            </div>
            {/* Half circle progress bar label */}
            <div className="mb-10 ">
                <h2 className="text-xl font-semibold mb-4">Half circle progress bar label</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <div className="flex flex-col items-start gap-10 md:flex-row">
                            <ProgressBarHalfCircle size="xxs" value={60} label="Objectif" />
                            <ProgressBarHalfCircle size="xs" value={60} label="Objectif" />
                            <ProgressBarHalfCircle size="sm" value={60} label="Objectif" />
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-4 mt-2">
                        <CodeBlock
                            className="max-w-md flex-1"
                            code={`<ProgressBarHalfCircle size="xxs" value={60} label="Objectif" />`}
                        />
                        <CodeBlock
                            className="max-w-md flex-1"
                            code={`<ProgressBarHalfCircle size="xs" value={60} label="Objectif" />`}
                        />
                        <CodeBlock
                            className="max-w-md flex-1"
                            code={`<ProgressBarHalfCircle size="sm" value={60} label="Objectif" />`}
                        />
                    </div>
                </div>
            </div>

            {/* API Reference */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border-tertiary">
                        <thead>
                            <tr className="border-b border-tertiary">
                                <th className="py-2 px-4 text-left">Props</th>
                                <th className="py-2 px-4 text-left">Type</th>
                                <th className="py-2 px-4 text-left">Default</th>
                                <th className="py-2 px-4 text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">value</td>
                                <td className="py-2 px-4 font-mono text-sm">number</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    The current value of the progress indicator.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">min?</td>
                                <td className="py-2 px-4 font-mono text-sm">number</td>
                                <td className="py-2 px-4 font-mono text-sm">0</td>
                                <td className="py-2 px-4">
                                    The minimum value of the progress indicator.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">max?</td>
                                <td className="py-2 px-4 font-mono text-sm">number</td>
                                <td className="py-2 px-4 font-mono text-sm">100</td>
                                <td className="py-2 px-4">
                                    The maximum value of the progress indicator.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">labelPosition?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {`"right" | "bottom" | "top-floating" | "bottom-floating"`}
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Label position for the progress bar.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">getValueLabel?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {`function (value: number, max: number) => string`}
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    A function to get the accessible label text representing the
                                    current value in a human-readable format for the progress bar.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">size?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {`'xxs' | 'xs' | 'sm' | 'md' | 'lg'`}
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">{"xxs"}</td>
                                <td className="py-2 px-4">Size for circles progress indicators.</td>
                            </tr>

                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">Label?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Accessible label for circles progress indicator.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">className?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Additional CSS classes to apply to the progress indicator.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
