import React from "react";
import Link from "next/link";

import { CodeBlock } from "@/ds/components/code-block";

import {
    Accordion,
    AccordionContentVariants,
    AccordionItemVariants,
} from "@/components/ui/accordion";

export default function AccordionPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Accordion</h1>
                <p className="text-muted-foreground mt-2">
                    Simplified API for the Accordion component, allowing you to define elements and
                    their content in one go.
                </p>
            </div>

            {/* Base example */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Base example</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <Accordion
                            type="single"
                            items={[
                                {
                                    value: "item-1",
                                    trigger: "What is Accordion ?",
                                    content: (
                                        <p>
                                            Accordion is a component that simplifies the use of
                                            accordions by allowing you to define elements and their
                                            content in one go.
                                        </p>
                                    ),
                                },
                                {
                                    value: "item-2",
                                    trigger: "How to use it ?",
                                    content: (
                                        <p>
                                            Just pass an array of objects with the properties value,
                                            trigger and content.
                                        </p>
                                    ),
                                },
                                {
                                    value: "item-3",
                                    trigger: "What are the advantages ?",
                                    content: (
                                        <p>
                                            Less code to write, easier to maintain, and a more
                                            intuitive API.
                                        </p>
                                    ),
                                },
                            ]}
                        />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`
  <Accordion
    type="single"
    items={[
      {
        value: "item-1",
        trigger: "What is Accordion ?",
        content: <p>Accordion is a component that simplifies the use of accordions by allowing you to define elements and their content in one go.</p>
      },
      {
        value: "item-2",
        trigger: "How to use it ?",
        content: <p>Just pass an array of objects with the properties value, trigger and content.</p>
      },
      {
        value: "item-3",
        trigger: "What are the advantages ?",
        content: <p>Less code to write, easier to maintain, and a more intuitive API.</p>
      }
    ]}
  />
`}
                    />
                </div>
            </div>

            {/* Variants */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Variants</h2>
                <div className="grid grid-cols-1 gap-8">
                    {["default", "bordered", "card"].map(variant => (
                        <div key={variant} className="p-4 border border-tertiary rounded-lg">
                            <p className="text-sm text-muted-foreground mb-4">
                                <strong>Variant: {variant}</strong>
                            </p>
                            <div className="mb-4">
                                <Accordion
                                    type="single"
                                    itemVariant={variant as AccordionItemVariants["itemVariant"]}
                                    items={[
                                        {
                                            value: "item-1",
                                            trigger: `Element 1 (variant ${variant})`,
                                            content: <p>Content with variant {variant}</p>,
                                        },
                                        {
                                            value: "item-2",
                                            trigger: `Element 2 (variant ${variant})`,
                                            content: <p>Content with variant {variant}</p>,
                                        },
                                    ]}
                                />
                            </div>
                            <CodeBlock
                                className="mt-2"
                                code={`
<Accordion
  type="single" 
  variant="${variant}"
  items={[
    {
      value: "item-1",
      trigger: "Element 1 (variant ${variant})",
      content: <p>Content with variant ${variant}</p>
    },
    {
      value: "item-2",
      trigger: "Element 2 (variant ${variant})",
      content: <p>Content with variant ${variant}</p>
    }
  ]}
/>`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Content styles */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Content styles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {["default", "filled"].map(style => (
                        <div key={style} className="p-4 border border-tertiary rounded-lg">
                            <p className="text-sm text-muted-foreground mb-4">
                                <strong>Content Style: {style}</strong>
                            </p>
                            <div className="mb-4">
                                <Accordion
                                    type="single"
                                    contentVariant={
                                        style as AccordionContentVariants["contentVariant"]
                                    }
                                    items={[
                                        {
                                            value: "item-1",
                                            trigger: `Element 1 (content ${style})`,
                                            content: <p>Content with style {style}</p>,
                                        },
                                        {
                                            value: "item-2",
                                            trigger: `Element 2 (content ${style})`,
                                            content: <p>Content with style {style}</p>,
                                        },
                                    ]}
                                />
                            </div>
                            <CodeBlock
                                className="mt-2"
                                code={`<Accordion
  contentStyle="${style}"
  items={[
    {
      value: "item-1",
      trigger: "Element 1 (content ${style})",
      content: <p>Content with style ${style}</p>
    },
    {
      value: "item-2",
      trigger: "Element 2 (content ${style})",
      content: <p>Content with style ${style}</p>
    }
  ]}
/>`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Multiple */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Multiple</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                        <strong>Type: multiple</strong> - Allows opening multiple elements at the
                        same time
                    </p>
                    <div className="mb-4">
                        <Accordion
                            type="multiple"
                            defaultValue={["item-1", "item-3"]}
                            items={[
                                {
                                    value: "item-1",
                                    trigger: "Element 1 (default open)",
                                    content: <p>Content of element 1</p>,
                                },
                                {
                                    value: "item-2",
                                    trigger: "Element 2",
                                    content: <p>Content of element 2</p>,
                                },
                                {
                                    value: "item-3",
                                    trigger: "Element 3 (default open)",
                                    content: <p>Content of element 3</p>,
                                },
                            ]}
                        />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`
<Accordion
  type="multiple"
  defaultValue={["item-1", "item-3"]}
  items={[
    {
      value: "item-1",
      trigger: "Element 1 (default open)",
      content: <p>Content of element 1</p>
    },
    {
      value: "item-2",
      trigger: "Element 2",
      content: <p>Content of element 2</p>
    },
    {
      value: "item-3",
      trigger: "Element 3 (default open)",
      content: <p>Content of element 3</p>
    }
  ]}
/>`}
                    />
                </div>
            </div>

            {/* Disabled element */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Disabled element</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <Accordion
                            type="single"
                            items={[
                                {
                                    value: "item-1",
                                    trigger: "Element 1",
                                    content: <p>Content of element 1</p>,
                                },
                                {
                                    value: "item-2",
                                    trigger: "Element 2 (disabled)",
                                    content: <p>Content of element 2</p>,
                                    disabled: true,
                                },
                                {
                                    value: "item-3",
                                    trigger: "Element 3",
                                    content: <p>Content of element 3</p>,
                                },
                            ]}
                        />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`
<Accordion
  type="single"
  items={[
    {
      value: "item-1",
      trigger: "Element 1",
      content: <p>Content of element 1</p>
    },
    {
      value: "item-2",
      trigger: "Element 2 (disabled)",
      content: <p>Content of element 2</p>,
      disabled: true
    },
    {
      value: "item-3",
      trigger: "Element 3",
      content: <p>Content of element 3</p>
    }
  ]}
/>`}
                    />
                </div>
            </div>

            {/* Complete example */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Complete example</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <Accordion
                            itemVariant="card"
                            triggerVariant="filled"
                            contentVariant="filled"
                            type="multiple"
                            defaultValue={["item-1", "item-3"]}
                            items={[
                                {
                                    value: "item-1",
                                    trigger: "Main features",
                                    content: (
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-medium">Main features</h3>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>Simple API for more intuitive use</li>
                                                <li>Full customization of styles and behaviors</li>
                                                <li>
                                                    Support for controlled and uncontrolled modes
                                                </li>
                                            </ul>
                                        </div>
                                    ),
                                },
                                {
                                    value: "item-2",
                                    trigger: "Customization options",
                                    content: (
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-medium">
                                                Customization options
                                            </h3>
                                            <p>
                                                Customize the appearance and behavior of the
                                                accordion with many options.
                                            </p>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>Variants: default, bordered, card</li>
                                                <li>
                                                    Trigger styles: default, filled, underlined,
                                                    ghost
                                                </li>
                                                <li>
                                                    Content styles: default, indented, separated
                                                </li>
                                            </ul>
                                        </div>
                                    ),
                                },
                                {
                                    value: "item-3",
                                    trigger: "Usage examples",
                                    content: (
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-medium">
                                                Common use cases
                                            </h3>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>FAQ (Frequently Asked Questions)</li>
                                                <li>Mobile navigation menus</li>
                                                <li>Reducible content sections</li>
                                                <li>Configuration panels</li>
                                            </ul>
                                        </div>
                                    ),
                                },
                            ]}
                        />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`<Accordion
  itemVariant="card"
  triggerVariant="filled"
  triggerSize="lg"
  contentVariant="filled"
  type="multiple"
  defaultValue={["item-1", "item-3"]}
  items={[
    {
      value: "item-1",
      trigger: "Main features",
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Main features</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Simple API for more intuitive use</li>
            <li>Full customization of styles and behaviors</li>
            <li>Support for controlled and uncontrolled modes</li>
          </ul>
        </div>
      )
    },
    {
      value: "item-2",
      trigger: "Customization options",
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Customization options</h3>
          <p>Customize the appearance and behavior of the accordion with many options.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Variants: default, bordered, card</li>
            <li>Trigger styles: default, filled, underlined, ghost</li>
            <li>Content styles: default, indented, separated</li>
          </ul>
        </div>
      )
    },
    {
      value: "item-3",
      trigger: "Usage examples",
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Common use cases</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>FAQ (Frequently Asked Questions)</li>
            <li>Mobile navigation menus</li>
            <li>Reducible content sections</li>
            <li>Configuration panels</li>
          </ul>
        </div>
      )
    }
  ]}
/>`}
                    />
                </div>
            </div>

            {/* API Reference */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">API Reference</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-tertiary ">
                                <th className="text-left py-2 px-4">Props</th>
                                <th className="text-left py-2 px-4">Type</th>
                                <th className="text-left py-2 px-4">Default</th>
                                <th className="text-left py-2 px-4">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">type</td>
                                <td className="py-2 px-4 text-sm">{`"single" | "multiple"`}</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Type of accordion (only one element open or multiple elements
                                    open)
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">items</td>
                                <td className="py-2 px-4 text-sm">AccordionItem[]</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Array of objects defining the items and their content
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">defaultValue?</td>
                                <td className="py-2 px-4 text-sm">string | string[]</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Default value(s) of the open element
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">value?</td>
                                <td className="py-2 px-4 text-sm">string | string[]</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Value(s) of the open element (controlled mode)
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">onValueChange?</td>
                                <td className="py-2 px-4 text-sm">
                                    {"(value: string | string[]) => void"}
                                </td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Function called when the element changes
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">collapsible?</td>
                                <td className="py-2 px-4 text-sm">boolean</td>
                                <td className="py-2 px-4 text-sm">true</td>
                                <td className="py-2 px-4 text-sm">
                                    If the open element can be closed for (type=single)
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">itemVariant?</td>
                                <td className="py-2 px-4 text-sm">{`"default" | "bordered" | "card"`}</td>
                                <td className="py-2 px-4 text-sm">{`"default"`}</td>
                                <td className="py-2 px-4 text-sm">Variants of the accordion</td>
                            </tr>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">triggerVariant?</td>
                                <td className="py-2 px-4 text-sm">{`"default", "filled", "underlined"`}</td>
                                <td className="py-2 px-4 text-sm">{`"default"`}</td>
                                <td className="py-2 px-4 text-sm">Variants of the trigger</td>
                            </tr>

                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">contentVariant?</td>
                                <td className="py-2 px-4 text-sm">{` "default" | "filled"`}</td>
                                <td className="py-2 px-4 text-sm">{`"default"`}</td>
                                <td className="py-2 px-4 text-sm">Variants of the content</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            {/* AccordionItem API Reference */}
            <div className="mb-10">
                <h3 className="text-md font-semibold mb-4">AccordionItem</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-tertiary">
                                <th className="text-left py-2 px-4">Props</th>
                                <th className="text-left py-2 px-4">Type</th>
                                <th className="text-left py-2 px-4">Default</th>
                                <th className="text-left py-2 px-4">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">value</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Unique identifier of the item</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">trigger</td>
                                <td className="py-2 px-4 text-sm">React.ReactNode</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Content displayed as the item header
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">content</td>
                                <td className="py-2 px-4 text-sm">React.ReactNode</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">
                                    Content displayed when the item is expanded
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">disabled?</td>
                                <td className="py-2 px-4 text-sm">boolean</td>
                                <td className="py-2 px-4 text-sm">false</td>
                                <td className="py-2 px-4 text-sm">
                                    Disables opening/interaction for this item
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
