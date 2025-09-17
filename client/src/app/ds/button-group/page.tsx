"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CodeBlock } from "@/ds/components/code-block";
import { Archive, Edit03, Trash01 } from "@untitled-ui/icons-react";
import { ButtonGroup, ButtonGroupItem, ButtonGroupItemProps } from "@/components/ui/buttons";

export default function ButtonGroupPage() {
    const defaultItems = [
        { value: "archive", children: "Archive" },
        { value: "edit", children: "Edit" },
        { value: "delete", children: "Delete" },
    ];

    const iconItems = [
        {
            value: "archive",
            leftIcon: Archive,
            children: "Archive",
        },
        {
            value: "edit",
            leftIcon: Edit03,
            children: "Edit",
        },
        {
            value: "delete",
            leftIcon: Trash01,
            children: "Delete",
        },
    ];

    const singleSelectionItems = [
        { value: "today", children: "Today" },
        { value: "tomorrow", children: "Tomorrow" },
        { value: "thisweek", children: "This week" },
    ];

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">ButtonGroup</h1>
                <p className="text-secondary mt-2">
                    Toggle group component built on Radix UI with support for icons, single/multiple
                    selection, and disabled states.
                </p>
            </div>

            {/* Default */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Default</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <ButtonGroup type="single" value="" items={defaultItems} />
                    <CodeBlock
                        className="mt-2"
                        code={`<ButtonGroup value="" items={[
        {
            value: "archive",
            lefIcon: { Archive },
            children: "Archive",
        },
        {
            value: "edit",
            lefIcon: { Edit03 },
            children: "Edit",
        },
        {
            value: "delete",
            lefIcon: { Trash01 },
            children: "Delete",
        },
    ]} />`}
                    />
                </div>
            </div>

            {/* Sizes */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sizes</h2>
                <div className="p-4 border border-tertiary rounded-lg space-x-4">
                    <ButtonGroup type="single" value="" size="sm" items={defaultItems} />
                    <ButtonGroup type="single" value="" size="md" items={defaultItems} />
                    <ButtonGroup type="single" value="" size="lg" items={defaultItems} />
                </div>
                <CodeBlock
                    className="mt-2"
                    code={`<ButtonGroup size="sm" items={...} />
<ButtonGroup size="md" items={...} />
<ButtonGroup size="lg" items={...} />`}
                />
            </div>

            {/* With Leading Icons */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">With Leading Icons</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <ButtonGroup type="single" value="" items={iconItems} />
                    <CodeBlock
                        className="mt-2"
                        code={`<ButtonGroup value="" items={[
        {
            value: "archive",
            lefIcon: { Archive },
            children: "Archive",
        },
        {
            value: "edit",
            lefIcon: { Edit03 },
            children: "Edit",
        },
        {
            value: "delete",
            lefIcon: { Trash01 },
            children: "Delete",
        },
    ]} />`}
                    />
                </div>
            </div>

            {/* Mixed Usage (items prop + child component) */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">
                    Mixed Usage (items prop + child component)
                </h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <ButtonGroup type="single" value="">
                        <ButtonGroupItem value="archive">Archive</ButtonGroupItem>
                        <ButtonGroupItem value="edit">Edit</ButtonGroupItem>
                        <ButtonGroupItem value="delete">Delete</ButtonGroupItem>
                    </ButtonGroup>
                    <CodeBlock
                        className="mt-2"
                        code={`<ButtonGroup value="">
  <ButtonGroupItem value="archive">Archive</ButtonGroupItem>
  <ButtonGroupItem value="edit">Edit</ButtonGroupItem>
  <ButtonGroupItem value="delete">Delete</ButtonGroupItem>
</ButtonGroup>`}
                    />
                </div>
            </div>

            {/* Disabled */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Disabled</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <ButtonGroup type="single" value="" disabled items={defaultItems} />
                    <CodeBlock
                        className="mt-2"
                        code={`<ButtonGroup value="" disabled items={[
  { value: "archive", children: "Archive" },
  { value: "edit", children: "Edit" },
  { value: "delete", children: "Delete" },
]} />`}
                    />
                </div>
            </div>

            {/* Single Selection */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Single Selection</h2>
                <SingleSelectionExample items={singleSelectionItems} />
            </div>

            {/* Multiple Selection */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Multiple Selection</h2>
                <MultipleSelectionExample items={singleSelectionItems} />
            </div>

            {/* API Reference */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>
                <p className="text-sm text-secondary mb-2">
                    {`The ButtonGroup component is built on Radix UI's ToggleGroup primitive. It inherits all of its props and behaviors.`}
                </p>
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
                                <td className="py-2 px-4 font-mono text-sm">value</td>
                                <td className="py-2 px-4 font-mono text-sm">string | string[]</td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Selected value(s) for the ButtonGroup.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">onValueChange</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    (value: string | string[]) =&gt; void
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">Callback when selection changes.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">type?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    {`"single" | "multiple"`}
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">{`"single"`}</td>
                                <td className="py-2 px-4">Single or multiple selection mode.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">size?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`"sm" | "md" | "lg"`}</td>
                                <td className="py-2 px-4 font-mono text-sm">{`"md"`}</td>
                                <td className="py-2 px-4">Button size.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">items?</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                    ButtonGroupItemProps[]
                                </td>
                                <td className="py-2 px-4 font-mono text-sm">-</td>
                                <td className="py-2 px-4">
                                    Array of items to render within the group.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">disabled?</td>
                                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                                <td className="py-2 px-4 font-mono text-sm">false</td>
                                <td className="py-2 px-4">
                                    Disable the button or the entire group.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <h3 className="text-lg font-semibold mt-8 mb-4">ButtonGroupItem</h3>
                <p className="text-sm text-secondary mb-2">
                    {`The ButtonGroupItem component inherits all of its props and behaviors from Radix UI's ToggleGroupItem primitive.`}
                </p>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-tertiary">
                                <th className="py-2 px-4 text-left">Prop</th>
                                <th className="py-2 px-4 text-left">Type</th>
                                <th className="py-2 px-4 text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">value</td>
                                <td className="py-2 px-4 font-mono text-sm">string</td>
                                <td className="py-2 px-4">The value of the toggle item.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">leftIcon?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`React.ComponentType<{ className?: string }> | React.ReactNode`}</td>
                                <td className="py-2 px-4">
                                    Icon to be rendered before the children.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">rightIcon?</td>
                                <td className="py-2 px-4 font-mono text-sm">{`React.ComponentType<{ className?: string }> | React.ReactNode`}</td>
                                <td className="py-2 px-4">
                                    Icon to be rendered after the children.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">children?</td>
                                <td className="py-2 px-4 font-mono text-sm">React.ReactNode</td>
                                <td className="py-2 px-4">
                                    The content of the button. This is where you pass text or icons.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-mono text-sm">disabled?</td>
                                <td className="py-2 px-4 font-mono text-sm">boolean</td>
                                <td className="py-2 px-4">Disable the individual button item.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ─── Examples ─────────────────────────────
const SingleSelectionExample = ({ items }: { items: ButtonGroupItemProps[] }) => {
    const [value, setValue] = useState("today");

    return (
        <div className="p-4 border border-tertiary rounded-lg">
            <ButtonGroup type="single" value={value} onValueChange={setValue} items={items} />
            <CodeBlock
                className="mt-2"
                code={`<ButtonGroup value={value} onValueChange={setValue} items={items} />`}
            />
        </div>
    );
};

const MultipleSelectionExample = ({ items }: { items: ButtonGroupItemProps[] }) => {
    const [values, setValues] = useState<string[]>(["today"]);

    return (
        <div className="p-4 border border-tertiary rounded-lg">
            <ButtonGroup type="multiple" value={values} onValueChange={setValues} items={items} />
            <CodeBlock
                className="mt-2"
                code={`<ButtonGroup type="multiple" value={values} onValueChange={setValues} items={items} />`}
            />
        </div>
    );
};
