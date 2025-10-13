"use client";

import React from "react";
import { ComponentLayout } from "@/components/layout/component-layout";
import { ComponentSection } from "@/components/layout/component-section";
import { MemberList } from "@/ds/components/composite/member-list";
import { Tabs } from "@/ds/components/tabs";
import { CodeBlock } from "@/components/ui/code-block";

export default function MemberListPage() {
    return (
        <ComponentLayout
            title="Member List"
            description="List component for displaying member information with optional actions and pagination."
            isComposite={true}
        >
            <ComponentSection title="Usage" id="usage">
                <p className="text-muted-foreground mb-4">
                    The Member List component displays a list of members with their information,
                    optional actions, and pagination. It&apos;s designed to be used in contexts
                    where you need to show a list of users or members.
                </p>

                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-medium">Default</h3>
                        <div className="flex flex-col gap-4">
                            <MemberList
                                members={[
                                    {
                                        id: "1",
                                        name: "Alice Smith",
                                        initials: "AS",
                                        role: "Admin",
                                        status: "active",
                                        actions: [
                                            {
                                                label: "View",
                                                onClick: memberId =>
                                                    alert(`Member ${memberId} viewed`),
                                            },
                                        ],
                                    },
                                    {
                                        id: "2",
                                        name: "Bob Johnson",
                                        initials: "BJ",
                                        role: "Member",
                                        status: "pending",
                                        actions: [
                                            {
                                                label: "View",
                                                onClick: memberId =>
                                                    alert(`Member ${memberId} viewed`),
                                            },
                                        ],
                                    },
                                    {
                                        id: "3",
                                        name: "Carol White",
                                        initials: "CW",
                                        role: "Member",
                                        status: "inactive",
                                        actions: [
                                            {
                                                label: "View",
                                                onClick: memberId =>
                                                    alert(`Member ${memberId} viewed`),
                                            },
                                        ],
                                    },
                                ]}
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
                                    <MemberList
                                        title="Team Members"
                                        members={[
                                            {
                                                id: "1",
                                                name: "John Doe",
                                                initials: "JD",
                                                role: "Admin",
                                                status: "active",
                                                actions: [
                                                    {
                                                        label: "View",
                                                        onClick: id => alert(`View member ${id}`),
                                                    },
                                                ],
                                            },
                                            {
                                                id: "2",
                                                name: "Jane Smith",
                                                initials: "JS",
                                                role: "Editor",
                                                status: "pending",
                                                actions: [
                                                    {
                                                        label: "View",
                                                        onClick: id => alert(`View member ${id}`),
                                                    },
                                                ],
                                            },
                                            {
                                                id: "3",
                                                name: "Bob Johnson",
                                                initials: "BJ",
                                                role: "Viewer",
                                                status: "inactive",
                                                actions: [
                                                    {
                                                        label: "View",
                                                        onClick: id => alert(`View member ${id}`),
                                                    },
                                                ],
                                            },
                                        ]}
                                        showAddMember
                                        onAddMember={() => alert("Add member clicked")}
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
                                    code={`<MemberList
  title="Team Members"
  members={[
    {
      id: "1",
      name: "John Doe",
      initials: "JD",
      role: "Admin",
      status: "active",
      actions: [
        {
          label: "View",
          onClick: (id) => alert(\`View member \${id}\`),
        },
      ],
    },
    {
      id: "2",
      name: "Jane Smith",
      initials: "JS",
      role: "Editor",
      status: "pending",
      actions: [
        {
          label: "View",
          onClick: (id) => alert(\`View member \${id}\`),
        },
      ],
    },
    {
      id: "3",
      name: "Bob Johnson",
      initials: "BJ",
      role: "Viewer",
      status: "inactive",
      actions: [
        {
          label: "View",
          onClick: (id) => alert(\`View member \${id}\`),
        },
      ],
    },
  ]}
  showAddMember
  onAddMember={() => alert("Add member clicked")}
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
                            value: "memberlist",
                            label: "MemberList",
                            content: (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="border px-4 py-2 text-left">Prop</th>
                                                <th className="border px-4 py-2 text-left">Type</th>
                                                <th className="border px-4 py-2 text-left">
                                                    Default
                                                </th>
                                                <th className="border px-4 py-2 text-left">
                                                    Description
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    title
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    string
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    undefined
                                                </td>
                                                <td className="border px-4 py-2">
                                                    Optional title for the member list
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    members
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    Member[]
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    []
                                                </td>
                                                <td className="border px-4 py-2">
                                                    Array of member objects to display
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    showAddMember
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    boolean
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    false
                                                </td>
                                                <td className="border px-4 py-2">
                                                    Whether to show the add member button
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    onAddMember
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    {"() => void"}
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    undefined
                                                </td>
                                                <td className="border px-4 py-2">
                                                    Callback when add member button is clicked
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    emptyState
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    {"React.ReactNode"}
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    undefined
                                                </td>
                                                <td className="border px-4 py-2">
                                                    Custom empty state when no members are present
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    maxVisible
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    number
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    undefined
                                                </td>
                                                <td className="border px-4 py-2">
                                                    Maximum number of members to display before
                                                    pagination
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            ),
                        },
                        {
                            value: "member",
                            label: "Member",
                            content: (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="border px-4 py-2 text-left">Prop</th>
                                                <th className="border px-4 py-2 text-left">Type</th>
                                                <th className="border px-4 py-2 text-left">
                                                    Default
                                                </th>
                                                <th className="border px-4 py-2 text-left">
                                                    Description
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    id
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    string
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    required
                                                </td>
                                                <td className="border px-4 py-2">
                                                    Unique identifier for the member
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    name
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    string
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    required
                                                </td>
                                                <td className="border px-4 py-2">
                                                    Name of the member
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    avatarUrl
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    string
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    undefined
                                                </td>
                                                <td className="border px-4 py-2">
                                                    URL to the member&apos;s avatar image
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    initials
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    string
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    undefined
                                                </td>
                                                <td className="border px-4 py-2">
                                                    Initials to display when no avatar is available
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    role
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    string
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    undefined
                                                </td>
                                                <td className="border px-4 py-2">
                                                    Role of the member
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    status
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    {'"active" | "pending" | "inactive"'}
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    undefined
                                                </td>
                                                <td className="border px-4 py-2">
                                                    Status of the member
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    actions
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    Array
                                                </td>
                                                <td className="border px-4 py-2 font-mono text-sm">
                                                    undefined
                                                </td>
                                                <td className="border px-4 py-2">
                                                    Actions that can be performed on this member
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
