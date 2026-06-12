"use client";

import React from "react";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { CodeBlock } from "@/components/ui/code-block";

export default function SliderPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Slider</h1>
                <p className="text-muted-foreground mt-2">
                    A control that lets users select a value or range within a given interval.
                </p>
            </div>

            {/* Base Example */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Base Example</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4 max-w-md py-8">
                        <Slider defaultValue={[0, 25]} />
                    </div>
                    <CodeBlock code={`<Slider defaultValue={[0, 25]} />`} />
                </div>
            </div>

            {/* Bottom Label */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Label Bottom</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4 max-w-md py-8">
                        <Slider defaultValue={[10, 40]} labelPosition="bottom" />
                    </div>
                    <CodeBlock code={`<Slider defaultValue={[10, 40]} labelPosition="bottom" />`} />
                </div>
            </div>

            {/* Top Floating Label */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Label Top Floating</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4 max-w-md py-8">
                        <Slider defaultValue={[20, 60]} labelPosition="top-floating" />
                    </div>
                    <CodeBlock
                        code={`<Slider defaultValue={[20, 60]} labelPosition="top-floating" />`}
                    />
                </div>
            </div>

            {/* Single Thumb */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Single Thumb</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4 max-w-md py-8">
                        <Slider defaultValue={[50]} labelPosition="top-floating" />
                    </div>
                    <CodeBlock
                        code={`<Slider defaultValue={[50]} labelPosition="top-floating" />`}
                    />
                </div>
            </div>

            {/* Custom Formatter */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Custom Label Formatter</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4 max-w-md py-8">
                        <Slider
                            defaultValue={[30]}
                            labelPosition="top-floating"
                            labelFormatter={v => `${v}px`}
                        />
                    </div>
                    <CodeBlock
                        code={`<Slider 
  defaultValue={[30]} 
  labelPosition="top-floating" 
  labelFormatter={(v) => \`\${v}px\`} 
/>`}
                    />
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
                                <td className="py-2 px-4 font-mono text-sm">number[]</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Controlled value of the slider.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">defaultValue</td>
                                <td className="py-2 px-4 font-mono text-sm">number[]</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Initial value for uncontrolled mode.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">min?</td>
                                <td className="py-2 px-4 font-mono text-sm">number</td>
                                <td className="py-2 px-4 font-mono text-sm">0</td>
                                <td className="py-2 px-4">Minimum slider value.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">max?</td>
                                <td className="py-2 px-4 font-mono text-sm">number</td>
                                <td className="py-2 px-4 font-mono text-sm">100</td>
                                <td className="py-2 px-4">Maximum slider value.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">step?</td>
                                <td className="py-2 px-4 font-mono text-sm">number</td>
                                <td className="py-2 px-4 font-mono text-sm">1</td>
                                <td className="py-2 px-4">Step between values.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">labelPosition?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {"'default' | 'bottom' | 'top-floating'"}
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">{`"default"`}</td>
                                <td className="py-2 px-4">Position of the thumb label.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">labelFormatter?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    (value: number) =&gt; string
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">{`(v) => v + "%"`}</td>
                                <td className="py-2 px-4">Custom formatter for label text.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">className?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Additional classes for styling.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
