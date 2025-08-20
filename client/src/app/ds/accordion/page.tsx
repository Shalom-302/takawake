import React from "react";
import Link from "next/link";
import { 
  Accordion,
} from "@/ds/components/accordion";
import { CodeBlock } from "@/ds/components/code-block";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ds/components/card";

export default function AccordionPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Design System
        </Link>
        <h1 className="text-3xl font-bold mt-2">Accordion</h1>
        <p className="text-muted-foreground mt-2">
        Simplified API for the Accordion component, allowing you to define elements and their content in one go.
        </p>
      </div>

      {/* Introduction */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Introduction</h2>
        <Card>
          <CardHeader>
            <CardTitle>Simplified API</CardTitle>
            <CardDescription>
              The Accordion component offers a simpler API for creating accordions without having to define AccordionItem, AccordionTrigger and AccordionContent separately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock 
              code={`// Example of using Accordion
<Accordion
  items={[
    {
      value: "item-1",
      trigger: "Element 1",
      content: <p>Content of element 1</p>
    },
    {
      value: "item-2",
      trigger: "Element 2",
      content: <p>Content of element 2</p>
    }
  ]}
  variant="default"
  triggerSize="default"
/>`} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Base example */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Base example</h2>
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <Accordion
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
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Accordion
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
/>`} 
          />
        </div>
      </div>

      {/* Variants */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Variants</h2>
        <div className="grid grid-cols-1 gap-8">
          {["default", "bordered", "card"].map(variant => (
            <div key={variant} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Variant: {variant}</strong>
              </p>
              <div className="mb-4">
                <Accordion
                  itemVariant={variant as any}
                  items={[
                    {
                      value: "item-1",
                      trigger: `Element 1 (variant ${variant})`,
                      content: <p>Content with variant {variant}</p>
                    },
                    {
                      value: "item-2",
                      trigger: `Element 2 (variant ${variant})`,
                      content: <p>Content with variant {variant}</p>
                    }
                  ]}
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Accordion
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

      {/* Trigger sizes */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Trigger sizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["default", "sm", "lg"].map(size => (
            <div key={size} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Trigger Size: {size}</strong>
              </p>
              <div className="mb-4">
                <Accordion
                  triggerSize={size as any}
                  items={[
                    {
                      value: "item-1",
                      trigger: `Element 1 (size ${size})`,
                      content: <p>Content with size {size}</p>
                    },
                    {
                      value: "item-2",
                      trigger: `Element 2 (size ${size})`,
                      content: <p>Content with size {size}</p>
                    }
                  ]}
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Accordion
  triggerSize="${size}"
  items={[
    {
      value: "item-1",
      trigger: "Element 1 (size ${size})",
      content: <p>Content with size {size}</p>
    },
    {
      value: "item-2",
      trigger: "Element 2 (size ${size})",
      content: <p>Content with size {size}</p>
    }
  ]}
/>`} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Trigger styles */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Trigger styles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["default", "filled", "underlined", "ghost"].map(style => (
            <div key={style} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Trigger Style: {style}</strong>
              </p>
              <div className="mb-4">
                <Accordion
                  triggerVariant={style as any}
                  items={[
                    {
                      value: "item-1",
                      trigger: `Element 1 (style ${style})`,
                      content: <p>Content with trigger style {style}</p>
                    },
                    {
                      value: "item-2",
                      trigger: `Element 2 (style ${style})`,
                      content: <p>Content with trigger style {style}</p>
                    }
                  ]}
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Accordion
  triggerVariant="${style}"
  items={[
    {
      value: "item-1",
      trigger: "Element 1 (style ${style})",
      content: <p>Content with trigger style ${style}</p>
    },
    {
      value: "item-2",
      trigger: "Element 2 (style ${style})",
      content: <p>Content with trigger style ${style}</p>
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
          {["default", "indented", "separated"].map(style => (
            <div key={style} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Content Style: {style}</strong>
              </p>
              <div className="mb-4">
                <Accordion
                  contentVariant={style as any}
                  items={[
                    {
                      value: "item-1",
                      trigger: `Element 1 (content ${style})`,
                      content: <p>Content with style {style}</p>
                    },
                    {
                      value: "item-2",
                      trigger: `Element 2 (content ${style})`,
                      content: <p>Content with style {style}</p>
                    }
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

      {/* Content padding */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Content padding</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["default", "sm", "md", "lg"].map(padding => (
            <div key={padding} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Content Padding: {padding}</strong>
              </p>
              <div className="mb-4">
                <Accordion
                  contentPadding={padding as any}
                  items={[
                    {
                      value: "item-1",
                      trigger: `Element 1 (padding ${padding})`,
                      content: <p>Content with padding {padding}</p>
                    },
                    {
                      value: "item-2",
                      trigger: `Element 2 (padding ${padding})`,
                      content: <p>Content with padding {padding}</p>
                    }
                  ]}
                />
              </div>
              <CodeBlock 
                className="mt-2"
                code={`<Accordion
  contentPadding="${padding}"
  items={[
    {
      value: "item-1",
      trigger: "Element 1 (padding ${padding})",
      content: <p>Content with padding ${padding}</p>
    },
    {
      value: "item-2",
      trigger: "Element 2 (padding ${padding})",
      content: <p>Content with padding ${padding}</p>
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
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Type: multiple</strong> - Allows opening multiple elements at the same time
          </p>
          <div className="mb-4">
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
            />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Accordion
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
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <Accordion
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
            />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Accordion
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
        <div className="p-4 border rounded-lg">
          <div className="mb-4">
            <Accordion
              itemVariant="card"
              triggerVariant="filled"
              triggerSize="lg"
              contentVariant="filled"
              contentPadding="md"
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
            />
          </div>
          <CodeBlock 
            className="mt-2"
            code={`<Accordion
  itemVariant="card"
  triggerVariant="filled"
  triggerSize="lg"
  contentVariant="filled"
  contentPadding="md"
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
        <Card>
          <CardHeader>
            <CardTitle>Accordion Props</CardTitle>
            <CardDescription>
              Props accepted by the Accordion component
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Prop</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-left py-2 px-4">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">items</td>
                    <td className="py-2 px-4 text-sm">AccordionItem[]</td>
                    <td className="py-2 px-4 text-sm">Array of objects defining the items and their content</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">type</td>
                    <td className="py-2 px-4 text-sm">"single" | "multiple"</td>
                    <td className="py-2 px-4 text-sm">Type of accordion (single element open or multiple)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">defaultValue</td>
                    <td className="py-2 px-4 text-sm">string | string[]</td>
                    <td className="py-2 px-4 text-sm">Default value(s) of the open element</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">value</td>
                    <td className="py-2 px-4 text-sm">string | string[]</td>
                    <td className="py-2 px-4 text-sm">Value(s) of the open element (controlled mode)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">onValueChange</td>
                    <td className="py-2 px-4 text-sm">(value: string | string[]) => void</td>
                    <td className="py-2 px-4 text-sm">Function called when the element changes</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">collapsible</td>
                    <td className="py-2 px-4 text-sm">boolean</td>
                    <td className="py-2 px-4 text-sm">If the open element can be closed (type="single")</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">variant</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Style of the accordion (default, bordered, card)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">triggerStyle</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Style of the trigger (default, filled, underlined, ghost)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">triggerSize</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Size of the trigger (default, sm, lg)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">contentStyle</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Style of the content (default, indented, separated)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">contentPadding</td>
                    <td className="py-2 px-4 text-sm">string</td>
                    <td className="py-2 px-4 text-sm">Padding of the content (default, sm, md, lg)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
