"use client";
import React from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { CodeBlock } from "@/ds/components/code-block";

export default function CheckboxPage() {
    const sizes = ["sm", "md"];
    const states = [
        { label: "Unchecked", props: {} },
        { label: "Checked", props: { checked: true } },
        { label: "Indeterminate", props: { checked: "indeterminate" as const } },
        { label: "Disabled", props: { disabled: true } },
        { label: "Disabled & Checked", props: { checked: true, disabled: true } },
    ];

    return (
        <div className="container mx-auto py-10 px-4">
            {/* Header */}
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Checkbox</h1>
                <p className="text-secondary mt-2">
                    Accessible checkbox component with size variants, labels, hint text, and support
                    for indeterminate state.
                </p>
            </div>

            {/* Sizes */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sizes</h2>
                <div className="flex flex-col gap-4 p-4 border border-tertiary rounded-lg">
                    {sizes.map(size => (
                        <Checkbox
                            key={size}
                            size={size as "sm" | "md"}
                            label={`Checkbox ${size}`}
                            hint={
                                size === "md"
                                    ? "Larger checkbox for better accessibility"
                                    : undefined
                            }
                        />
                    ))}
                </div>
                <CodeBlock
                    className="mt-2"
                    code={`<Checkbox size="sm" label="Small checkbox" />
<Checkbox size="md" label="Medium checkbox" hint="Optional hint text" />`}
                />
            </div>

            {/* States */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">States</h2>
                <div className="flex flex-col gap-4 p-4 border border-tertiary rounded-lg">
                    {states.map(state => (
                        <Checkbox key={state.label} label={state.label} {...state.props} />
                    ))}
                </div>
                <CodeBlock
                    className="mt-2 max-w-[400px]"
                    code={`<Checkbox checked />
<Checkbox checked="indeterminate" />
<Checkbox disabled />
<Checkbox checked disabled />`}
                />
            </div>

            {/* With label & hint */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">With label & hint</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <Checkbox
                        size="md"
                        label="Enable notifications"
                        hint="You will receive weekly updates by email"
                    />
                </div>
                <CodeBlock
                    className="mt-2"
                    code={`<Checkbox
  size="md"
  label="Enable notifications"
  hint="You will receive weekly updates by email"
/>`}
                />
            </div>

            {/* API Reference */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
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
                                <td className="py-2 px-4 font-mono text-sm">size?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`"sm" | "md"`}</td>
                                <td className="py-2 px-4 font-mono text-sm">"sm"</td>
                                <td className="py-2 px-4">Size of the checkbox.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">label?</td>
                                <td className="py-2 px-4 font-mono text-sm">React.ReactNode</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Optional label text displayed next to the checkbox.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">hint?</td>
                                <td className="py-2 px-4 font-mono text-sm">React.ReactNode</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Optional hint text below the label.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">defaultChecked?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`boolean | "indeterminate"`}</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    The checked state of the checkbox when it is initially rendered.
                                    Use when you do not need to control its checked state.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">checked?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`boolean | "indeterminate"`}</td>
                                <td className="py-2 px-4 font-mono text-sm">false</td>
                                <td className="py-2 px-4">
                                    The controlled checked state of the checkbox. Must be used in
                                    conjunction with onCheckedChange.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">onCheckedChange?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`(checked: boolean | 'indeterminate') => void`}</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Event handler called when the checked state of the checkbox
                                    changes.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">disabled?</td>
                                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                                <td className="py-2 px-4 font-mono text-sm">false</td>
                                <td className="py-2 px-4">
                                    Disable the checkbox and apply disabled styles.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">name?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">on</td>
                                <td className="py-2 px-4">
                                    The name of the checkbox. Submitted with its owning form as part
                                    of a name/value pair.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">value?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    The value given as data when submitted with a name.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">className?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Additional CSS classes.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
