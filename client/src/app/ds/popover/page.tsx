"use client";

import * as React from "react";
import { Popover } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/ds/components";
import { Settings04 } from "@untitled-ui/icons-react";

export default function PopoverPage() {
    return (
        <div className="space-y-12">
            {/* Introduction */}
            <section>
                <h1 className="text-3xl font-bold mb-4">Popover</h1>
                <p className="text-muted-foreground mb-6">
                    Le composant <code>Popover</code> permet d’afficher du contenu contextuel lié à
                    un élément déclencheur.
                </p>
            </section>

            {/* Examples */}
            <section className="space-y-8">
                <h2 className="text-2xl font-semibold mb-4">Exemples</h2>

                {/* Example 1 */}
                <Card
                    title="Popover basique"
                    description="Un popover centré avec un petit contenu textuel."
                    content={
                        <Popover
                            trigger={<Button leftIcon={<Settings04 />} />}
                            content={<div className="p-4">Contenu du popover</div>}
                        />
                    }
                    footer={
                        <CodeBlock
                            code={`<Popover
  trigger={<Button leftIcon={<Settings04 />} />}
  content={<div className="p-4">Contenu du popover</div>}
/>`}
                            language="tsx"
                        />
                    }
                />

                {/* Example 2 */}
                <Card
                    title="Popover avec formulaire"
                    description="Un formulaire peut être intégré directement dans le popover."
                    content={
                        <Popover
                            trigger={<Button>Login</Button>}
                            content={
                                <form className="p-4 space-y-3">
                                    <Input placeholder="Email" />
                                    <Input type="password" placeholder="Password" />
                                    <Button className="w-full">Submit</Button>
                                </form>
                            }
                            align="start"
                            sideOffset={8}
                        />
                    }
                    footer={
                        <CodeBlock
                            code={`<Popover
  trigger={<Button>Login</Button>}
  content={
    <form className="p-4 space-y-3">
      <Input placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Button className="w-full">Submit</Button>
    </form>
  }
  align="start"
  sideOffset={8}
/>`}
                            language="tsx"
                        />
                    }
                />
            </section>

            {/* API Reference */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">API Reference</h2>
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
                                <td className="py-2 px-4 font-medium">trigger</td>
                                <td className="py-2 px-4 text-sm">React.ReactNode</td>
                                <td className="py-2 px-4 text-sm">—</td>
                                <td className="py-2 px-4 text-sm">
                                    The element that triggers the popover.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">content</td>
                                <td className="py-2 px-4 text-sm">React.ReactNode</td>
                                <td className="py-2 px-4 text-sm">—</td>
                                <td className="py-2 px-4 text-sm">
                                    The content displayed inside the popover.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">defaultOpen?</td>
                                <td className="py-2 px-4 text-sm">boolean</td>
                                <td className="py-2 px-4 text-sm">—</td>
                                <td className="py-2 px-4 text-sm">
                                    The open state of the popover when it is initially rendered. Use
                                    this when you do not need to control its open state.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">open?</td>
                                <td className="py-2 px-4 text-sm">boolean</td>
                                <td className="py-2 px-4 text-sm">—</td>
                                <td className="py-2 px-4 text-sm">
                                    The controlled open state of the popover. Must be used in
                                    conjunction with <code>onOpenChange</code>.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">onOpenChange?</td>
                                <td className="py-2 px-4 text-sm">
                                    function: <code>(open: boolean) =&gt; void</code>
                                </td>
                                <td className="py-2 px-4 text-sm">—</td>
                                <td className="py-2 px-4 text-sm">
                                    Event handler called when the open state of the popover changes.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">align?</td>
                                <td className="py-2 px-4 text-sm">
                                    <code>{`"center" | "start" | "end"`}</code>
                                </td>
                                <td className="py-2 px-4 text-sm">
                                    <code>{`"center"`}</code>
                                </td>
                                <td className="py-2 px-4 text-sm">
                                    The alignment of the content relative to the trigger.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">sideOffset?</td>
                                <td className="py-2 px-4 text-sm">number</td>
                                <td className="py-2 px-4 text-sm">4</td>
                                <td className="py-2 px-4 text-sm">
                                    The distance between the trigger and the popover content.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">triggerClassName?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">—</td>
                                <td className="py-2 px-4 text-sm">
                                    Custom CSS class applied to the trigger element.
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 font-medium">contentClassName?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">—</td>
                                <td className="py-2 px-4 text-sm">
                                    Custom CSS class applied to the popover content.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
