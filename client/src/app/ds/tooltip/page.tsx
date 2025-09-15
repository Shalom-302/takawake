"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Tooltip } from "@/components/ui/tootilp";
import { CodeBlock } from "@/ds/components";
import { HelpCircle } from "@untitled-ui/icons-react";

export default function TooltipPage() {
    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="space-y-4">
                <Link
                    href="/docs/overview"
                    className="inline-flex items-center text-sm text-muted-foreground hover:underline"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Overview
                </Link>
                <h1 className="text-3xl font-bold">Tooltip</h1>
                <p className="text-muted-foreground">
                    A floating element that displays informative text when triggered by hover,
                    focus, or click. Supports variants, sizes, arrows, controlled state, and
                    positioning options.
                </p>
            </div>

            {/* Examples */}
            <section className="space-y-8">
                <h2 className="text-xl font-semibold">Examples</h2>

                {/* Basic */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic</h3>
                    <Tooltip trigger={<HelpCircle />} title="Basic tooltip title" />
                    <CodeBlock
                        code={`<Tooltip trigger={<HelpCircle  />} title="Basic tooltip title" />`}
                    />
                </div>

                {/* With Arrow */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">With Arrow</h3>
                    <Tooltip
                        trigger={<HelpCircle />}
                        title="Tooltip with arrow"
                        // variant={"secondary"}
                        arrow={true}
                    />
                    <CodeBlock
                        code={`<Tooltip trigger={<HelpCircle  />} title="Tooltip with arrow" arrow={true} />`}
                    />
                </div>

                {/* Sides and Alignment */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Positioning</h3>
                    <div className="flex gap-4 flex-wrap">
                        <Tooltip trigger={<HelpCircle />} title="Tooltip on top" side="top" />
                        <Tooltip trigger={<HelpCircle />} title="Tooltip on right" side="right" />
                        <Tooltip trigger={<HelpCircle />} title="Tooltip on bottom" side="bottom" />
                        <Tooltip trigger={<HelpCircle />} title="Tooltip on left" side="left" />
                        <Tooltip
                            trigger={<HelpCircle />}
                            title="Aligned start"
                            side="top"
                            align="start"
                        />
                        <Tooltip
                            trigger={<HelpCircle />}
                            title="Aligned end"
                            side="top"
                            align="end"
                        />
                    </div>
                    <CodeBlock
                        code={`<Tooltip trigger={<HelpCircle />} title="Tooltip on top" side="top" />
<Tooltip trigger={<HelpCircle />} title="Tooltip on right" side="right" />
<Tooltip trigger={<HelpCircle />} title="Tooltip on bottom" side="bottom" />
<Tooltip trigger={<HelpCircle />} title="Tooltip on left" side="left" />
<Tooltip trigger={<HelpCircle />} title="Aligned start" side="top" align="start" />
<Tooltip trigger={<HelpCircle />} title="Aligned end" side="top" align="end" />`}
                    />
                </div>
            </section>

            {/* API Reference */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">API Reference</h2>
                <p className="text-sm text-muted-foreground">
                    All props are specific to the Tooltip component.
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
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
                                <td className="py-2 px-4">ReactNode</td>
                                <td className="py-2 px-4">—</td>
                                <td className="py-2 px-4">Element that triggers the tooltip.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">title</td>
                                <td className="py-2 px-4">string</td>
                                <td className="py-2 px-4">—</td>
                                <td className="py-2 px-4">The tooltip title.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">side</td>
                                <td className="py-2 px-4">{`"top" | "right" | "bottom" | "left"`}</td>
                                <td className="py-2 px-4">{`"top"`}</td>
                                <td className="py-2 px-4">
                                    Side of the trigger to position the tooltip.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">align</td>
                                <td className="py-2 px-4">{`"start" | "center" | "end"`}</td>
                                <td className="py-2 px-4">{`"center"`}</td>
                                <td className="py-2 px-4">Alignment relative to the trigger.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">sideOffset</td>
                                <td className="py-2 px-4">number</td>
                                <td className="py-2 px-4">6</td>
                                <td className="py-2 px-4">
                                    Offset distance from the trigger element.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">alignOffset</td>
                                <td className="py-2 px-4">number</td>
                                <td className="py-2 px-4">0</td>
                                <td className="py-2 px-4">Offset along the alignment axis.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">arrow</td>
                                <td className="py-2 px-4">boolean</td>
                                <td className="py-2 px-4">false</td>
                                <td className="py-2 px-4">Whether to display the arrow.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">variant</td>
                                <td className="py-2 px-4">{`"default" | "secondary" | "outline"`}</td>
                                <td className="py-2 px-4">{`"default"`}</td>
                                <td className="py-2 px-4">Visual style of the tooltip.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">size</td>
                                <td className="py-2 px-4">{`"sm" | "md" | "lg"`}</td>
                                <td className="py-2 px-4">{`"sm"`}</td>
                                <td className="py-2 px-4">Size of the tooltip title and arrow.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">maxWidth</td>
                                <td className="py-2 px-4">{`"xs" | "sm" | "md" | "lg" | "none"`}</td>
                                <td className="py-2 px-4">{`"xs"`}</td>
                                <td className="py-2 px-4">Maximum width of the tooltip title.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">delayDuration</td>
                                <td className="py-2 px-4">number</td>
                                <td className="py-2 px-4">300</td>
                                <td className="py-2 px-4">
                                    Delay before showing the tooltip in milliseconds.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">closeDelay</td>
                                <td className="py-2 px-4">number</td>
                                <td className="py-2 px-4">0</td>
                                <td className="py-2 px-4">
                                    Delay before closing the tooltip in milliseconds.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">open</td>
                                <td className="py-2 px-4">boolean</td>
                                <td className="py-2 px-4">—</td>
                                <td className="py-2 px-4">Controlled open state.</td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">defaultOpen</td>
                                <td className="py-2 px-4">boolean</td>
                                <td className="py-2 px-4">false</td>
                                <td className="py-2 px-4">
                                    Initial open state for uncontrolled tooltip.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">onOpenChange</td>
                                <td className="py-2 px-4">(open: boolean) =&gt; void</td>
                                <td className="py-2 px-4">—</td>
                                <td className="py-2 px-4">
                                    Callback fired when tooltip open state changes.
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary">
                                <td className="py-2 px-4 font-medium">contentClassName</td>
                                <td className="py-2 px-4">string</td>
                                <td className="py-2 px-4">-</td>
                                <td className="py-2 px-4">
                                    Custom classes applied to the tooltip title.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
