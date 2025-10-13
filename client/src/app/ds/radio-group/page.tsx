"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { RadioGroup, RadioGroupForm } from "@/components/ui/radio-group";
import { CodeBlock } from "@/components/ui/code-block";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export default function RadioGroupPage() {
    const schema = z.object({
        plan: z.string(),
    });

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { plan: "basic" },
    });

    const planOptions = [
        {
            value: "basic",
            label: "Basic Plan",
            description: "Perfect for individuals getting started",
        },
        {
            value: "pro",
            label: "Pro Plan",
            description: "Best for growing teams and businesses",
        },
        {
            value: "enterprise",
            label: "Enterprise Plan",
            description: "Advanced features for large organizations",
        },
    ];

    return (
        <div className="container mx-auto py-10 px-4">
            {/* Header */}
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">RadioGroup</h1>
                <p className="text-muted-foreground mt-2">
                    A control that allows users to select a single option from a list of mutually
                    exclusive options.
                </p>
            </div>

            {/* Base */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Base</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <RadioGroup
                        defaultValue="option1"
                        items={[
                            { value: "option1", label: "Option 1" },
                            { value: "option2", label: "Option 2" },
                            { value: "option3", label: "Option 3" },
                        ]}
                    />
                </div>
                <CodeBlock
                    code={`<RadioGroup 
  defaultValue="option1"
  items={[
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ]}
/>`}
                />
            </div>

            {/* With descriptions */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">With descriptions</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <RadioGroup
                        defaultValue="basic"
                        items={[
                            {
                                value: "basic",
                                label: "Basic",
                                description: "Perfect for individuals",
                            },
                            {
                                value: "pro",
                                label: "Pro",
                                description: "Best for growing teams",
                            },
                            {
                                value: "enterprise",
                                label: "Enterprise",
                                description: "Advanced features",
                            },
                        ]}
                    />
                </div>
                <CodeBlock
                    code={`<RadioGroup 
  defaultValue="basic"
  items={[
    {
      value: "basic",
      label: "Basic",
      description: "Perfect for individuals"
    },
    {
      value: "pro",
      label: "Pro", 
      description: "Best for growing teams"
    },
    {
      value: "enterprise",
      label: "Enterprise",
      description: "Advanced features"
    },
  ]}
/>`}
                />
            </div>

            {/* Disabled */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Disabled</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <RadioGroup
                        value={"option1"}
                        items={[
                            {
                                value: "option1",
                                label: "Checked disabled",
                                disabled: true,
                            },
                            { value: "option2", label: "Unchecked and disabled", disabled: true },
                        ]}
                    />
                </div>
                <CodeBlock
                    code={` <RadioGroup
  items={[
      {
          value: "option1",
          label: "Checked disabled",
          checked: true,
          disabled: true,
      },
      { value: "option2", label: "Unchecked and disabled", disabled: true },
  ]}
/>`}
                />
            </div>

            {/* Sizes */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sizes</h2>
                <div className="p-4 border border-tertiary rounded-lg space-y-6">
                    <div className="flex flex-col gap-4">
                        <RadioGroup
                            size="sm"
                            defaultValue="sm1"
                            items={[{ value: "sm1", label: "Small size" }]}
                        />
                        <RadioGroup
                            size="md"
                            defaultValue="md1"
                            items={[{ value: "md1", label: "Medium size" }]}
                        />
                    </div>
                </div>
                <CodeBlock
                    code={`<RadioGroup 
  size="sm" 
  defaultValue="sm1"
  items={[
    { value: "sm1", label: "Small option", description: "Size sm" },
    { value: "sm2", label: "Another small option" },
  ]}
/>

<RadioGroup 
  size="md" 
  defaultValue="md1"
  items={[
    { value: "md1", label: "Medium option", description: "Size md" },
    { value: "md2", label: "Another medium option" },
  ]}
/>`}
                />
            </div>

            {/* Without labels */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Without labels</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <RadioGroup
                        defaultValue="option1"
                        className="flex-row gap-4"
                        items={[{ value: "option1" }, { value: "option2" }, { value: "option3" }]}
                    />
                </div>
                <CodeBlock
                    code={`<RadioGroup 
  defaultValue="option1" 
  className="flex-row gap-4"
  items={[
    { value: "option1" },
    { value: "option2" },
    { value: "option3" },
  ]}
/>`}
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
                            <RadioGroupForm
                                control={form.control}
                                name="plan"
                                groupLabel="Choose your plan"
                                groupDescription="Select the plan that best fits your needs."
                                options={planOptions}
                            />
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </div>
                <CodeBlock
                    code={`<RadioGroupForm
  control={form.control}
  name="plan"
  groupLabel="Choose your plan"
  groupDescription="Select the plan that best fits your needs."
  options={planOptions}
/>`}
                />
            </div>

            {/* API Reference */}
            <h1 className="text-xl font-medium mb-10">API Reference</h1>

            {/* RadioGroup */}
            <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">RadioGroup</h2>
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
                                <td className="py-2 px-4">Size of the radio group items.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">value?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    The controlled value of the radio group. Must be used in
                                    conjunction with onValueChange.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">onValueChange?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    function[(value: string) =&gt; void]
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Event handler called when the value of the radio group changes.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">defaultValue?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Initial selected value.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">disabled?</td>
                                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                                <td className="py-2 px-4 font-mono text-sm">false</td>
                                <td className="py-2 px-4">
                                    When true, prevents the user from interacting with radio items.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">items</td>
                                <td className="py-2 px-4 font-mono text-sm">RadioItem[]</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Array of items to render in the radio group.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* RadioItem */}
            <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">RadioItem</h2>
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
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">The unique value of the radio item.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">size?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`"sm" | "md"`}</td>
                                <td className="py-2 px-4 font-mono text-sm">{`"sm"`}</td>
                                <td className="py-2 px-4">Size of the radio item.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">label?</td>
                                <td className="py-2 px-4 font-mono text-sm">React.ReactNode</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">The label text for the radio item.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">description?</td>
                                <td className="py-2 px-4 font-mono text-sm">React.ReactNode</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    The description text for the radio item.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">disabled?</td>
                                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                                <td className="py-2 px-4 font-mono text-sm">false</td>
                                <td className="py-2 px-4">
                                    When true, prevents the user from interacting with the item.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">className?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Additional styles for the radio item.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* RadioGroupForm */}
            <div className="mb-10">
                <h2 className="text-lg font-medium mb-4">RadioGroupForm</h2>
                <p>
                    The following props plus react-hook-form props (name, control...) and all
                    RadioGroup props except defaultValue, value and onValueChange
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
                                <td className="py-2 px-4 font-mono text-sm">groupLabel?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Form label for the radio group</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">groupLabelTooltip?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Form label tooltip</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">groupDescription?</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Form description for the radio group</td>
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
                                    Additional styles for RadioGroup, label and description wrapper.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">options</td>
                                <td className="py-2 px-4 font-mono text-sm">RadioItem[]</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Array of options for the radio group.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
