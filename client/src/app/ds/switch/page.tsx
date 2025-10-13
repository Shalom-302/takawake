"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Switch, SwitchForm } from "@/components/ui/switch";
import { CodeBlock } from "@/ds/components/code-block";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function SwitchPage() {
    const schema = z.object({
        newsletter: z.boolean(),
    });

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { newsletter: false },
    });

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Switch</h1>
                <p className="text-muted-foreground mt-2">
                    A control that toggles between checked and unchecked states.
                </p>
            </div>

            {/* Base */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Base</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="flex gap-4">
                        <Switch />
                        <Switch defaultChecked />
                    </div>
                    <CodeBlock code={`<Switch />\n<Switch defaultChecked />`} />
                </div>
            </div>

            {/* Disabled */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Disabled</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="flex gap-4">
                        <Switch disabled />
                        <Switch defaultChecked disabled />
                    </div>
                    <CodeBlock code={`<Switch disabled />\n<Switch defaultChecked disabled />`} />
                </div>
            </div>

            {/* Sizes */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sizes</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="flex items-center gap-6">
                        <Switch size="sm" defaultChecked />
                        <Switch size="md" defaultChecked />
                    </div>
                    <CodeBlock
                        code={`<Switch size="sm" defaultChecked />\n<Switch size="md" defaultChecked />`}
                    />
                </div>
            </div>

            {/* Slim variant */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Slim Variant</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="flex items-center gap-6">
                        <Switch variant="slim" size="sm" defaultChecked />
                        <Switch variant="slim" size="md" defaultChecked />
                    </div>
                    <CodeBlock
                        code={`<Switch variant="slim" size="sm" defaultChecked />\n<Switch variant="slim" size="md" defaultChecked />`}
                    />
                </div>
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
                            <SwitchForm
                                control={form.control}
                                name="newsletter"
                                label="Receive newsletter"
                                description="Stay updated with the latest news."
                                isRequired
                            />
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                    <CodeBlock
                        code={`<SwitchForm
  control={form.control}
  name="newsletter"
  label="Receive newsletter"
  description="Stay updated with the latest news."
  isRequired
/>`}
                    />
                </div>
            </div>

            {/* API Reference */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>
                <div className="overflow-x-auto">
                    <h3 className="text-lg font-medium">Switch</h3>
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
                                <td className="py-2 px-4 font-mono text-sm">variant?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`"default" | "slim"`}</td>
                                <td className="py-2 px-4 font-mono text-sm">{`"default"`}</td>
                                <td className="py-2 px-4">Visual style of the switch.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">size?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`"sm" | "md"`}</td>
                                <td className="py-2 px-4 font-mono text-sm">{`"sm"`}</td>
                                <td className="py-2 px-4">Size of the switch.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">checked?</td>
                                <td className="py-2 px-4 font-mono text-sm">boolean</td>
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
                                <td className="py-2 px-4 font-mono text-sm">disabled?</td>
                                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                                <td className="py-2 px-4 font-mono text-sm">false</td>
                                <td className="py-2 px-4">Disable interaction.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">className?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Additional styles for Switch.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="overflow-x-auto mt-10">
                    <h3 className="text-lg font-medium">SwitchForm</h3>
                    <p>
                        The following props plus reac-hook-form props (name, control...) and all
                        Switch props execpt defaultChecked, checked and onCheckedChange
                    </p>
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
                                    Additional styles for Switch, label and description wrapper.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
