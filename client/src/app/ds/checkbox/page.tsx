"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Checkbox, CheckboxForm } from "@/components/ui/checkbox";
import { CodeBlock } from "@/ds/components/code-block";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export default function CheckboxPage() {
    const schema = z.object({
        terms: z.boolean(),
    });

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { terms: false },
    });

    return (
        <div className="container mx-auto py-10 px-4">
            {/* Header */}
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Checkbox</h1>
                <p className="text-muted-foreground mt-2">
                    A control that allows users to select one or multiple options, including an
                    indeterminate state.
                </p>
            </div>

            {/* Base */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Base</h2>
                <div className="p-4 border border-tertiary rounded-lg flex gap-4">
                    <Checkbox />
                    <Checkbox defaultChecked />
                </div>
                <CodeBlock code={`<Checkbox />\n<Checkbox defaultChecked />`} />
            </div>

            {/* Disabled */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Disabled</h2>
                <div className="p-4 border border-tertiary rounded-lg flex gap-4">
                    <Checkbox disabled />
                    <Checkbox defaultChecked disabled />
                </div>
                <CodeBlock code={`<Checkbox disabled />\n<Checkbox defaultChecked disabled />`} />
            </div>

            {/* Sizes */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sizes</h2>
                <div className="p-4 border border-tertiary rounded-lg flex gap-6 items-center">
                    <Checkbox size="sm" defaultChecked />
                    <Checkbox size="md" defaultChecked />
                </div>
                <CodeBlock
                    code={`<Checkbox size="sm" defaultChecked  />\n<Checkbox size="md" defaultChecked />`}
                />
            </div>

            {/* States */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">States</h2>
                <div className="p-4 border border-tertiary rounded-lg flex gap-6 items-center">
                    <Checkbox />
                    <Checkbox defaultChecked />
                    <Checkbox checked="indeterminate" />
                </div>
                <CodeBlock
                    code={`<Checkbox />\n<Checkbox defaultChecked />\n<Checkbox checked="indeterminate" />`}
                />
            </div>

            {/* Form Integration */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Form Integration</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(data =>
                                toast("You submitted the following values", {
                                    description: (
                                        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
                                            <code className="text-white">
                                                {JSON.stringify(data, null, 2)}
                                            </code>
                                        </pre>
                                    ),
                                })
                            )}
                            className="space-y-4"
                        >
                            <CheckboxForm
                                control={form.control}
                                name="terms"
                                label="Accept terms and conditions"
                                description="You must accept before submitting."
                            />
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </div>
                <CodeBlock
                    code={`<CheckboxForm
  control={form.control}
  name="terms"
  label="Accept terms and conditions"
  description="You must accept before submitting."
/>`}
                />
            </div>

            {/* API Reference Checkbox */}
            <h1 className="text-xl font-medium mb-10">API Reference</h1>
            <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">Checkbox</h2>
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
                                <td className="py-2 px-4 font-mono text-sm">size?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`"sm" | "md"`}</td>
                                <td className="py-2 px-4 font-mono text-sm">{`"sm"`}</td>
                                <td className="py-2 px-4">Size of the checkbox.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">checked?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`boolean | 'indeterminate'`}</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    The controlled state of the switch. Must be used in conjunction
                                    with onCheckedChange.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">onCheckedChange?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    funtion[ (checked: boolean) =&gt; void]
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Event handler called when the state of the switch changes.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">defaultChecked?</td>
                                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                                <td className="py-2 px-4 font-mono text-sm">false</td>
                                <td className="py-2 px-4">Initial unchecked/checked state.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">className?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Additional styles for checkbox.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CheckboxForm */}
            <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">CheckboxForm</h2>
                <p>
                    The following props plus reac-hook-form props (name, control...) and all
                    Checkbox props execpt defaultChecked, checked and onCheckedChange
                </p>
                <div className="overflow-x-auto mt-4">
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
                                <td className="py-2 px-4 font-mono text-sm">label?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Form label</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">labelTooltip?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Form label tooltip</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">description?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Form description</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">isRequired?</td>
                                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                                <td className="py-2 px-4 font-mono text-sm">false</td>
                                <td className="py-2 px-4">To indicate requirement to users.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">wrapperClassName?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Additional styles for Ckexbox, label and description wrapper.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
