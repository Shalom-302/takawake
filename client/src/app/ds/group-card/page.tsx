"use client";

import React from "react";
import { ComponentLayout } from "@/components/layout/component-layout";
import { ComponentSection } from "@/components/layout/component-section";
import { SavingsGroupCard } from "@/ds/components/composite/savings-group-card";
import { Tabs } from "@/ds/components/tabs";
import { CodeBlock } from "@/components/ui/code-block";

export default function GroupCardPage() {
    return (
        <ComponentLayout
            title="Group Card"
            description="Card component for displaying savings group information with status and actions."
            isComposite={true}
        >
            <ComponentSection title="Usage" id="usage">
                <p className="text-muted-foreground mb-4">
                    The Group Card component is designed to display savings group information in a
                    structured format, including status indicators and action buttons.
                </p>

                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-medium">Default</h3>
                        <div className="flex flex-col gap-4">
                            <SavingsGroupCard
                                title="Savings Group Example"
                                manager={{
                                    name: "John Doe",
                                    initials: "JD",
                                }}
                                members={[
                                    { id: "1", name: "Alice Smith", initials: "AS" },
                                    { id: "2", name: "Bob Johnson", initials: "BJ" },
                                    { id: "3", name: "Carol White", initials: "CW" },
                                ]}
                                onDetailsClick={() => alert("Details clicked")}
                                onContributeClick={() => alert("Contribute clicked")}
                            />
                        </div>
                    </div>
                </div>
            </ComponentSection>

            <ComponentSection title="Examples" id="examples">
                <Tabs
                    tabs={[
                        {
                            value: "preview",
                            label: "Preview",
                            content: (
                                <div className="rounded-md border p-6">
                                    <SavingsGroupCard
                                        title="Savings Group Example"
                                        manager={{
                                            name: "John Doe",
                                            initials: "JD",
                                        }}
                                        members={[
                                            { id: "1", name: "Alice Smith", initials: "AS" },
                                            { id: "2", name: "Bob Johnson", initials: "BJ" },
                                            { id: "3", name: "Carol White", initials: "CW" },
                                        ]}
                                        onDetailsClick={() => alert("Details clicked")}
                                        onContributeClick={() => alert("Contribute clicked")}
                                    />
                                </div>
                            ),
                        },
                        {
                            value: "code",
                            label: "Code",
                            content: (
                                <CodeBlock
                                    language="tsx"
                                    code={`<SavingsGroupCard 
  title="Savings Group Example"
  manager={{
    name: "John Doe",
    initials: "JD"
  }}
  members={[
    { id: "1", name: "Alice Smith", initials: "AS" },
    { id: "2", name: "Bob Johnson", initials: "BJ" },
    { id: "3", name: "Carol White", initials: "CW" }
  ]}
  onDetailsClick={() => alert("Details clicked")}
  onContributeClick={() => alert("Contribute clicked")}
/>`}
                                />
                            ),
                        },
                    ]}
                />
            </ComponentSection>

            <ComponentSection title="Props" id="props">
                <Tabs
                    tabs={[
                        {
                            value: "savingsgroupcard",
                            label: "SavingsGroupCard",
                            content: (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="py-2 px-4 text-left font-medium">
                                                    Name
                                                </th>
                                                <th className="py-2 px-4 text-left font-medium">
                                                    Type
                                                </th>
                                                <th className="py-2 px-4 text-left font-medium">
                                                    Default
                                                </th>
                                                <th className="py-2 px-4 text-left font-medium">
                                                    Description
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="py-2 px-4 font-mono text-sm">
                                                    title
                                                </td>
                                                <td className="py-2 px-4 font-mono text-sm">
                                                    string
                                                </td>
                                                <td className="py-2 px-4 font-mono text-sm">
                                                    required
                                                </td>
                                                <td className="py-2 px-4">
                                                    Title of the savings group
                                                </td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-2 px-4 font-mono text-sm">
                                                    manager
                                                </td>
                                                <td className="py-2 px-4 font-mono text-sm">
                                                    {"{ name: string, initials: string }"}
                                                </td>
                                                <td className="py-2 px-4 font-mono text-sm">
                                                    required
                                                </td>
                                                <td className="py-2 px-4">
                                                    Manager information for the group
                                                </td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-2 px-4 font-mono text-sm">
                                                    members
                                                </td>
                                                <td className="py-2 px-4 font-mono text-sm">
                                                    {
                                                        "{ id: string, name: string, initials: string }[]"
                                                    }
                                                </td>
                                                <td className="py-2 px-4 font-mono text-sm">[]</td>
                                                <td className="py-2 px-4">
                                                    Array of members in the group
                                                </td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-2 px-4 font-mono text-sm">
                                                    onDetailsClick
                                                </td>
                                                <td className="py-2 px-4 font-mono text-sm">
                                                    {"() => void"}
                                                </td>
                                                <td className="py-2 px-4 font-mono text-sm">
                                                    required
                                                </td>
                                                <td className="py-2 px-4">
                                                    Handler called when the details button is
                                                    clicked
                                                </td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-2 px-4 font-mono text-sm">
                                                    onContributeClick
                                                </td>
                                                <td className="py-2 px-4 font-mono text-sm">
                                                    {"() => void"}
                                                </td>
                                                <td className="py-2 px-4 font-mono text-sm">
                                                    required
                                                </td>
                                                <td className="py-2 px-4">
                                                    Handler called when the contribute button is
                                                    clicked
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            ),
                        },
                    ]}
                />
            </ComponentSection>
        </ComponentLayout>
    );
}
