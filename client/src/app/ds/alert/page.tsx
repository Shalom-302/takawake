"use client";
import React from "react";
import Link from "next/link";

import { CodeBlock } from "@/ds/components/code-block";
import { Alert, AlertSizes, AlertVariants } from "@/components/ui/alert";

export default function AlertPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <Link href="/ds" className="text-primary hover:underline mb-4 inline-block">
                    ← Back to Design System
                </Link>
                <h1 className="text-3xl font-bold mt-2">Alert</h1>
                <p className="text-muted-foreground mt-2">
                    Alert component is used to display contextual feedback messages with support for
                    different variants, sizes, actions and dismissible mode.
                </p>
            </div>

            {/* Base example */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Base example</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <Alert
                            title="Default! Your changes have been saved"
                            description="This is an alert with icon, title and description."
                        />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`<Alert
  title="Default! Your changes have been saved"
  description="This is an alert with icon, title and description."
/>`}
                    />
                </div>
            </div>

            {/* Variants */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Variants</h2>
                <div className="grid grid-cols-1 gap-8">
                    {["brand", "gray", "error", "warning", "success"].map(variant => (
                        <div key={variant} className="p-4 border border-tertiary rounded-lg">
                            <p className="text-sm text-muted-foreground mb-4">
                                <strong>Variant: {variant}</strong>
                            </p>
                            <div className="mb-4">
                                <Alert
                                    variant={variant as AlertVariants}
                                    title={`${variant.charAt(0).toUpperCase() + variant.slice(1)}!`}
                                    description={`This is a ${variant} alert.`}
                                />
                            </div>
                            <CodeBlock
                                className="mt-2"
                                code={`<Alert
  variant="${variant}"
  title="${variant.charAt(0).toUpperCase() + variant.slice(1)}!"
  description="This is a ${variant} alert."
/>`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Sizes */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Sizes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {["floating", "with-full"].map(size => (
                        <div key={size} className="p-4 border border-tertiary rounded-lg">
                            <p className="text-sm text-muted-foreground mb-4">
                                <strong>Size: {size}</strong>
                            </p>
                            <div className="mb-4">
                                <Alert
                                    size={size as AlertSizes}
                                    variant="success"
                                    title="Success!"
                                    description={`This is an alert with size "${size}".`}
                                />
                            </div>
                            <CodeBlock
                                className="mt-2"
                                code={`<Alert
  size="${size}"
  variant="success"
  title="Success!"
  description="This is an alert with size '${size}'."
/>`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Dismissible */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Dismissible</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <Alert
                            dismissible
                            title="Closable alert"
                            description="You can dismiss this alert."
                        />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`<Alert
  dismissible
  title="Closable alert"
  description="You can dismiss this alert."
/>`}
                    />
                </div>
            </div>

            {/* With actions */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">With actions</h2>
                <div className="p-4 border border-tertiary rounded-lg">
                    <div className="mb-4">
                        <Alert
                            title="Actionable alert"
                            description="This alert has actions."
                            firstActionLabel="Undo"
                            firstActionClick={() => console.log("Undo clicked")}
                            secondActionLabel="Retry"
                            secondActionClick={() => console.log("Retry clicked")}
                        />
                    </div>
                    <CodeBlock
                        className="mt-2"
                        code={`<Alert
  title="Actionable alert"
  description="This alert has actions."
  firstActionLabel="Undo"
  firstActionClick={() => console.log("Undo clicked")}
  secondActionLabel="Retry"
  secondActionClick={() => console.log("Retry clicked")}
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
                                <td className="py-2 px-4 font-medium">title</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Main title of the alert</td>
                            </tr>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">description?</td>
                                <td className="py-2 px-4 text-sm">React.ReactNode</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Additional text or content</td>
                            </tr>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">variant?</td>
                                <td className="py-2 px-4 text-sm">{`"default" | "brand" | "gray" | "error" | "warning" | "success"`}</td>
                                <td className="py-2 px-4 text-sm">{"default"}</td>
                                <td className="py-2 px-4 text-sm">Defines the alert style</td>
                            </tr>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">size?</td>
                                <td className="py-2 px-4 text-sm">{`"floating" | "with-full"`}</td>
                                <td className="py-2 px-4 text-sm">{"floating"}</td>
                                <td className="py-2 px-4 text-sm">Defines layout size</td>
                            </tr>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">icon?</td>
                                <td className="py-2 px-4 text-sm">React.ReactElement</td>
                                <td className="py-2 px-4 text-sm">
                                    {"<InfoCircle /> | <CheckCircle />"}
                                </td>
                                <td className="py-2 px-4 text-sm">Custom icon</td>
                            </tr>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">firstActionLabel?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Label for first action</td>
                            </tr>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">firstActionClick?</td>
                                <td className="py-2 px-4 text-sm">() =&gt; void</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Callback for first action</td>
                            </tr>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">secondActionLabel?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Label for second action</td>
                            </tr>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">secondActionClick?</td>
                                <td className="py-2 px-4 text-sm">() =&gt; void</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Callback for second action</td>
                            </tr>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">dismissible?</td>
                                <td className="py-2 px-4 text-sm">boolean</td>
                                <td className="py-2 px-4 text-sm">false</td>
                                <td className="py-2 px-4 text-sm">
                                    Whether the alert can be dismissed
                                </td>
                            </tr>
                            <tr className="border-b border-tertiary ">
                                <td className="py-2 px-4 font-medium">className?</td>
                                <td className="py-2 px-4 text-sm">string</td>
                                <td className="py-2 px-4 text-sm">-</td>
                                <td className="py-2 px-4 text-sm">Additional CSS classes</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
